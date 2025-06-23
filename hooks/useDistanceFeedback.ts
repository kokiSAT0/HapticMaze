import { useEffect, useRef } from 'react';
import type { Vec2 } from '@/src/types/maze';
import { applyDistanceFeedback } from '@/src/game/utils';
import type { SharedValue } from 'react-native-reanimated';

/**
 * 距離に応じたハプティックフィードバックを一定周期で発火させるフック。
 * pos と goal が変わるたびに周期を再計算し、振動と枠表示を行います。
 */
export function useDistanceFeedback(
  pos: Vec2,
  goal: Vec2,
  borderW: SharedValue<number>,
) {
  const timer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // 前回のタイマーを停止
    if (timer.current) clearTimeout(timer.current);

    // 一度実行後、戻り値 period に合わせて次回を予約
    const tick = () => {
      const wait = applyDistanceFeedback(pos, goal, borderW);
      timer.current = setTimeout(tick, wait);
    };

    tick();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [pos.x, pos.y, goal.x, goal.y, borderW]);
}
