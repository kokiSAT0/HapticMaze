import type { EnemyCounts } from '@/src/types/enemy';

/**
 * チュートリアル専用の敵出現数を返す関数です。
 * ステージ番号に応じて次のように敵を配置します。
 *
 * - 1〜15: 敵なし
 * - 16〜20: 等速ランダム 1 体
 * - 21〜25: 鈍足視認 1 体
*/
export function tutorialEnemyCounts(stage: number): EnemyCounts {
  if (stage <= 15) return { random: 0, slow: 0, sight: 0, fast: 0 };
  if (stage <= 20) return { random: 1, slow: 0, sight: 0, fast: 0 };
  return { random: 0, slow: 1, sight: 0, fast: 0 };
}
