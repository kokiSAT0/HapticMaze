import { useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-audio';
import { useWindowDimensions, Platform } from 'react-native';
import { useAnimatedProps, useAnimatedStyle, useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useGame } from '@/src/game/useGame';
import type { Dir } from '@/src/types/maze';
import { applyBumpFeedback, applyDistanceFeedback, nextPosition } from '@/src/game/utils';
import { useLocale } from '@/src/locale/LocaleContext';
import { showInterstitial } from '@/src/ads/interstitial';
import { loadHighScore, saveHighScore, isBetterScore, type HighScore } from '@/src/game/highScore';

export function usePlayLogic() {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const { state, move, maze, nextStage, resetRun } = useGame();
  const { t } = useLocale();

  // 迷路サイズから総ステージ数を計算
  const totalStages = maze.size * maze.size;

  // 各種状態管理 -------------------------------
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [stageClear, setStageClear] = useState(false);
  const [gameClear, setGameClear] = useState(false);
  const [highScore, setHighScore] = useState<HighScore | null>(null);
  const [newRecord, setNewRecord] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [debugAll, setDebugAll] = useState(false);
  const [locked, setLocked] = useState(false);

  // 枠線関連
  const [borderColor, setBorderColor] = useState('transparent');
  const borderW = useSharedValue(0);
  const maxBorder = width / 2; // ゴール時の最大太さ

  const vertStyle = useAnimatedStyle(() => ({ height: borderW.value }));
  const horizStyle = useAnimatedStyle(() => ({ width: borderW.value }));
  const gradColors: [string, string, string] = [borderColor, borderColor, 'transparent'];
  const gradStops = useDerivedValue<[number, number, number]>(() => {
    const ratio = Math.min(borderW.value / maxBorder, 1);
    const loc = 0.2 + ratio * 0.5;
    return [0, loc, 1];
  });
  const gradProps = useAnimatedProps(() => ({ locations: gradStops.value }));
  const gradLocs = Platform.OS === 'web' ? [0, 0.2, 1] : undefined;

  // 各種参照 -----------------------------
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const bgmRef = useRef<Audio.Sound | null>(null);
  const moveRef = useRef<Audio.Sound | null>(null);

  // BGM と効果音を読み込む
  useEffect(() => {
    (async () => {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const bgm = new Audio.Sound();
      await bgm.loadAsync(require('../../assets/sounds/タタリ.mp3'));
      await bgm.setIsLoopingAsync(true);
      await bgm.playAsync();
      bgmRef.current = bgm;

      const mv = new Audio.Sound();
      await mv.loadAsync(require('../../assets/sounds/歩く音200ms_2.mp3'));
      moveRef.current = mv;
    })();
    return () => {
      bgmRef.current?.unloadAsync();
      moveRef.current?.unloadAsync();
    };
  }, []);

  // レベル切り替えでハイスコアを読み込む
  useEffect(() => {
    if (!state.levelId) return;
    (async () => {
      const hs = await loadHighScore(state.levelId!);
      setHighScore(hs);
      setNewRecord(false);
    })();
  }, [state.levelId]);

  // ゴールやゲームオーバーの判定
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
  }, [state.pos, state.caught, maze.goal, state.finalStage, state.stage, maze.size, state.steps, state.bumps, state.levelId]);

  // アンマウント時にタイマーを解除
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // DPad 入力処理
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
      moveRef.current?.replayAsync();
      const maxDist = (maze.size - 1) * 2;
      const { wait: w, id } = applyDistanceFeedback(next, { x: maze.goal[0], y: maze.goal[1] }, { maxDist });
      wait = w;
      intervalRef.current = id;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setLocked(false), wait + 10);
  };

  // OK ボタン処理
  const handleOk = async () => {
    if (gameOver) {
      resetRun();
    } else if (gameClear) {
      resetRun();
      router.replace('/');
    } else if (stageClear) {
      if (state.stage % 9 === 0) {
        await showInterstitial();
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

  const handleReset = () => {
    setShowMenu(false);
    setGameOver(false);
    setStageClear(false);
    setGameClear(false);
    setNewRecord(false);
    resetRun();
  };

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
    t,
    height,
    totalStages,
    state,
    maze,
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
    locked,
    borderW,
    borderColor,
    vertStyle,
    horizStyle,
    gradColors,
    gradProps,
    gradLocs,
    handleMove,
    handleOk,
    handleReset,
    handleExit,
  };
}

export type UsePlayLogicReturn = ReturnType<typeof usePlayLogic>;
