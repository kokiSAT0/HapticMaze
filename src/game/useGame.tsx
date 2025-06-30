import { createContext, useContext, useReducer, type ReactNode } from 'react';
import {
  wallSet,
  canMove,
  getHitWall,
  nextPosition,
  spawnEnemies,
  updateEnemyPaths,
  updatePlayerPath,
  decayHitMap,
  randomCell,
  biasedPickGoal,
  allCells,
  inSight,
  shouldChangeMap,
} from './utils';
import { getEnemyMover, selectEnemyBehavior, type EnemyBehavior } from './enemy';
import { loadMaze } from './loadMaze';
import type { MazeData, Vec2, Dir } from '@/src/types/maze';
import type { Enemy, EnemyCounts } from '@/src/types/enemy';

// rawMaze: JSON そのままのデータ
type MazeSets = MazeData & { v_walls: Set<string>; h_walls: Set<string> };

// MazeData から壁情報を Set 化して検索を高速にする
function prepMaze(m: MazeData): MazeSets {
  return {
    ...m,
    v_walls: wallSet(m.v_walls),
    h_walls: wallSet(m.h_walls),
  };
}

// EnemyCounts から Enemy 配列を生成するヘルパー
function createEnemies(
  counts: EnemyCounts,
  maze: MazeData,
  biasedSpawn: boolean,
): Enemy[] {
  const enemies: Enemy[] = [];
  const exclude = new Set<string>();
  spawnEnemies(counts.random, maze, Math.random, exclude, biasedSpawn).forEach(
    (p) => {
      enemies.push({
        pos: p,
      // ミニマップで見えるようデフォルトで true にする
      // プレイヤーが追跡できるようにするため
      visible: true,
      interval: 1,
      repeat: 1,
      cooldown: 0,
      target: null,
      behavior: 'random',
      kind: 'random',
    });
  });
  spawnEnemies(counts.slow, maze, Math.random, exclude, biasedSpawn).forEach((p) => {
    enemies.push({
      pos: p,
      visible: true,
      interval: 2,
      repeat: 1,
      // interval が 2 のため初期クールダウンを 1 にして偶数ターンで動くようにする
      cooldown: 1,
      target: null,
      behavior: 'sight',
      kind: 'slow',
    });
  });
  spawnEnemies(counts.sight, maze, Math.random, exclude, biasedSpawn).forEach((p) => {
    enemies.push({
      pos: p,
      visible: true,
      interval: 1,
      repeat: 1,
      cooldown: 0,
      target: null,
      behavior: 'sight',
      kind: 'sight',
    });
  });
  spawnEnemies(counts.fast ?? 0, maze, Math.random, exclude, biasedSpawn).forEach((p) => {
    enemies.push({
      pos: p,
      visible: true,
      interval: 1,
      repeat: 2,
      cooldown: 0,
      target: null,
      behavior: 'smart',
      kind: 'fast',
    });
  });
  return enemies;
}

/**
 * ランダムなスタートとゴールを含む MazeData を作成するヘルパー。
 */
function createFirstStage(
  base: MazeData,
  counts: EnemyCounts = {
    // 起動時の敵数はすべて0にする
    random: 0,
    slow: 0,
    sight: 0,
    fast: 0,
  },
  enemyPathLength: number = 4,
  playerPathLength: number = Infinity,
  wallLifetime: number = Infinity,
  enemyCountsFn?: (stage: number) => EnemyCounts,
  wallLifetimeFn?: (stage: number) => number,
  biasedSpawn: boolean = true,
  levelId?: string,
): State {
  const visited = new Set<string>();
  const start = randomCell(base.size);
  const candidates = allCells(base.size).filter(
    (c) => c.x !== start.x || c.y !== start.y,
  );
  const goal = biasedPickGoal(start, candidates);
  const maze: MazeData = {
    ...base,
    start: [start.x, start.y],
    goal: [goal.x, goal.y],
  };
  //実際にゴールに到達した時に追加されるので
  //現状では visited は空のまま
  const finalStage = visited.size + 1 === base.size * base.size;
  const stageCounts = enemyCountsFn ? enemyCountsFn(1) : counts;
  return initState(
    maze,
    1,
    visited,
    finalStage,
    undefined,
    undefined,
    stageCounts,
    enemyPathLength,
    playerPathLength,
    wallLifetime,
    enemyCountsFn,
    wallLifetimeFn,
    biasedSpawn,
    levelId,
  );
}

