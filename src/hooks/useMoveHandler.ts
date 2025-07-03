import { useEffect, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { applyBumpFeedback, applyDistanceFeedback } from '@/src/game/feedback';
import { nextPosition } from '@/src/game/maze';
import type { Dir, MazeData } from '@/src/types/maze';
import type { GameState } from '@/src/game/state';

/**
 * DPadでの移動を処理するフック。
 * 壁への衝突時の振動や枠線エフェクトをまとめています。
 */
export function useMoveHandler(
  state: GameState,
  maze: MazeData,
  move: (dir: Dir) => boolean,
  playMoveSe: () => void,
) {
  // 幅積を計算して枠線表示範囲を決める
  const { width } = useWindowDimensions();
  // 枠線の色、大きさを管理
  const [borderColor, setBorderColor] = useState('transparent');
  const borderW = useSharedValue(0);
  const maxBorder = width / 2;

  // ボタン連打を防ぐためのロック
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * DPadの入力から移動処理を実行する
   */
  const handleMove = (dir: Dir) => {
    if (locked) return;
    setLocked(true);
    const next = nextPosition(state.pos, dir);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    let wait: number;
    if (!move(dir)) {
      wait = applyBumpFeedback(borderW, setBorderColor);
      setTimeout(() => setBorderColor('transparent'), wait);
    } else {
      // 移動音を再生
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

  // コンポーネント解放時にタイマーを消去
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { borderColor, borderW, maxBorder, locked, handleMove } as const;
}

