import type { EnemyCounts } from '@/src/types/enemy';

/**
 * レベル1・2 共通の敵出現数を計算します。
 *
 * ステージごとの難易度を段階的に調整するため、
 * ステージ番号と 3 の余りを組み合わせて敵数を変化させます。
 *
 * - ステージ 1〜30:
 *   - 余り 0 なら鈍足視認 1 体
 *   - 余り 1・2 なら等速ランダム 1 体
 * - ステージ 31〜60:
 *   - 余り 1 なら等速ランダム 1 体
 *   - 余り 2 なら等速ランダム 2 体
 *   - 余り 0 なら鈍足視認 1 体
 * - ステージ 61〜99:
 *   - 余り 1 なら等速ランダム 1 体
 *   - 余り 2 なら等速ランダム 2 体
 *   - 余り 0 なら鈍足視認 1 体と等速ランダム 1 体
 * - ステージ 100 以降は鈍足視認 1 体と等速ランダム 1 体
 */
export function level1EnemyCounts(stage: number): EnemyCounts {
  // 100 ステージ以降は同じ設定を返す
  if (stage >= 100) {
    return { random: 1, slow: 1, sight: 0, fast: 0 };
  }

  const mod = stage % 3;

  if (stage <= 30) {
    return mod === 0
      ? { random: 0, slow: 1, sight: 0, fast: 0 }
      : { random: 1, slow: 0, sight: 0, fast: 0 };
  }

  if (stage <= 60) {
    if (mod === 0) return { random: 0, slow: 1, sight: 0, fast: 0 };
    if (mod === 2) return { random: 2, slow: 0, sight: 0, fast: 0 };
    return { random: 1, slow: 0, sight: 0, fast: 0 };
  }

  // 61〜99 ステージ
  if (mod === 0) {
    return { random: 1, slow: 1, sight: 0, fast: 0 };
  }
  if (mod === 2) {
    return { random: 2, slow: 0, sight: 0, fast: 0 };
  }
  return { random: 1, slow: 0, sight: 0, fast: 0 };
}

/**
 * レベル1・2 共通の壁寿命設定を返します。
 * ステージ91〜100では壁の表示が10ターンで消えます。
 * それ以外では無限大 (Infinity) を返します。
 */
export function levelWallLifetime(stage: number): number {
  return stage >= 91 && stage <= 100 ? 10 : Infinity;
}
