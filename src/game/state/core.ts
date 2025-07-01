import { wallSet } from '../utils';
import { selectEnemyBehavior } from '../enemy';
import type { MazeData, Vec2 } from '@/src/types/maze';
import type { Enemy, EnemyCounts } from '@/src/types/enemy';
import { createEnemies } from './enemy';

// MazeData から壁情報を Set 化して検索を高速にするヘルパー
interface MazeSets extends MazeData {
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
  /** スポーン位置をスタートから遠い場所に偏らせるか */
  biasedSpawn: boolean;
  /** 現在のレベル識別子。練習モードは undefined */
  levelId?: string;
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
  hitV: Map<string, number> = new Map(),
  hitH: Map<string, number> = new Map(),
  enemyCounts: EnemyCounts = { random: 0, slow: 0, sight: 0, fast: 0 },
  enemyPathLength: number = 4,
  playerPathLength: number = Infinity,
  wallLifetime: number = Infinity,
  enemyCountsFn?: (stage: number) => EnemyCounts,
  wallLifetimeFn?: (stage: number) => number,
  biasedSpawn: boolean = true,
  levelId?: string,
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
