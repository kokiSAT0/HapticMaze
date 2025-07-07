import { useEffect, useRef, useState } from "react";
import type { useRouter } from "expo-router";

import { useHighScore } from "@/src/hooks/useHighScore";
import { useResultState } from "@/src/hooks/useResultState";
import { useStageEffects } from "@/src/hooks/useStageEffects";
import { useLocale } from "@/src/locale/LocaleContext";
import type { InterstitialAd } from "react-native-google-mobile-ads";
import type { GameState } from "@/src/game/state";
import type { MazeData } from "@/src/types/maze";

// OKボタンのロックを解除するまでの待ち時間(ms)
const OK_UNLOCK_DELAY = 500;

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
  const { highScore, newRecord, setNewRecord, updateScore } = useHighScore(
    state.levelId,
  );

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
    adShown,
    setAdShown,
    showBanner,
    setShowBanner,
  } = useResultState();

  const { t } = useLocale();

  // OK ボタンのラベルを動的に変えるための状態
  const [okLabel, setOkLabel] = useState(t("ok"));

  // 読み込み済み広告を保持する参照
  const loadedAdRef = useRef<InterstitialAd | null>(null);

  const { loadAdIfNeeded, showAd } = useStageEffects({
    pauseBgm,
    resumeBgm,
    showSnackbar,
  });
  const okLockedRef = useRef(false);

  // リザルト画面が表示されている間に OK ボタンが押せなくなる
  // (ロックされたままになる) 状態を避けるための処理
  useEffect(() => {
    // showResult が true かつボタンがロックされているときのみ解除タイマーを設定
    if (showResult && okLocked) {
      // setTimeout で少し待ってからロックを解除する
      // number 型の ID が返るため型を明示している
      const id: ReturnType<typeof setTimeout> = setTimeout(() => {
        okLockedRef.current = false;
        setOkLocked(false);
      }, OK_UNLOCK_DELAY);
      // showResult が変化した場合はタイマーをクリア
      return () => clearTimeout(id);
    }
  }, [showResult, okLocked, setOkLocked]);

  // ゴール到達や捕まったときの処理をまとめる
  useEffect(() => {
    const willChangeMap = state.stage % maze.size === 0;
    if (state.pos.x === maze.goal[0] && state.pos.y === maze.goal[1]) {
      setStageClear(true);
      setGameOver(false);
      setGameClear(state.finalStage);
      setShowResult(true);
      setAdShown(false);
      setDebugAll(willChangeMap);
      // 広告を事前に読み込み、完了まで OK ボタンをロック
      okLockedRef.current = true;
      setOkLocked(true);
      setOkLabel(t("loadingAd"));
      loadAdIfNeeded(state.stage).then((ad) => {
        loadedAdRef.current = ad;
        setOkLabel(ad ? t("showAd") : t("ok"));
        okLockedRef.current = false;
        setOkLocked(false);
      });
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
      setAdShown(false);
      setDebugAll(true);
      loadedAdRef.current = null;
      setOkLabel(t("ok"));
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
    setAdShown,
    loadAdIfNeeded,
    t,
    setOkLocked,
    setOkLabel,
  ]);

  // OK ボタン押下時の処理
  const handleOk = async () => {
    if (okLockedRef.current) return;
    okLockedRef.current = true;
    setOkLocked(true);

    // stageClear の値は setState で非同期に変化する可能性があるため
    // 先に変数へ退避しておく
    // フラグ(flag)とは処理分岐のための真偽値のこと
    const wasStageClear = stageClear;

    // 現在の状態をログに出すことでデバッグしやすくする
    console.log("handleOk start", {
      stage: state.stage,
      gameOver,
      gameClear,
      stageClear,
      showResult,
    });

    if (gameOver) {
      // ゲームオーバー時はランをリセットしてタイトルへ戻る
      resetRun();
      router.replace("/");
    } else if (gameClear) {
      resetRun();
      router.replace("/");
    }

    // ステージクリア直後で広告未表示なら広告を検討
    if (wasStageClear && !adShown) {
      setShowResult(false);
      setAdShown(true);
      await showAd(loadedAdRef.current);
      loadedAdRef.current = null;
    }

    // リザルト関連のフラグをリセット
    setShowResult(false);
    setGameOver(false);
    setDebugAll(false);
    setStageClear(false);
    setGameClear(false);
    setNewRecord(false);
    setAdShown(false);
    setOkLabel(t("ok"));

    // ステート更新後の値を確認するための空await
    await Promise.resolve();

    console.log("after reset", {
      stageClear,
      showResult,
    });

    // 次ステージ番号を一瞬表示してから進む
    setShowBanner(true);
    setTimeout(() => {
      if (wasStageClear) {
        nextStage();
      }
      setShowBanner(false);
      okLockedRef.current = false;
      setOkLocked(false);
    }, 1000);
  };

  // リセット処理
  const handleReset = () => {
    setShowMenu(false);
    setGameOver(false);
    setStageClear(false);
    setGameClear(false);
    setNewRecord(false);
    setAdShown(false);
    resetRun();
  };

  // ステートを保持したままタイトルへ戻る処理
  const handleExit = () => {
    setShowMenu(false);
    setGameOver(false);
    setStageClear(false);
    setGameClear(false);
    setNewRecord(false);
    setAdShown(false);
    router.replace("/");
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
    okLabel,
    showBanner,
    handleOk,
    handleReset,
    handleExit,
  } as const;
}
