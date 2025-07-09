import type { EnemyCounts } from '@/src/types/enemy';

/**
 * チュートリアル専用の敵出現数を返す関数です。
 * ステージ番号に応じて次のように敵を配置します。
 *
 * - 1〜2: 敵なし
 * - 3〜8: 等速ランダム 1 体
 * - 9〜10: 鈍足視認 1 体
 * - 11〜12: 等速ランダム 1 体
 * - 13〜25: 鈍足視認 1 体
 */
export function tutorialEnemyCounts(stage: number): EnemyCounts {
  if (stage <= 2) return { random: 0, slow: 0, sight: 0, fast: 0 };
  if (stage <= 8) return { random: 1, slow: 0, sight: 0, fast: 0 };
  if (stage <= 10) return { random: 0, slow: 1, sight: 0, fast: 0 };
  if (stage <= 12) return { random: 1, slow: 0, sight: 0, fast: 0 };
  return { random: 0, slow: 1, sight: 0, fast: 0 };
}
