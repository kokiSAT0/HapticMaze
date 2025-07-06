import { useEffect, useRef } from 'react';
import type { useRouter } from 'expo-router';

import { useHighScore } from '@/src/hooks/useHighScore';
import { useResultState } from '@/src/hooks/useResultState';
import { useStageEffects } from '@/src/hooks/useStageEffects';
import type { GameState } from '@/src/game/state';
import type { MazeData } from '@/src/types/maze';

interface Options {
  state: GameState;
  maze: MazeData;
  nextStage: () => void;
  resetRun: () => void;
  router: ReturnType<typeof useRouter>;
  showSnackbar: (msg: string) => void;
  pauseBgm: () => void;
  resumeBgm: () => void;
}

/**
 * リザルト表示やメニュー関連の状態を扱うフック
 */
export function useResultActions({
  state,
  maze,
  nextStage,
  resetRun,
  router,
  showSnackbar,
  pauseBgm,
  resumeBgm,
}: Options) {
  const {
    highScore,
    newRecord,
    setNewRecord,
    updateScore,
  } = useHighScore(state.levelId);

  const {
    showResult,
    setShowResult,
    gameOver,
    setGameOver,
    stageClear,
    setStageClear,
    gameClear,
    setGameClear,
    showMenu,
    setShowMenu,
    debugAll,
    setDebugAll,
    okLocked,
    setOkLocked,
  } = useResultState();

  const { showAdIfNeeded } = useStageEffects({
    pauseBgm,
    resumeBgm,
    showSnackbar,
  });
  const okLockedRef = useRef(false);

  // ゴール到達や捕まったときの処理をまとめる
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
    setStageClear,
    setGameOver,
    setShowResult,
    setDebugAll,
    setGameClear,
  ]);

  // OK ボタン押下時の処理
  const handleOk = async () => {
    if (okLockedRef.current) return;
    okLockedRef.current = true;
    setOkLocked(true);

    const currentStage = state.stage;
    // stageClear の値は setState で非同期に変化する可能性があるため
    // 先に変数へ退避しておく
    // フラグ(flag)とは処理分岐のための真偽値のこと
    const wasStageClear = stageClear;

    // 現在の状態をログに出すことでデバッグしやすくする
    console.log('handleOk start', {
      stage: state.stage,
      gameOver,
      gameClear,
      stageClear,
      showResult,
    });

    if (gameOver) {
      resetRun();
    } else if (gameClear) {
      resetRun();
      router.replace('/');
    }

    // リザルト関連のフラグを先にリセットしておく
    setShowResult(false);
    setGameOver(false);
    setDebugAll(false);
    setStageClear(false);
    setGameClear(false);
    setNewRecord(false);

    // ステート更新後の値を確認するための空await
    await Promise.resolve();

    console.log('after reset', {
      stageClear,
      showResult,
    });

    // wasStageClear の値を使って広告表示や次ステージ遷移を判断する
    if (wasStageClear) {
      console.log('showAdIfNeeded called with', currentStage);
      await showAdIfNeeded(currentStage);
      console.log('showAdIfNeeded finished', { stage: state.stage });
      nextStage();
      // nextStage はステージ番号を 1 増やす
      await Promise.resolve();
      console.log('after nextStage', { stage: state.stage });
    }

    okLockedRef.current = false;
    setOkLocked(false);
  };

  // リセット処理
  const handleReset = () => {
    setShowMenu(false);
    setGameOver(false);
    setStageClear(false);
    setGameClear(false);
    setNewRecord(false);
    resetRun();
  };

  // タイトルへ戻る処理
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
    showResult,
    gameOver,
    stageClear,
    gameClear,
    highScore,
    newRecord,
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
