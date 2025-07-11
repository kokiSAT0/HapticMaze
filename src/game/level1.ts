import type { EnemyCounts } from '@/src/types/enemy';

/**
 * レベル1・2 共通の敵出現数を計算します。
 *
 * ステージごとの難易度を段階的に調整するため、
 * ステージ番号と 3 の余りを組み合わせて敵数を変化させます。
 *
 * doc/level.md の表に合わせて細かな範囲ごとに
 * 出現する敵の数を定義しています。
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
  // 100 ステージ以降は表の最終行と同じ設定を使用
  if (stage >= 100) {
    return { random: 1, slow: 2, sight: 0, fast: 0 };
  }

  const mod = stage % 3;

  // --- ステージ 1〜9 ---------------------------------
  if (stage <= 9) {
    // 余りに関係なくランダム 1 体
    return { random: 1, slow: 0, sight: 0, fast: 0 };
  }

  // --- ステージ 10〜18 ---------------------------------
  if (stage <= 18) {
    // 3 の倍数だけ鈍足視認 1 体
    if (mod === 0) return { random: 0, slow: 1, sight: 0, fast: 0 };
    return { random: 1, slow: 0, sight: 0, fast: 0 };
  }

  // --- ステージ 19〜27 ---------------------------------
  if (stage <= 27) {
    if (mod === 2) return { random: 2, slow: 0, sight: 0, fast: 0 };
    if (mod === 0) return { random: 0, slow: 1, sight: 0, fast: 0 };
    return { random: 1, slow: 0, sight: 0, fast: 0 };
  }

  // --- ステージ 28〜36 ---------------------------------
  if (stage <= 36) {
    if (mod === 0) return { random: 0, slow: 1, sight: 0, fast: 0 };
    // 余り 1・2 ではランダム 2 体
    return { random: 2, slow: 0, sight: 0, fast: 0 };
  }

  // --- ステージ 37〜45 ---------------------------------
  if (stage <= 45) {
    if (mod === 0) return { random: 1, slow: 1, sight: 0, fast: 0 };
    if (mod === 2) return { random: 2, slow: 0, sight: 0, fast: 0 };
    return { random: 1, slow: 0, sight: 0, fast: 0 };
  }

  // --- ステージ 46〜54 ---------------------------------
  if (stage <= 54) {
    if (mod === 0) return { random: 1, slow: 1, sight: 0, fast: 0 };
    // 余り 1・2 はランダム 2 体
    return { random: 2, slow: 0, sight: 0, fast: 0 };
  }

  // --- ステージ 55〜63 ---------------------------------
  if (stage <= 63) {
    if (mod === 0) return { random: 1, slow: 1, sight: 0, fast: 0 };
    if (mod === 2) return { random: 3, slow: 0, sight: 0, fast: 0 };
    return { random: 2, slow: 0, sight: 0, fast: 0 };
  }

  // --- ステージ 64〜72 ---------------------------------
  if (stage <= 72) {
    if (mod === 0) return { random: 0, slow: 2, sight: 0, fast: 0 };
    if (mod === 2) return { random: 2, slow: 0, sight: 0, fast: 0 };
    return { random: 1, slow: 0, sight: 0, fast: 0 };
  }

  // --- ステージ 73〜81 ---------------------------------
  if (stage <= 81) {
    if (mod === 0) return { random: 0, slow: 2, sight: 0, fast: 0 };
    // 余り 1・2 はランダム 2 体
    return { random: 2, slow: 0, sight: 0, fast: 0 };
  }

  // --- ステージ 82〜90 ---------------------------------
  if (stage <= 90) {
    if (mod === 0) return { random: 0, slow: 2, sight: 0, fast: 0 };
    if (mod === 2) return { random: 3, slow: 0, sight: 0, fast: 0 };
    return { random: 2, slow: 0, sight: 0, fast: 0 };
  }

  // --- ステージ 91〜99 ---------------------------------
  if (stage <= 99) {
    if (mod === 0) return { random: 0, slow: 2, sight: 0, fast: 0 };
    // 余り 1・2 はランダム 2 体
    return { random: 2, slow: 0, sight: 0, fast: 0 };
  }

  // ここには来ないが型のために返しておく
  return { random: 1, slow: 0, sight: 0, fast: 0 };
}

/**
 * ノーマル用の壁寿命設定です。
 * 52ステージ目以降は50ターンで壁が消えます。
 */
export function normalWallLifetime(stage: number): number {
  return stage >= 52 ? 50 : Infinity;
}

/**
 * ハード用の壁寿命設定です。
 * ステージ範囲ごとに寿命が短くなります。
 */
export function hardWallLifetime(stage: number): number {
  if (stage <= 21) return Infinity;
  if (stage <= 51) return 40;
  if (stage <= 72) return 30;
  if (stage <= 90) return 20;
  if (stage <= 100) return 10;
  return Infinity;
}
