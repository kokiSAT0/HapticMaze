import { createContext, useContext, useReducer, type ReactNode } from 'react';
import {
  wallSet,
  canMove,
  getHitWall,
  nextPosition,
  spawnEnemies,
  updateEnemyPaths,
  randomCell,
  biasedPickGoal,
  allCells,
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
function createEnemies(counts: EnemyCounts, maze: MazeData): Enemy[] {
  const enemies: Enemy[] = [];
  const exclude = new Set<string>();
  spawnEnemies(counts.visible, maze, Math.random, exclude).forEach((p) => {
    enemies.push({ pos: p, visible: true, interval: 1, cooldown: 0, target: null });
  });
  spawnEnemies(counts.invisible, maze, Math.random, exclude).forEach((p) => {
    enemies.push({ pos: p, visible: false, interval: 1, cooldown: 0, target: null });
  });
  spawnEnemies(counts.slow, maze, Math.random, exclude).forEach((p) => {
    enemies.push({ pos: p, visible: true, interval: 2, cooldown: 0, target: null });
  });
  spawnEnemies(counts.sight, maze, Math.random, exclude).forEach((p) => {
    enemies.push({ pos: p, visible: true, interval: 1, cooldown: 0, target: null });
  });
  return enemies;
}

/**
 * ランダムなスタートとゴールを含む MazeData を作成するヘルパー。
 */
function createFirstStage(base: MazeData, counts: EnemyCounts = {
  visible: 1,
  invisible: 0,
  slow: 0,
  sight: 0,
}): State {
  const visited = new Set<string>();
  const start = randomCell(base.size);
  const candidates = allCells(base.size).filter(
    (c) => c.x !== start.x || c.y !== start.y,
  );
  const goal = biasedPickGoal(start, candidates);
  visited.add(`${goal.x},${goal.y}`);
  const maze: MazeData = {
    ...base,
    start: [start.x, start.y],
    goal: [goal.x, goal.y],
  };
  const finalStage = visited.size === base.size * base.size;
  return initState(maze, 1, visited, finalStage, undefined, undefined, counts);
}

/**
 * 前ステージのゴールを次ステージのスタートとし、
 * 未使用マスから新たなゴールを決めて状態を更新する。
 */
function nextStageState(state: State): State {
  const size = state.mazeRaw.size;
  // size の倍数ステージクリアごとに迷路を変更する
  const changeMap = state.stage % size === 0;
  // 迷路を継続する場合は同じレイアウトを使う
  const base = changeMap ? loadMaze(size) : state.mazeRaw;
  // 次のスタート地点は前回ゴールしたマス
  const start = { x: state.mazeRaw.goal[0], y: state.mazeRaw.goal[1] };
  const visited = new Set(state.visitedGoals);
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
  visited.add(`${goal.x},${goal.y}`);
  const maze: MazeData = {
    ...base,
    start: [start.x, start.y],
    goal: [goal.x, goal.y],
  };
  const finalStage = visited.size === size * size;
  // 壁情報を引き継ぐかどうかを決定
  const hitV = changeMap ? new Set<string>() : new Set(state.hitV);
  const hitH = changeMap ? new Set<string>() : new Set(state.hitH);
  // ステージ数を +1 した新しい状態を返す
  return initState(
    maze,
    state.stage + 1,
    visited,
    finalStage,
    hitV,
    hitH,
    state.enemyCounts,
  );
}

/**
 * ゲームオーバー時に最初からやり直す処理。
 * 同じ迷路レイアウトを使って 1 ステージ目を生成する。
 */
function restartRun(state: State): State {
  return createFirstStage(state.mazeRaw, state.enemyCounts);
}

// ゲーム状態を表す型
export interface GameState {
  pos: Vec2;
  steps: number;
  bumps: number;
  path: Vec2[];
  hitV: Set<string>;
  hitH: Set<string>;
  enemies: Enemy[];
  enemyVisited: Set<string>[];
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
  hitV: Set<string> = new Set(),
  hitH: Set<string> = new Set(),
  enemyCounts: EnemyCounts = { visible: 1, invisible: 0, slow: 0, sight: 0 },
): State {
  const maze = prepMaze(m);
  const enemies = createEnemies(enemyCounts, maze);
  const enemyBehavior = selectEnemyBehavior(m.size, finalStage);
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
    enemyVisited: enemies.map((e) => new Set([`${e.pos.x},${e.pos.y}`])),
    enemyPaths: enemies.map((e) => [{ ...e.pos }]),
    caught: false,
    stage,
    visitedGoals,
    finalStage,
    enemyBehavior,
    enemyCounts,
  };
}

// Reducer で使うアクション型
type Action =
  | { type: 'reset' }
  | { type: 'move'; dir: Dir }
  | { type: 'newMaze'; maze: MazeData; counts?: EnemyCounts }
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
      );
    case 'newMaze':
      // 新しい迷路で初期化
      return createFirstStage(action.maze, action.counts ?? state.enemyCounts);
    case 'nextStage':
      return nextStageState(state);
    case 'resetRun':
      return restartRun(state);
    case 'move': {
      const { pos, maze, enemies } = state;
      const next = nextPosition(pos, action.dir);
      let newPos = pos;
      let steps = state.steps;
      let hitV = state.hitV;
      let hitH = state.hitH;
      let bumps = state.bumps;
      if (!canMove(pos, action.dir, maze)) {
        const hit = getHitWall(pos, action.dir, maze);
        hitV = new Set(state.hitV);
        hitH = new Set(state.hitH);
        if (hit) {
          if (hit.kind === 'v') hitV.add(hit.key);
          else hitH.add(hit.key);
        }
        bumps += 1;
      } else {
        newPos = next;
        steps += 1;
      }

      const newVisited: Set<string>[] = [];
      const mover = getEnemyMover(state.enemyBehavior);
      const movedEnemies = enemies.map((e, i) => {
        const visited = new Set(state.enemyVisited[i]);
        if (e.cooldown > 0) {
          newVisited.push(visited);
          return { ...e, cooldown: e.cooldown - 1 };
        }
        const moved = mover(e, maze, visited, newPos);
        visited.add(`${moved.pos.x},${moved.pos.y}`);
        newVisited.push(visited);
        return {
          ...e,
          ...moved,
          cooldown: e.interval - 1,
        };
      });

      const newPaths = updateEnemyPaths(
        state.enemyPaths,
        movedEnemies.map((e) => e.pos),
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
        path: steps !== state.steps ? [...state.path, newPos] : state.path,
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
      newGame: (size: number, counts?: EnemyCounts) => void;
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
  const newGame = (size: number = 10, counts?: EnemyCounts) =>
    dispatch({ type: 'newMaze', maze: loadMaze(size), counts });
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
