import * as Haptics from 'expo-haptics';
import { withTiming, SharedValue } from 'react-native-reanimated';

export interface Vec2 {
  x: number;
  y: number;
}

/**
 * 2点間の直線距離を求めます。
 * Math.hypot はピタゴラスの定理を使って距離を計算する関数です。
 */
export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * 値を線形補間します。t が 0 のとき start、1 のとき end を返します。
 * lerp は "linear interpolation" の略称です。
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export interface FeedbackOptions {
  /** 距離の最大値。デフォルトはゴール座標から計算した距離 */
  maxDist?: number;
  /** 振動時間の範囲 [長いとき, 短いとき] */
  vibrateRange?: [number, number];
  /** 枠太さの範囲 [最小, 最大] */
  borderRange?: [number, number];
}

/**
 * ゴールとの距離に応じて振動と枠アニメーションを発生させます。
 * borderW は Reanimated の SharedValue<number> です。
 */
export function applyDistanceFeedback(
  pos: Vec2,
  goal: Vec2,
  borderW: SharedValue<number>,
  opts: FeedbackOptions = {}
) {
  const {
    maxDist = Math.hypot(goal.x, goal.y),
    vibrateRange = [120, 20],
    borderRange = [2, 8],
  } = opts;

  const dist = distance(pos, goal);
  const t = dist / maxDist; // 0〜1 の値
  const vibMs = lerp(vibrateRange[0], vibrateRange[1], 1 - t);
  const width = lerp(borderRange[0], borderRange[1], 1 - t);

  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium, vibMs);
  borderW.value = withTiming(width, { duration: 150 });
}
