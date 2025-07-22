// 振動フィードバックに関する処理をまとめたモジュール

import * as Haptics from 'expo-haptics';
import {
  runOnJS,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { UI } from '@/constants/ui';
import type { Vec2 } from '@/src/types/maze';
import { distance } from './math';
import { logError } from '@/src/utils/errorLogger';

// Expo Haptics の呼び出しが失敗してもアプリが止まらないようにする
// 第二引数にメッセージ表示用の関数を渡すと、失敗時にユーザーへ通知できる
async function safeImpact(
  style: Haptics.ImpactFeedbackStyle,
  showError?: (msg: string) => void,
) {
  try {
    await Haptics.impactAsync(style);
  } catch (e) {
    // 初心者向け: エラー内容を表示しておくと原因調査に役立つ
    console.error('Haptics.impactAsync failed:', e);
    showError?.('振動エラーが発生しました');
  }
}

export interface FeedbackOptions {
  /** 最大距離。未指定ならゴール座標から算出した値を使う */
  maxDist?: number;
  /** エラー表示用の関数 */
  showError?: (msg: string) => void;
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

  // 距離段階ごとの振動設定をまとめたテーブル
  // Record 型: キーと値の組み合わせを表すオブジェクト
  const impactMap: Record<
    number,
    { style: Haptics.ImpactFeedbackStyle; duration: number }
  > = {
    1: { style: Haptics.ImpactFeedbackStyle.Heavy, duration: 400 },
    2: { style: Haptics.ImpactFeedbackStyle.Heavy, duration: 200 },
    3: { style: Haptics.ImpactFeedbackStyle.Medium, duration: 100 },
    4: { style: Haptics.ImpactFeedbackStyle.Medium, duration: 100 },
  };

  // マップにない値は Light を使用
  const impact =
    impactMap[scaled] ?? {
      style: Haptics.ImpactFeedbackStyle.Light,
      duration: 100,
    };

  const { style, duration } = impact;

  // 振動処理は失敗することがあるので try/catch 付きの関数を使う
  void safeImpact(style, opts.showError);
  const id = setInterval(() => {
    // setInterval でも同様に安全なラッパーを使用
    void safeImpact(style);
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
  try {
    const width = opts.width ?? UI.feedback.bumpWidth;
    const showTime = opts.showTime ?? UI.feedback.bumpShowTime;

    setColor(UI.colors.bump);
    // 壁にぶつかったときも安全に振動させる
    void safeImpact(Haptics.ImpactFeedbackStyle.Heavy, opts.showError);
    const id = setInterval(() => {
      void safeImpact(Haptics.ImpactFeedbackStyle.Heavy);
    }, 50);
    setTimeout(() => clearInterval(id), showTime);

    borderW.value = withSequence(
      withTiming(width, { duration: showTime / 2 }),
      withTiming(0, { duration: showTime / 2 }),
    );

    return showTime;
  } catch (e) {
    runOnJS(logError)('Worklet error', e);
    return 0;
  }
}