/**
 * 前ステージのゴールを次ステージのスタートとし、
 * 未使用マスから新たなゴールを決めて状態を更新する。
 */
function nextStageState(state: State): State {
  const size = state.mazeRaw.size;
  // STAGE_PER_MAP の倍数ステージクリアごとに迷路を変更する
  const changeMap = shouldChangeMap(state.stage);
  // 迷路を継続する場合は同じレイアウトを使う
  const base = changeMap ? loadMaze(size) : state.mazeRaw;
  // 次のスタート地点は前回ゴールしたマス
  const start = { x: state.mazeRaw.goal[0], y: state.mazeRaw.goal[1] };
  const visited = new Set(state.visitedGoals);
  //前ステージで到達したマスを追加
  visited.add(`${start.x},${start.y}`);
  // 未使用マスのみをゴール候補とする
  const cells = allCells(size).filter((c) => {
    const key = `${c.x},${c.y}`;
    if (c.x === start.x && c.y === start.y) return false;
    return !visited.has(key);
  });
  if (cells.length === 0) {
    // 候補がなければ最終ステージ
    return { ...state, finalStage: true };
  }
  const goal = biasedPickGoal(start, cells);
  const maze: MazeData = {
    ...base,
    start: [start.x, start.y],
    goal: [goal.x, goal.y],
  };
  //\u65B0\u305F\u306B\u8A2D\u5B9A\u3059\u308B\u30B4\u30FC\u30EB\u3092\u542B\u3081\u308B\u3068\u5168\u30DE\u30B9\u306E\u5229\u7528\u304C\u7D42\u308F\u308B\u304B\u3092\u5224\u5B9A
  const finalStage = visited.size + 1 === size * size;
  // 壁情報を引き継ぐかどうかを決定
  const hitV = changeMap ? new Map<string, number>() : new Map(state.hitV);
  const hitH = changeMap ? new Map<string, number>() : new Map(state.hitH);
  // ステージ数を +1 した新しい状態を返す
  const nextWallLife =
    state.wallLifetimeFn?.(state.stage + 1) ?? state.wallLifetime;
  return initState(
    maze,
    state.stage + 1,
    visited,
    finalStage,
    hitV,
    hitH,
    state.enemyCountsFn
      ? state.enemyCountsFn(state.stage + 1)
      : state.enemyCounts,
    state.enemyPathLength,
    state.playerPathLength,
    nextWallLife,
    state.enemyCountsFn,
    state.wallLifetimeFn,
    state.biasedSpawn,
    state.levelId,
  );
}

/**
 * ゲームオーバー時に最初からやり直す処理。
 * 同じ迷路レイアウトを使って 1 ステージ目を生成する。
 */
function restartRun(state: State): State {
  return createFirstStage(
    state.mazeRaw,
    state.enemyCountsFn ? state.enemyCountsFn(1) : state.enemyCounts,
    state.enemyPathLength,
    state.playerPathLength,
    state.wallLifetime,
    state.enemyCountsFn,
    state.wallLifetimeFn,
    state.biasedSpawn,
    state.levelId,
  );
}

// ゲーム状態を表す型
export interface GameState {
  pos: Vec2;
  steps: number;
  bumps: number;
  path: Vec2[];
  /** 衝突した縦壁と残りターン数 */
  hitV: Map<string, number>;
  /** 衝突した横壁と残りターン数 */
  hitH: Map<string, number>;
  enemies: Enemy[];
  /** 各敵が踏んだマスの回数を記録する */
  enemyVisited: Map<string, number>[];
  enemyPaths: Vec2[][];
  /** 敵に捕まったとき true になる */
  caught: boolean;
  /** 何ステージ目かを表すカウンタ */
  stage: number;
  /** これまでにゴールとして使ったマスの集合 */
  visitedGoals: Set<string>;
  /** 最終ステージかどうか */
  finalStage: boolean;
  /** 敵の行動パターン */
  enemyBehavior: EnemyBehavior;
  /** 敵の数設定 */
  enemyCounts: EnemyCounts;
  /** ステージごとの敵数を決める関数 */
  enemyCountsFn?: (stage: number) => EnemyCounts;
  /** 敵の軌跡を何マス分残すか */
  enemyPathLength: number;
  /** プレイヤーの軌跡を何マス分残すか */
  playerPathLength: number;
  /** 壁表示を維持するターン数 */
  wallLifetime: number;
  /** ステージ番号から壁寿命を決める関数 */
  wallLifetimeFn?: (stage: number) => number;
  /** スポーン位置をスタートから遠い場所に偏らせるか */
  biasedSpawn: boolean;
  /** 現在のレベル識別子。練習モードは undefined */
  levelId?: string;
}

