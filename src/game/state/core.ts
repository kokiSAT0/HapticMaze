import { wallSet } from '../maze';
import { selectEnemyBehavior } from '../enemy';
import type { MazeData, Vec2 } from '@/src/types/maze';
import type { Enemy, EnemyCounts } from '@/src/types/enemy';
import type { NewGameOptions } from '@/src/types/game';
import { createEnemies } from './enemy';
import { addAdjacentWalls } from './utils';

// MazeData から壁情報を Set 化して検索を高速にするヘルパー
export interface MazeSets extends MazeData {
  v_walls: Set<string>;
  h_walls: Set<string>;
}

export function prepMaze(m: MazeData): MazeSets {
  return {
    ...m,
    v_walls: wallSet(m.v_walls),
    h_walls: wallSet(m.h_walls),
  };
}

// ゲーム状態を表す型
export interface GameState {
  pos: Vec2;
  steps: number;
  bumps: number;
  /** ゲーム全体で移動した総歩数 */
  totalSteps: number;
  /** ゲーム全体でぶつかった回数 */
  totalBumps: number;
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
  enemyBehavior: import('@/src/types/enemy').EnemyBehavior;
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
  /** 周囲の壁を常に表示するか */
  showAdjacentWalls: boolean;
  /** ステージ番号から周囲表示を決める関数 */
  showAdjacentWallsFn?: (stage: number) => boolean;
  /** プレイヤー周囲壁の寿命 */
  playerAdjacentLife: number;
  /** 敵周囲壁の寿命 */
  enemyAdjacentLife: number;
  /** スポーン位置をスタートから遠い場所に偏らせるか */
  biasedSpawn: boolean;
  /** ゴールをスタートから遠ざけるかどうか */
  biasedGoal: boolean;
  /** 現在のレベル識別子。練習モードは undefined */
  levelId?: string;
  /** 何ステージごとに新しい迷路へ切り替えるか */
  stagePerMap: number;
  /** 敵をリスポーンできる残り回数 */
  respawnStock: number;
  /** リスポーン回数の上限 */
  respawnMax: number;
}

// Provider が保持する全体の状態
export interface State extends GameState {
  mazeRaw: MazeData;
  maze: MazeSets;
}

// MazeData から初期状態を作成する関数
export function initState(
  m: MazeData,
  stage: number,
  visitedGoals: Set<string>,
  finalStage: boolean,
  options: NewGameOptions = {},
  hitV: Map<string, number> = new Map(),
  hitH: Map<string, number> = new Map(),
  respawnStock: number = options.respawnMax ?? 3,
  totalSteps: number = 0,
  totalBumps: number = 0,
): State {
  const {
    counts = { random: 0, slow: 0, sight: 0, fast: 0 },
    enemyPathLength = 4,
    playerPathLength = Infinity,
    wallLifetime = Infinity,
    enemyCountsFn,
    wallLifetimeFn,
    showAdjacentWalls = false,
    showAdjacentWallsFn,
    playerAdjacentLife,
    enemyAdjacentLife,
    biasedSpawn = true,
    biasedGoal = true,
    levelId,
    stagePerMap = 3,
    respawnMax = 3,
  } = options;
  const maze = prepMaze(m);
  const enemies = createEnemies(counts, maze, biasedSpawn);
  const enemyBehavior = selectEnemyBehavior(m.size, finalStage);
  const life = wallLifetimeFn ? wallLifetimeFn(stage) : wallLifetime;
  // 周囲壁の寿命が未指定なら衝突壁と同じ値を採用
  const pAdjLife = playerAdjacentLife ?? life;
  const eAdjLife = enemyAdjacentLife ?? life;
  // 周囲表示が有効なら開始時点で周囲の壁を記録する
  let initHits = showAdjacentWalls
    ? addAdjacentWalls(
        { x: m.start[0], y: m.start[1] },
        maze,
        hitV,
        hitH,
        pAdjLife,
      )
    : { hitV, hitH };

  if (showAdjacentWalls) {
    initHits = enemies.reduce(
      (acc, e) =>
        addAdjacentWalls(e.pos, maze, acc.hitV, acc.hitH, eAdjLife),
      initHits,
    );
  }
  return {
    mazeRaw: m,
    maze,
    pos: { x: m.start[0], y: m.start[1] },
    steps: 0,
    bumps: 0,
    path: [{ x: m.start[0], y: m.start[1] }],
    hitV: initHits.hitV,
    hitH: initHits.hitH,
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
    enemyCounts: counts,
    enemyCountsFn,
    enemyPathLength,
    playerPathLength,
    wallLifetime: life,
    wallLifetimeFn,
    showAdjacentWalls,
    showAdjacentWallsFn,
    playerAdjacentLife: pAdjLife,
    enemyAdjacentLife: eAdjLife,
    biasedSpawn,
    biasedGoal,
    levelId,
    stagePerMap,
    respawnStock,
    respawnMax,
    totalSteps,
    totalBumps,
  };
}
