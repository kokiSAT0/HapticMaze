// 振動フィードバックに関する処理をまとめたモジュール

import * as Haptics from 'expo-haptics';
import { withSequence, withTiming, type SharedValue } from 'react-native-reanimated';
import type { Vec2 } from '@/src/types/maze';
import { distance } from './math';

export interface FeedbackOptions {
  /** 最大距離。未指定ならゴール座標から算出した値を使う */
  maxDist?: number;
}

export interface DistanceFeedbackResult {
  /** 次回呼び出しまでの待機時間 */
  wait: number;
  /** setInterval から返る ID */
  id: NodeJS.Timeout;
}

/**
 * ゴールまでの距離に応じて振動を変化させる
 */
export function applyDistanceFeedback(
  pos: Vec2,
  goal: Vec2,
  opts: FeedbackOptions = {},
): DistanceFeedbackResult {
  const maxDist = opts.maxDist ?? 4;
  const dist = distance(pos, goal);
  const scaled = Math.max(1, Math.ceil((dist / maxDist) * 4));

  let style: Haptics.ImpactFeedbackStyle;
  let duration: number;
  if (scaled === 1) {
    style = Haptics.ImpactFeedbackStyle.Heavy;
    duration = 400;
  } else if (scaled === 2) {
    style = Haptics.ImpactFeedbackStyle.Heavy;
    duration = 200;
  } else if (scaled === 3) {
    style = Haptics.ImpactFeedbackStyle.Medium;
    duration = 100;
  } else if (scaled === 4) {
    style = Haptics.ImpactFeedbackStyle.Medium;
    duration = 100;
  } else {
    style = Haptics.ImpactFeedbackStyle.Light;
    duration = 100;
  }

  Haptics.impactAsync(style);
  const id = setInterval(() => {
    Haptics.impactAsync(style);
  }, 50);
  setTimeout(() => clearInterval(id), duration);

  return { wait: duration, id };
}

export interface BumpFeedbackOptions extends FeedbackOptions {
  /** 枠線の太さ (px) */
  width?: number;
  /** 表示時間 (ms) */
  showTime?: number;
}

/**
 * 壁衝突時のフィードバック
 */
export function applyBumpFeedback(
  borderW: SharedValue<number>,
  setColor: (color: string) => void,
  opts: BumpFeedbackOptions = {},
): number {
  const width = opts.width ?? 50;
  const showTime = opts.showTime ?? 300;

  setColor('red');
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  const id = setInterval(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, 50);
  setTimeout(() => clearInterval(id), showTime);

  borderW.value = withSequence(
    withTiming(width, { duration: showTime / 2 }),
    withTiming(0, { duration: showTime / 2 }),
  );

  return showTime;
}
