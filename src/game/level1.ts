import type { EnemyCounts } from '@/src/types/enemy';

/**
 * レベル1・2共通の敵出現数を返す関数です。
 *
 * ステージ番号と3の余り (mod) に応じて敵の種類と数が変化します。
 * 詳細な数値は `doc/level.md` の表を参照してください。
 * この関数も同じ内容になるよう実装しています。
 */
export function level1EnemyCounts(stage: number): EnemyCounts {
  // 100 ステージ以降は表の最終行(ステージ100)と同じ扱い
  if (stage >= 100) {
    return { random: 1, slow: 2, sight: 2, fast: 0 };
  }

  const mod = stage % 3;

  // --- ステージ 1〜9 ---------------------------------
  if (stage <= 9) {
    // mod が 0 のときだけ鈍足視認 1 体
    if (mod === 0) return { random: 0, slow: 1, sight: 0, fast: 0 };
    return { random: 1, slow: 0, sight: 0, fast: 0 };
  }

  // --- ステージ 10〜18 ---------------------------------
  if (stage <= 18) {
    // すべてランダム 1 体
    return { random: 1, slow: 0, sight: 0, fast: 0 };
  }

  // --- ステージ 19〜27 ---------------------------------
  if (stage <= 27) {
    if (mod === 0) return { random: 0, slow: 2, sight: 0, fast: 0 };
    return { random: 1, slow: 0, sight: 0, fast: 0 };
  }

  // --- ステージ 28〜36 ---------------------------------
  if (stage <= 36) {
    if (mod === 0) return { random: 0, slow: 2, sight: 0, fast: 0 };
    if (mod === 2) return { random: 2, slow: 0, sight: 0, fast: 0 };
    return { random: 1, slow: 0, sight: 0, fast: 0 };
  }

  // --- ステージ 37〜45 ---------------------------------
  if (stage <= 45) {
    if (mod === 0) return { random: 1, slow: 2, sight: 0, fast: 0 };
    return { random: 2, slow: 0, sight: 0, fast: 0 };
  }

  // --- ステージ 46〜54 ---------------------------------
  if (stage <= 54) {
    if (mod === 1) return { random: 2, slow: 0, sight: 0, fast: 0 };
    if (mod === 2) return { random: 0, slow: 3, sight: 0, fast: 0 };
    return { random: 1, slow: 2, sight: 0, fast: 0 };
  }

  // --- ステージ 55〜63 ---------------------------------
  if (stage <= 63) {
    if (mod === 1) return { random: 2, slow: 0, sight: 0, fast: 0 };
    if (mod === 2) return { random: 0, slow: 3, sight: 0, fast: 0 };
    return { random: 1, slow: 2, sight: 0, fast: 0 };
  }

  // --- ステージ 64〜72 ---------------------------------
  if (stage <= 72) {
    if (mod === 1) return { random: 2, slow: 0, sight: 0, fast: 0 };
    if (mod === 2) return { random: 1, slow: 2, sight: 0, fast: 0 };
    return { random: 2, slow: 1, sight: 0, fast: 0 };
  }

  // --- ステージ 73〜81 ---------------------------------
  if (stage <= 81) {
    if (mod === 1) return { random: 2, slow: 0, sight: 0, fast: 0 };
    if (mod === 2) return { random: 1, slow: 2, sight: 0, fast: 0 };
    return { random: 2, slow: 0, sight: 1, fast: 0 };
  }

  // --- ステージ 82〜90 ---------------------------------
  if (stage <= 90) {
    if (mod === 1) return { random: 1, slow: 2, sight: 0, fast: 0 };
    if (mod === 2) return { random: 3, slow: 0, sight: 0, fast: 0 };
    return { random: 1, slow: 3, sight: 0, fast: 0 };
  }

  // --- ステージ 91〜99 ---------------------------------
  if (stage <= 99) {
    // mod に関係なく同じ数
    return { random: 1, slow: 2, sight: 1, fast: 0 };
  }

  // 理論上ここには来ないが型安全のため
  return { random: 1, slow: 2, sight: 1, fast: 0 };
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