// Provider が保持する全体の状態
interface State extends GameState {
  mazeRaw: MazeData;
  maze: MazeSets;
}

// MazeData から初期状態を作成
function initState(
  m: MazeData,
  stage: number,
  visitedGoals: Set<string>,
  finalStage: boolean,
  hitV: Map<string, number> = new Map(),
  hitH: Map<string, number> = new Map(),
  enemyCounts: EnemyCounts = { random: 0, slow: 0, sight: 0, fast: 0 },
  enemyPathLength: number = 4,
  playerPathLength: number = Infinity,
  wallLifetime: number = Infinity,
  enemyCountsFn?: (stage: number) => EnemyCounts,
  wallLifetimeFn?: (stage: number) => number,
  biasedSpawn: boolean = true,
): State {
  const maze = prepMaze(m);
  const enemies = createEnemies(enemyCounts, maze, biasedSpawn);
  const enemyBehavior = selectEnemyBehavior(m.size, finalStage);
  const life = wallLifetimeFn ? wallLifetimeFn(stage) : wallLifetime;
  return {
    mazeRaw: m,
    maze,
    pos: { x: m.start[0], y: m.start[1] },
    steps: 0,
    bumps: 0,
    path: [{ x: m.start[0], y: m.start[1] }],
    hitV,
    hitH,
    enemies,
    enemyVisited: enemies.map(
      (e) => new Map([[`${e.pos.x},${e.pos.y}`, 1]])
    ),
    enemyPaths: enemies.map((e) => [{ ...e.pos }]),
    caught: false,
    stage,
    visitedGoals,
    finalStage,
    enemyBehavior,
    enemyCounts,
    enemyCountsFn,
    enemyPathLength,
    playerPathLength,
    wallLifetime: life,
    wallLifetimeFn,
    biasedSpawn,
    levelId,
  };
}

