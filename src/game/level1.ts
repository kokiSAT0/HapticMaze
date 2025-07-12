import type { EnemyCounts } from '@/src/types/enemy';

/** ステージ範囲ごとの敵出現数テーブル */
interface StageRow {
  /**
   * この行が適用される最終ステージ番号
   * 例: end が 9 の場合、1〜9 ステージに適用
   */
  end: number;
  /**
   * 余り(mod)ごとの敵数を格納
   * index0: mod=0, index1: mod=1, index2: mod=2
   */
  mods: [EnemyCounts, EnemyCounts, EnemyCounts];
}

/**
 * 下記配列は `doc/level.md` の表をそのまま写したものです。
 * ステージ範囲と mod の組み合わせから敵数を参照します。
 */
const STAGE_TABLE: StageRow[] = [
  {
    end: 9,
    mods: [
      { random: 0, slow: 1, sight: 0, fast: 0 }, // mod 0
      { random: 1, slow: 0, sight: 0, fast: 0 }, // mod 1
      { random: 1, slow: 0, sight: 0, fast: 0 }, // mod 2
    ],
  },
  {
    end: 18,
    mods: [
      { random: 1, slow: 0, sight: 0, fast: 0 }, // mod 0
      { random: 1, slow: 0, sight: 0, fast: 0 }, // mod 1
      { random: 1, slow: 0, sight: 0, fast: 0 }, // mod 2
    ],
  },
  {
    end: 27,
    mods: [
      { random: 0, slow: 2, sight: 0, fast: 0 },
      { random: 1, slow: 0, sight: 0, fast: 0 },
      { random: 1, slow: 0, sight: 0, fast: 0 },
    ],
  },
  {
    end: 36,
    mods: [
      { random: 0, slow: 2, sight: 0, fast: 0 },
      { random: 1, slow: 0, sight: 0, fast: 0 },
      { random: 2, slow: 0, sight: 0, fast: 0 },
    ],
  },
  {
    end: 45,
    mods: [
      { random: 1, slow: 2, sight: 0, fast: 0 },
      { random: 2, slow: 0, sight: 0, fast: 0 },
      { random: 2, slow: 0, sight: 0, fast: 0 },
    ],
  },
  {
    end: 54,
    mods: [
      { random: 1, slow: 2, sight: 0, fast: 0 },
      { random: 2, slow: 0, sight: 0, fast: 0 },
      { random: 0, slow: 3, sight: 0, fast: 0 },
    ],
  },
  {
    end: 63,
    mods: [
      { random: 1, slow: 2, sight: 0, fast: 0 },
      { random: 2, slow: 0, sight: 0, fast: 0 },
      { random: 0, slow: 3, sight: 0, fast: 0 },
    ],
  },
  {
    end: 72,
    mods: [
      { random: 2, slow: 1, sight: 0, fast: 0 },
      { random: 2, slow: 0, sight: 0, fast: 0 },
      { random: 1, slow: 2, sight: 0, fast: 0 },
    ],
  },
  {
    end: 81,
    mods: [
      { random: 2, slow: 0, sight: 1, fast: 0 },
      { random: 2, slow: 0, sight: 0, fast: 0 },
      { random: 1, slow: 2, sight: 0, fast: 0 },
    ],
  },
  {
    end: 90,
    mods: [
      { random: 1, slow: 3, sight: 0, fast: 0 },
      { random: 1, slow: 2, sight: 0, fast: 0 },
      { random: 3, slow: 0, sight: 0, fast: 0 },
    ],
  },
  {
    end: 99,
    mods: [
      { random: 1, slow: 2, sight: 1, fast: 0 },
      { random: 1, slow: 2, sight: 1, fast: 0 },
      { random: 1, slow: 2, sight: 1, fast: 0 },
    ],
  },
  {
    end: Infinity,
    mods: [
      { random: 1, slow: 2, sight: 2, fast: 0 },
      { random: 1, slow: 2, sight: 2, fast: 0 },
      { random: 1, slow: 2, sight: 2, fast: 0 },
    ],
  },
];

/**
 * レベル1・2共通の敵出現数を返す関数です。
 *
 * ステージ番号と3の余り (mod) に応じて敵の種類と数が変化します。
 * 詳細な数値は `doc/level.md` の表を参照してください。
 * この関数も同じ内容になるよう実装しています。
 */
export function level1EnemyCounts(stage: number): EnemyCounts {
  const mod = stage % 3 as 0 | 1 | 2;

  for (const row of STAGE_TABLE) {
    if (stage <= row.end) {
      return row.mods[mod];
    }
  }

  // ここには来ない想定だが、型安全のため最後の行を返す
  return STAGE_TABLE[STAGE_TABLE.length - 1].mods[mod];
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
