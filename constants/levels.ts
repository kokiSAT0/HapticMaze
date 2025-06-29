import type { EnemyCounts } from '@/src/types/enemy';
import { level1EnemyCounts } from '@/src/game/level1';

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
  /** ステージ番号から敵数を決める関数。未指定なら enemies を使う */
  enemyCountsFn?: (stage: number) => EnemyCounts;
  /** 敵スポーン位置をスタートから遠い場所に偏らせるか */
  biasedSpawn?: boolean;
}

/**
 * レベル定義一覧。
 * 今後の追加や調整が容易になるよう配列で管理する。
 * レベル3・レベル4は仕様変更により削除済み。
 */
export const LEVELS: LevelConfig[] = [
  {
    id: 'level1',
    name: 'レベル1',
    // 10×10 マップを使用
    size: 10,
    // 初回は関数から得た設定を使うため 0 で初期化
    enemies: { random: 0, slow: 0, sight: 0, fast: 0 },
    enemyPathLength: 5,
    // 自分軌跡は 7 マス表示
    playerPathLength: 7,
    // 壁表示は無限大
    wallLifetime: Infinity,
    enemyCountsFn: level1EnemyCounts,
    biasedSpawn: false,
  },
  {
    id: 'level2',
    name: 'レベル2',
    size: 10,
    enemies: { random: 0, slow: 0, sight: 0, fast: 0 },
    enemyPathLength: 5,
    playerPathLength: 7,
    wallLifetime: Infinity,
    enemyCountsFn: level1EnemyCounts,
    biasedSpawn: true,
  },
];
