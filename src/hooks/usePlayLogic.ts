import { useEffect, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSharedValue } from 'react-native-reanimated';

import { useGame } from '@/src/game/useGame';
// フィードバックと座標計算のヘルパーは分割したモジュールから読み込む
import { applyBumpFeedback, applyDistanceFeedback } from '@/src/game/feedback';
import { nextPosition } from '@/src/game/maze';
import { showInterstitial } from '@/src/ads/interstitial';
import { useSnackbar } from '@/src/hooks/useSnackbar';
import { useBgm } from '@/src/hooks/useBgm';
import { useSE } from '@/src/hooks/useSE';
import { useHighScore } from '@/src/hooks/useHighScore';
import type { Dir } from '@/src/types/maze';

/**
 * Play 画面で利用するロジックをまとめたカスタムフック
 */
export function usePlayLogic() {
  const router = useRouter();
  const { state, move, maze, nextStage, resetRun } = useGame();
  const { width } = useWindowDimensions();
  const { show: showSnackbar } = useSnackbar();

  // ステージ総数。迷路は正方形なので size×size となる
  const totalStages = maze.size * maze.size;

  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [stageClear, setStageClear] = useState(false);
  const [gameClear, setGameClear] = useState(false);
  const {
    highScore,
    newRecord,
    setNewRecord,
    updateScore,
  } = useHighScore(state.levelId);
  const [showMenu, setShowMenu] = useState(false);
  const [debugAll, setDebugAll] = useState(false);
  // 効果音が鳴ったかどうかを示すフラグ
  const [audioReady, setAudioReady] = useState(false);

  // 枠線色は壁衝突時のみ赤に変更する
  const [borderColor, setBorderColor] = useState('transparent');
  const borderW = useSharedValue(0);
  const maxBorder = width / 2;

  const [locked, setLocked] = useState(false);
  // OK ボタン連打を防ぐためのフラグ
  const [okLocked, setOkLocked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { volume: bgmVolume, setVolume: setBgmVolume, pause: pauseBgm, resume: resumeBgm } = useBgm();
  const {
    volume: seVolume,
    setVolume: setSeVolume,
    play: playMoveSe,
  } = useSE(require('../../assets/sounds/歩く音200ms_2.mp3'));


  // ハイスコアの読み込みは useHighScore 内で行う

  // ゴール到達や敵に捕まった際の処理をまとめる
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

  // コンポーネントが破棄される際にタイマーを解除
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  /**
   * リザルトモーダルで OK を押した際の処理
   */
  const handleOk = async () => {
    // ボタン連打で複数回処理が走らないようロック
    if (okLocked) return;
    setOkLocked(true);
    if (gameOver) {
      resetRun();
    } else if (gameClear) {
      resetRun();
      router.replace('/');
    } else if (stageClear) {
      // デバッグ用: ステージ1クリア時もインタースティシャル広告を表示する
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

  // BGM 音量を 0.1 刻みで調整する
  const incBgm = () =>
    setBgmVolume(Math.min(1, Math.round((bgmVolume + 0.1) * 10) / 10));
  const decBgm = () =>
    setBgmVolume(Math.max(0, Math.round((bgmVolume - 0.1) * 10) / 10));
  // 効果音(SE) 音量を調整
  const incSe = () =>
    setSeVolume((v) => Math.min(1, Math.round((v + 0.1) * 10) / 10));
  const decSe = () =>
    setSeVolume((v) => Math.max(0, Math.round((v - 0.1) * 10) / 10));

  /** DPad からの入力処理 */
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
      // 効果音を再生
      playMoveSe();
      // 効果音が鳴ったことをUIで示す
      setAudioReady(true);
      setTimeout(() => setAudioReady(false), 200);
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
