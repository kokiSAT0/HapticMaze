import { useEffect, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from 'expo-audio';
import { useSharedValue } from 'react-native-reanimated';

import { useGame } from '@/src/game/useGame';
import { applyBumpFeedback, applyDistanceFeedback, nextPosition } from '@/src/game/utils';
import { showInterstitial } from '@/src/ads/interstitial';
import { useSnackbar } from '@/src/hooks/useSnackbar';
import {
  loadHighScore,
  saveHighScore,
  isBetterScore,
  type HighScore,
} from '@/src/game/highScore';
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
  const [highScore, setHighScore] = useState<HighScore | null>(null);
  const [newRecord, setNewRecord] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [debugAll, setDebugAll] = useState(false);
  // 再生中を視覚化するためのフラグ
  const [audioReady, setAudioReady] = useState(false);

  // 枠線色は壁衝突時のみ赤に変更する
  const [borderColor, setBorderColor] = useState('transparent');
  const borderW = useSharedValue(0);
  const maxBorder = width / 2;

  const [locked, setLocked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const bgmRef = useRef<AudioPlayer | null>(null);
  const moveRef = useRef<AudioPlayer | null>(null);

  // BGM と効果音を読み込む。コンポーネント初期化時に一度だけ実行
  useEffect(() => {
    (async () => {
      // サイレントモードでも再生できるように設定
      await setAudioModeAsync({ playsInSilentMode: true });

      // BGM を読み込みループ再生開始
      // createAudioPlayer は音声再生オブジェクトを生成する関数
      const bgm = createAudioPlayer(require('../../assets/sounds/タタリ.mp3'));
      bgm.loop = true;
      bgm.play();
      bgmRef.current = bgm;
      // BGM の再生開始を合図
      setAudioReady(true);

      // 移動時効果音を読み込み
      const mv = createAudioPlayer(require('../../assets/sounds/歩く音200ms_2.mp3'));
      moveRef.current = mv;
    })();
    return () => {
      bgmRef.current?.remove();
      moveRef.current?.remove();
      setAudioReady(false);
    };
  }, []);

  // 選択したレベルが変わったらハイスコアを読み込み直す
  useEffect(() => {
    if (!state.levelId) return;
    (async () => {
      const hs = await loadHighScore(state.levelId!);
      setHighScore(hs);
      setNewRecord(false);
    })();
  }, [state.levelId]);

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
        const current: HighScore = {
          stage: state.stage,
          steps: state.steps,
          bumps: state.bumps,
        };
        (async () => {
          const old = await loadHighScore(state.levelId!);
          const better = isBetterScore(old, current);
          if (better) {
            await saveHighScore(state.levelId!, current);
            setHighScore(current);
          } else {
            setHighScore(old);
          }
          setNewRecord(better && state.finalStage);
        })();
      } else {
        setNewRecord(false);
      }
    } else if (state.caught) {
      setGameOver(true);
      setStageClear(false);
      setShowResult(true);
      setDebugAll(true);
      if (state.levelId) {
        const current: HighScore = {
          stage: state.stage - 1,
          steps: state.steps,
          bumps: state.bumps,
        };
        (async () => {
          const old = await loadHighScore(state.levelId!);
          const better = isBetterScore(old, current);
          if (better) {
            await saveHighScore(state.levelId!, current);
            setHighScore(current);
          } else {
            setHighScore(old);
          }
          setNewRecord(better);
        })();
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
    if (gameOver) {
      resetRun();
    } else if (gameClear) {
      resetRun();
      router.replace('/');
    } else if (stageClear) {
      // デバッグ用: ステージ1クリア時もインタースティシャル広告を表示する
      if (state.stage % 9 === 0 || state.stage === 1) {
        try {
          await showInterstitial();
        } catch (e) {
          console.error('interstitial error', e);
          showSnackbar('広告を表示できませんでした');
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
      // 効果音を頭から再生するため seekTo(0) で位置を戻す
      moveRef.current?.seekTo(0);
      moveRef.current?.play();
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
    audioReady,
    borderColor,
    borderW,
    maxBorder,
    locked,
    handleMove,
    handleOk,
    handleReset,
    handleExit,
  } as const;
}
