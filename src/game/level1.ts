import type { EnemyCounts } from '@/src/types/enemy';

/**
 * レベル1専用の敵出現数を返す関数。
 * stage を 1 からカウントし、3で割った余りで出現する敵を決定する。
 * - 余り0: 鈍足・視認の敵を1体
 * - 余り1または2: 等速・ランダムの敵を1体
 */
export function level1EnemyCounts(stage: number): EnemyCounts {
  const mod = stage % 3;
  if (mod === 0) {
    return { random: 0, slow: 1, sight: 0, fast: 0 };
  }
  return { random: 1, slow: 0, sight: 0, fast: 0 };
}
