import type { EnemyCounts } from '@/src/types/enemy';
import {
  level1EnemyCounts,
  normalWallLifetime,
  hardWallLifetime,
} from '@/src/game/level1';
import { tutorialEnemyCounts } from '@/src/game/tutorial';

// 各レベルの設定をまとめた型
export interface LevelConfig {
  /** レベル識別子 */
  id: string;
  /** 画面に表示する名称 */
  name: string;
  /** 迷路サイズ */
  size: number;
  /** 出現させる敵の種類と数 */
  enemies: EnemyCounts;
  /** 敵の軌跡を何マス保存するか */
  enemyPathLength: number;
  /** プレイヤー軌跡の長さ */
  playerPathLength: number;
  /** 壁表示を維持するターン数 */
  wallLifetime: number;
  /** ステージ番号から壁寿命を計算する関数。未指定なら wallLifetime を使う */
  wallLifetimeFn?: (stage: number) => number;
  /** ステージ番号から敵数を決める関数。未指定なら enemies を使う */
  enemyCountsFn?: (stage: number) => EnemyCounts;
  /** 敵スポーン位置をスタートから遠い場所に偏らせるか */
  biasedSpawn?: boolean;
  /** ゴールをスタートから遠ざけるかどうか */
  biasedGoal?: boolean;
  /** プレイヤー周囲の壁を常に表示するか */
  showAdjacentWalls?: boolean;
  /** ステージごとに周囲表示の有無を決める関数 */
  showAdjacentWallsFn?: (stage: number) => boolean;
  /** 何ステージごとに迷路を更新するか */
  stagePerMap?: number;
  /** 敵をリスポーンできる最大回数 */
  respawnMax?: number;
}

/**
 * レベル定義一覧。
 * 今後の追加や調整が容易になるよう配列で管理する。
 * レベル3・レベル4は仕様変更により削除済み。
 */
export const LEVELS: LevelConfig[] = [
  {
    id: 'tutorial',
    name: 'チュートリアル',
    size: 5,
    enemies: { random: 0, slow: 0, sight: 0, fast: 0 },
    enemyPathLength: 5,
    // チュートリアルは軌跡を20マス残す
    playerPathLength: 20,
    wallLifetime: Infinity,
    enemyCountsFn: tutorialEnemyCounts,
    biasedSpawn: false,
    biasedGoal: true,
    // チュートリアルでは常に周囲の壁を表示する
    // showAdjacentWalls を true にすることで全ステージに適用される
    showAdjacentWalls: true,
    stagePerMap: 5,
    respawnMax: 3,
  },
  {
    id: 'easy',
    name: 'イージー',
    // 10×10 マップを使用
    size: 10,
    // 初回は関数から得た設定を使うため 0 で初期化
    enemies: { random: 0, slow: 0, sight: 0, fast: 0 },
    enemyPathLength: 5,
    // イージーもチュートリアル同様に20マス表示
    playerPathLength: 20,
    // 壁表示は無限大
    wallLifetime: Infinity,
    enemyCountsFn: level1EnemyCounts,
    biasedSpawn: true,
    biasedGoal: false,
    showAdjacentWallsFn: (stage) => stage <= 30,
    respawnMax: 3,
  },
  {
    id: 'normal',
    name: 'ノーマル',
    size: 10,
    enemies: { random: 0, slow: 0, sight: 0, fast: 0 },
    enemyPathLength: 5,
    // ノーマルでは10マス分のみ表示
    playerPathLength: 10,
    wallLifetime: Infinity,
    wallLifetimeFn: normalWallLifetime,
    enemyCountsFn: level1EnemyCounts,
    biasedSpawn: true,
    biasedGoal: false,
    respawnMax: 2,
  },
  {
    id: 'hard',
    name: 'ハード',
    size: 10,
    enemies: { random: 0, slow: 0, sight: 0, fast: 0 },
    enemyPathLength: 5,
    // ハードは7マス表示のまま
    playerPathLength: 7,
    wallLifetime: Infinity,
    wallLifetimeFn: hardWallLifetime,
    enemyCountsFn: level1EnemyCounts,
    biasedSpawn: false,
    biasedGoal: true,
    respawnMax: 1,
  },
];
