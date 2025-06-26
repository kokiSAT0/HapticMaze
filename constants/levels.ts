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
  pathLength: number;
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
    enemies: { sense: 0, random: 0, slow: 1, sight: 0, fast: 0 },
    pathLength: 5,
  },
  {
    id: 'level2',
    name: 'レベル2',
    size: 10,
    enemies: { sense: 0, random: 0, slow: 0, sight: 1, fast: 0 },
    pathLength: 4,
  },
  {
    id: 'level3',
    name: 'レベル3',
    size: 10,
    enemies: { sense: 0, random: 0, slow: 0, sight: 2, fast: 0 },
    pathLength: 3,
  },
];
