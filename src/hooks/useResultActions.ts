import type { useRouter } from "expo-router";
import { useEffect, useRef, useState, useCallback } from "react";

import type { GameState } from "@/src/game/state";
import { useHighScore } from "@/src/hooks/useHighScore";
import { useResultState } from "@/src/hooks/useResultState";
import { useStageEffects } from "@/src/hooks/useStageEffects";
import { useLocale } from "@/src/locale/LocaleContext";
import type { MazeData } from "@/src/types/maze";
import type { InterstitialAd } from "react-native-google-mobile-ads";

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
    state.levelId
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
    bannerStage,
    setBannerStage,
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
  // バナー表示中かどうかを判定するフラグ。表示中はリザルト判定を行わない
  const bannerActiveRef = useRef(false);
  // バナー表示後に次のステージへ進むかどうかを保持するフラグ
  const pendingNextStageRef = useRef(false);

  // ゴール到達や捕まったときの処理をまとめる
  useEffect(() => {
    // バナー表示中は旧ステージの判定をスキップする
    if (bannerActiveRef.current) return;
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
        // 広告が無ければ最初から「次のステージへ」と表示する
        setOkLabel(ad ? t("showAd") : t("nextStage"));
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

    // ステージクリア直後で広告未表示なら広告を表示
    if (wasStageClear && !adShown) {
      setAdShown(true);
      const shown = await showAd(loadedAdRef.current);
      loadedAdRef.current = null;
      // 広告が表示されたときのみボタンラベルを変更して処理を終了
      if (shown) {
        setOkLabel(t("nextStage"));
        okLockedRef.current = false;
        setOkLocked(false);
        return;
      }
    }

    // 次ステージ番号を表示しながら内部状態を初期化する
    // 先にバナーを表示することで画面遷移をスムーズにする
    setBannerStage(state.stage + 1);
    setShowBanner(true);
    // バナー表示中は判定をスキップするためフラグを立てる
    bannerActiveRef.current = true;


    // ステージクリア時はバナー後に次ステージへ進む
    if (wasStageClear) {
      pendingNextStageRef.current = true;
    }


    // リザルト関連のフラグをリセットする
    // これらは次のステージへ進む前に初期化したい状態
    setShowResult(false);
    setGameOver(false);
    setDebugAll(false);
    setStageClear(false);
    setGameClear(false);
    setNewRecord(false);
    setAdShown(false);
    // ステージクリアしていない場合は直ちにラベルを戻す
    if (!wasStageClear) {
      setOkLabel(t("ok"));
    }

    // ステート更新後の値を確認するための空 await
    await Promise.resolve();

    console.log("after reset", {
      stageClear,
      showResult,
    });
  };

  /**
   * ステージバナーが閉じた後に呼ばれる処理
   * ロック解除など後片付けをここで行う
   */
  const handleBannerFinish = useCallback(() => {
    setShowBanner(false);
    bannerActiveRef.current = false;
    if (pendingNextStageRef.current) {
      nextStage();
      pendingNextStageRef.current = false;
    }
    // バナー表示後に OK ボタンのラベルを戻す
    setOkLabel(t("ok"));
    okLockedRef.current = false;
    setOkLocked(false);
  }, [nextStage, setShowBanner, setOkLabel, setOkLocked, t]);

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
    bannerStage,
    handleBannerFinish,
    handleOk,
    handleReset,
    handleExit,
  } as const;
}
