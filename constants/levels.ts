import type { EnemyCounts } from '@/src/types/enemy';

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
}

/**
 * レベル定義一覧。
 * 今後の追加や調整が容易になるよう配列で管理する。
 */
export const LEVELS: LevelConfig[] = [
  {
    id: 'level1',
    name: 'レベル1',
    size: 5,
    enemies: { random: 0, slow: 1, sight: 0, fast: 0 },
    enemyPathLength: 5,
    playerPathLength: Infinity,
    wallLifetime: Infinity,
  },
  {
    id: 'level2',
    name: 'レベル2',
    size: 10,
    enemies: { random: 0, slow: 0, sight: 1, fast: 0 },
    enemyPathLength: 4,
    playerPathLength: 8,
    wallLifetime: 10,
  },
  {
    id: 'level3',
    name: 'レベル3',
    size: 10,
    enemies: { random: 0, slow: 0, sight: 2, fast: 0 },
    enemyPathLength: 3,
    playerPathLength: 3,
    wallLifetime: 5,
  },
  {
    id: 'level4',
    name: 'レベル4',
    size: 10,
    enemies: { random: 0, slow: 1, sight: 1, fast: 0 },
    // プレイヤーの軌跡表示は 4 マス分だけ残す
    playerPathLength: 4,
  },
];
