import { useEffect, useRef, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { applyBumpFeedback, applyDistanceFeedback } from '@/src/game/feedback';
import { nextPosition } from '@/src/game/maze';
import type { Dir, MazeData, Vec2 } from '@/src/types/maze';

interface Options {
  statePos: Vec2;
  maze: MazeData;
  move: (dir: Dir) => boolean;
  playMoveSe: () => void;
  width: number;
}

/**
 * DPad 入力時の移動処理や演出を担当するフック
 */
export function useMoveHandler({
  statePos,
  maze,
  move,
  playMoveSe,
  width,
}: Options) {
  // 壁衝突時に表示する枠線の色
  const [borderColor, setBorderColor] = useState('transparent');
  // 枠線の幅を Reanimated で制御
  const borderW = useSharedValue(0);
  const maxBorder = width / 2;

  const [locked, setLocked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // コンポーネント破棄時はタイマーを解除
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  /** DPad からの入力処理 */
  const handleMove = (dir: Dir) => {
    if (locked) return;
    setLocked(true);
    const next = nextPosition(statePos, dir);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    let wait: number;
    if (!move(dir)) {
      wait = applyBumpFeedback(borderW, setBorderColor);
      setTimeout(() => setBorderColor('transparent'), wait);
    } else {
      playMoveSe();
      const maxDist = (maze.size - 1) * 2;
      const { wait: w, id } = applyDistanceFeedback(
        next,
        { x: maze.goal[0], y: maze.goal[1] },
        { maxDist },
      );
      wait = w;
      intervalRef.current = id;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setLocked(false), wait + 10);
  };

  return { borderColor, borderW, maxBorder, locked, handleMove } as const;
}
