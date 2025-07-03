import { useEffect, useState } from 'react';
import {
  loadHighScore,
  saveHighScore,
  isBetterScore,
  type HighScore,
} from '@/src/game/highScore';

/**
 * ハイスコアの読み込みと更新を行うフック。
 * levelId が変わるたびにスコアを読み込み直す。
 */
export function useHighScore(levelId: string | null | undefined) {
  // 現在保存されているハイスコア
  const [highScore, setHighScore] = useState<HighScore | null>(null);
  // 新記録かどうかを示すフラグ
  const [newRecord, setNewRecord] = useState(false);

  // levelId が変わったときはハイスコアを再取得する
  useEffect(() => {
    if (!levelId) {
      setHighScore(null);
      setNewRecord(false);
      return;
    }
    (async () => {
      const hs = await loadHighScore(levelId);
      setHighScore(hs);
      setNewRecord(false);
    })();
  }, [levelId]);

  /**
   * 現在のスコアを渡して、より良い記録なら保存する。
   * `finalStage` が true の場合のみ新記録表示を行う。
   */
  const updateScore = async (score: HighScore, finalStage: boolean) => {
    if (!levelId) return;
    const old = await loadHighScore(levelId);
    const better = isBetterScore(old, score);
    if (better) {
      await saveHighScore(levelId, score);
      setHighScore(score);
    } else {
      setHighScore(old);
    }
    setNewRecord(better && finalStage);
  };

  return { highScore, newRecord, setNewRecord, updateScore } as const;
}
