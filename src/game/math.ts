// 数値計算系のユーティリティ関数をまとめたモジュール
// ここでは距離計算や補間などシンプルな処理のみを扱います

import type { Vec2 } from '@/src/types/maze';

/**
 * 2点間のマンハッタン距離を求める関数
 * |x1 - x2| + |y1 - y2| の形で計算します
 */
export function distance(a: Vec2, b: Vec2): number {
  'worklet';
  return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
}

/**
 * 値を線形補間します。t が 0 なら start、1 なら end を返します
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * 値を最小値と最大値の範囲に収める clamp 関数
 */
export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
