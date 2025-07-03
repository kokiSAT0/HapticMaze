import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

import { showInterstitial } from '@/src/ads/interstitial';
import { useSnackbar } from '@/src/hooks/useSnackbar';
import { useHighScore } from '@/src/hooks/useHighScore';
import type { GameState } from '@/src/game/state';
import type { MazeData } from '@/src/types/maze';

/**
 * ゴールに到達したときや敵に捕まったときなど、
 * 結果表示に関する状態を管理するフック。
 */
export function useResultHandler(
  state: GameState,
  maze: MazeData,
  nextStage: () => void,
  resetRun: () => void,
  pauseBgm: () => void,
  resumeBgm: () => void,
) {
  const router = useRouter();
  const { show: showSnackbar } = useSnackbar();
  const { highScore, newRecord, setNewRecord, updateScore } = useHighScore(
    state.levelId,
  );

  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [stageClear, setStageClear] = useState(false);
  const [gameClear, setGameClear] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [debugAll, setDebugAll] = useState(false);
  const [okLocked, setOkLocked] = useState(false);

  // ゴール到達と敵捕捉の判定
  useEffect(() => {
    const willChangeMap = state.stage % maze.size === 0;
    if (state.pos.x === maze.goal[0] && state.pos.y === maze.goal[1]) {
      setStageClear(true);
      setGameOver(false);
      setGameClear(state.finalStage);
      setShowResult(true);
      setDebugAll(willChangeMap);
      if (state.levelId) {
        const current = {
          stage: state.stage,
          steps: state.steps,
          bumps: state.bumps,
        };
        updateScore(current, state.finalStage);
      } else {
        setNewRecord(false);
      }
    } else if (state.caught) {
      setGameOver(true);
      setStageClear(false);
      setShowResult(true);
      setDebugAll(true);
      if (state.levelId) {
        const current = {
          stage: state.stage - 1,
          steps: state.steps,
          bumps: state.bumps,
        };
        updateScore(current, false);
      } else {
        setNewRecord(false);
      }
    }
  }, [
    state.pos,
    state.caught,
    maze.goal,
    state.finalStage,
    state.stage,
    maze.size,
    state.steps,
    state.bumps,
    state.levelId,
    updateScore,
    setNewRecord,
  ]);

  /**
   * 結果モーダルで OK を押した時の処理
   */
  const handleOk = async () => {
    if (okLocked) return;
    setOkLocked(true);
    if (gameOver) {
      resetRun();
    } else if (gameClear) {
      resetRun();
      router.replace('/');
    } else if (stageClear) {
      if (state.stage % 9 === 0 || state.stage === 1) {
        try {
          pauseBgm();
          await showInterstitial();
        } catch (e) {
          console.error('interstitial error', e);
          showSnackbar('広告を表示できませんでした');
        } finally {
          resumeBgm();
        }
      }
      nextStage();
    }
    setShowResult(false);
    setGameOver(false);
    setDebugAll(false);
    setStageClear(false);
    setGameClear(false);
    setNewRecord(false);
    setOkLocked(false);
  };

  /** Reset Maze が選ばれたときの処理 */
  const handleReset = () => {
    setShowMenu(false);
    setGameOver(false);
    setStageClear(false);
    setGameClear(false);
    setNewRecord(false);
    resetRun();
  };

  /** タイトルへ戻る処理 */
  const handleExit = () => {
    setShowMenu(false);
    setGameOver(false);
    setStageClear(false);
    setGameClear(false);
    setNewRecord(false);
    resetRun();
    router.replace('/');
  };

  return {
    highScore,
    newRecord,
    showResult,
    gameOver,
    gameClear,
    showMenu,
    setShowMenu,
    debugAll,
    setDebugAll,
    okLocked,
    handleOk,
    handleReset,
    handleExit,
  } as const;
}