// Reducer で使うアクション型
type Action =
  | { type: 'reset' }
  | { type: 'move'; dir: Dir }
  | {
      type: 'newMaze';
      maze: MazeData;
      counts?: EnemyCounts;
      enemyPathLength?: number;
      playerPathLength?: number;
      wallLifetime?: number;
      enemyCountsFn?: (stage: number) => EnemyCounts;
      wallLifetimeFn?: (stage: number) => number;
      biasedSpawn?: boolean;
      levelId?: string;
    }
  | { type: 'nextStage' }
  | { type: 'resetRun' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'reset':
      // 同じ迷路で初期化
      return initState(
        state.mazeRaw,
        state.stage,
        new Set(state.visitedGoals),
        state.finalStage,
        undefined,
        undefined,
        state.enemyCounts,
        state.enemyPathLength,
        state.playerPathLength,
        state.wallLifetime,
        state.enemyCountsFn,
        state.wallLifetimeFn,
        state.biasedSpawn,
        state.levelId,
      );
    case 'newMaze':
      // 新しい迷路で初期化
      return createFirstStage(
        action.maze,
        action.counts ?? state.enemyCounts,
        action.enemyPathLength ?? state.enemyPathLength,
        action.playerPathLength ?? state.playerPathLength,
        action.wallLifetime ?? state.wallLifetime,
        // 練習モードでは前回レベルの設定を引き継がないよう
        // 明示的に undefined を渡す
        action.enemyCountsFn,
        action.wallLifetimeFn,
        action.biasedSpawn ?? state.biasedSpawn,
        action.levelId,
      );
    case 'nextStage':
      return nextStageState(state);
    case 'resetRun':
      return restartRun(state);
    case 'move': {
      const { pos, maze, enemies } = state;
      const next = nextPosition(pos, action.dir);
      let newPos = pos;
      let steps = state.steps;
      let hitV = decayHitMap(state.hitV);
      let hitH = decayHitMap(state.hitH);
      let bumps = state.bumps;
      if (!canMove(pos, action.dir, maze)) {
        const hit = getHitWall(pos, action.dir, maze);
        hitV = new Map(hitV);
        hitH = new Map(hitH);
        if (hit) {
          if (hit.kind === 'v') hitV.set(hit.key, state.wallLifetime);
          else hitH.set(hit.key, state.wallLifetime);
        }
        bumps += 1;
      } else {
        newPos = next;
        steps += 1;
      }

      const newVisited: Map<string, number>[] = [];
      const movedEnemies = enemies.map((e, i) => {
        const mover = getEnemyMover(e.behavior ?? state.enemyBehavior);
        const visited = new Map(state.enemyVisited[i]);
        if (e.cooldown > 0) {
          let targetEnemy = e;
          if (e.behavior === 'sight' || e.behavior === 'smart') {
            // 視認のみ行って target を更新する
            if (inSight(e.pos, newPos, maze)) {
              targetEnemy = { ...e, target: { ...newPos } };
            }
          }
          newVisited.push(visited);
          return { ...targetEnemy, cooldown: e.cooldown - 1 };
        }
        let current = e;
        for (let r = 0; r < e.repeat; r++) {
          current = mover(current, maze, visited, newPos);
          const key = `${current.pos.x},${current.pos.y}`;
          visited.set(key, (visited.get(key) ?? 0) + 1);
        }
        newVisited.push(visited);
        return {
          ...e,
          ...current,
          cooldown: e.interval - 1,
        };
      });

      const newPaths = updateEnemyPaths(
        state.enemyPaths,
        movedEnemies.map((e) => e.pos),
        state.enemyPathLength,
      );

      const caught = movedEnemies.some((e, i) => {
        const prev = enemies[i].pos;
        const cross =
          prev.x === newPos.x &&
          prev.y === newPos.y &&
          e.pos.x === pos.x &&
          e.pos.y === pos.y;
        const same = e.pos.x === newPos.x && e.pos.y === newPos.y;
        return same || cross;
      });

      const newState: State = {
        ...state,
        pos: newPos,
        steps,
        bumps,
        path:
          steps !== state.steps
            ? updatePlayerPath(state.path, newPos, state.playerPathLength)
            : state.path,
        hitV,
        hitH,
        enemies: movedEnemies,
        enemyVisited: newVisited,
        enemyPaths: newPaths,
        caught,
      };
      return newState;
    }
  }
}

const GameContext = createContext<
  | {
      state: GameState;
      move: (dir: Dir) => boolean;
      reset: () => void;
      /** 新しい迷路を読み込んでゲームを開始する。size で迷路の大きさを指定 */
      newGame: (
        size: number,
        counts?: EnemyCounts,
        enemyPathLength?: number,
        playerPathLength?: number,
        wallLifetime?: number,
        enemyCountsFn?: (stage: number) => EnemyCounts,
        wallLifetimeFn?: (stage: number) => number,
        biasedSpawn?: boolean,
        levelId?: string,
      ) => void;
      nextStage: () => void;
      resetRun: () => void;
      maze: MazeData;
    }
  | undefined
>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  // useReducer 第3引数を使って初期迷路を読み込む
  // 初回は 10×10 迷路を使用する
  const [state, dispatch] = useReducer(reducer, loadMaze(10), createFirstStage);

  // 移動処理: 壁に当たったかを返す
  const move = (dir: Dir): boolean => {
    const success = canMove(state.pos, dir, state.maze);
    dispatch({ type: 'move', dir });
    return success;
  };

  const reset = () => dispatch({ type: 'reset' });
  const newGame = (
    size: number = 10,
    counts?: EnemyCounts,
    enemyPathLength?: number,
    playerPathLength?: number,
    wallLifetime?: number,
    enemyCountsFn?: (stage: number) => EnemyCounts,
    wallLifetimeFn?: (stage: number) => number,
    biasedSpawn?: boolean,
    levelId?: string,
  ) =>
    dispatch({
      type: 'newMaze',
      maze: loadMaze(size),
      counts,
      enemyPathLength,
      playerPathLength,
      wallLifetime,
      enemyCountsFn,
      wallLifetimeFn,
      biasedSpawn,
      levelId,
    });
  const nextStage = () => dispatch({ type: 'nextStage' });
  const resetRun = () => dispatch({ type: 'resetRun' });

  return (
    <GameContext.Provider
      value={{ state, move, reset, newGame, maze: state.mazeRaw, nextStage, resetRun }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame は GameProvider 内で利用してください');
  return ctx;
}
