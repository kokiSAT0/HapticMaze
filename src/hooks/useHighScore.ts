import { useEffect, useState, useCallback } from 'react';
import { useSnackbar } from '@/src/hooks/useSnackbar';
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
  const { show: showSnackbar } = useSnackbar();
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
      const hs = await loadHighScore(levelId, { showError: showSnackbar });
      setHighScore(hs);
      setNewRecord(false);
    })();
  }, [levelId, showSnackbar]);

  /**
   * 現在のスコアを渡して、より良い記録なら保存する。
   * `finalStage` が true の場合のみ新記録表示を行う。
   */
  const updateScore = useCallback(async (score: HighScore, finalStage: boolean) => {
    if (!levelId) return;
    const old = await loadHighScore(levelId, { showError: showSnackbar });
    const better = isBetterScore(old, score);
    if (better) {
      await saveHighScore(levelId, score, { showError: showSnackbar });
      setHighScore(score);
    } else {
      setHighScore(old);
    }
    setNewRecord(better && finalStage);
  }, [levelId, showSnackbar]);

  return { highScore, newRecord, setNewRecord, updateScore } as const;
}
