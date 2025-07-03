import { useGame } from '@/src/game/useGame';
import { useAudioControls } from '@/src/hooks/useAudioControls';
import { useMoveHandler } from '@/src/hooks/useMoveHandler';
import { useResultHandler } from '@/src/hooks/useResultHandler';

/**
 * Play画面のロジックを統合するフック。
 * 各機能をサブフックに分割して実装する。
 */
export function usePlayLogic() {
  const { state, move, maze, nextStage, resetRun } = useGame();

  // サウンドの操作管理
  const {
    bgmVolume,
    seVolume,
    incBgm,
    decBgm,
    incSe,
    decSe,
    playMoveSe,
    pauseBgm,
    resumeBgm,
    audioReady,
  } = useAudioControls(require('../../assets/sounds/歩く音200ms_2.mp3'));

  // 移動に関する処理
  const {
    borderColor,
    borderW,
    maxBorder,
    locked,
    handleMove,
  } = useMoveHandler(state, maze, move, playMoveSe);

  // 結果表示やメニュー操作
  const {
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
  } = useResultHandler(state, maze, nextStage, resetRun, pauseBgm, resumeBgm);

  // 全ステージ数。迷路は正方形なので size の二乗
  const totalStages = maze.size * maze.size;

  return {
    state,
    maze,
    totalStages,
    showResult,
    gameOver,
    gameClear,
    highScore,
    newRecord,
    showMenu,
    setShowMenu,
    debugAll,
    setDebugAll,
    bgmVolume,
    seVolume,
    incBgm,
    decBgm,
    incSe,
    decSe,
    audioReady,
    borderColor,
    borderW,
    maxBorder,
    locked,
    okLocked,
    handleMove,
    handleOk,
    handleReset,
    handleExit,
  } as const;
}

