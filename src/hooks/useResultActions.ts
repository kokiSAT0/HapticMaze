import type { useRouter } from "expo-router";
import { useEffect, useCallback } from "react";
import { shouldChangeMap } from "@/src/game/maze";

import type { GameState } from "@/src/game/state";
import { useHighScore } from "@/src/hooks/useHighScore";
import { useResultState } from "@/src/hooks/useResultState";
import { clearGame } from "@/src/game/saveGame";
import type { MazeData } from "@/src/types/maze";
import { useLevelUnlock } from "@/src/hooks/useLevelUnlock";
import { useRunRecords } from "@/src/hooks/useRunRecords";
import { useBannerControl } from "@/src/hooks/useBannerControl";
import { useAdManager } from "@/src/hooks/useAdManager";
import { devLog } from "@/src/utils/logger";

interface Options {
  state: GameState;
  maze: MazeData;
  nextStage: () => void;
  resetRun: () => void;
  router: ReturnType<typeof useRouter>;
  showSnackbar?: (msg: string) => void;
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

  // 各ステージの記録を扱う
  const { addRecord, reset } = useRunRecords();

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
    setOkLocked,
    adShown,
    setAdShown,
    showBanner,
    setShowBanner,
    bannerStage,
    setBannerStage,
    setBannerShown,
    revealUsed,
    setRevealUsed,
  } = useResultState();

  const { markCleared } = useLevelUnlock();

  const banner = useBannerControl({
    stage: state.stage,
    steps: state.steps,
    totalSteps: state.totalSteps,
  });

  const {
    okLabel,
    okLocked,
    okLockedRef,
    preloadAd,
    showLoadedAd,
    resetLabel,
  } = useAdManager({
    stage: state.stage,
    finalStage: state.finalStage,
    levelId: state.levelId,
    pauseBgm,
    resumeBgm,
  });


  // ゴール到達や捕まったときの処理をまとめる
  useEffect(() => {
    // バナー表示中やリザルト表示中は判定をスキップする
    // showResult が true の間も処理が繰り返されないようにする
    if (banner.bannerActiveRef.current || showBanner || showResult) return;
    // 次のステージで迷路が切り替わるかを判定
    // tutorial は 5, それ以降は 3 ステージごとに切り替わる
    const willChangeMap = shouldChangeMap(state.stage, state.stagePerMap);
    if (state.pos.x === maze.goal[0] && state.pos.y === maze.goal[1]) {
      setStageClear(true);
      setGameOver(false);
      setGameClear(state.finalStage);
      setShowResult(true);
      setAdShown(false);
      setDebugAll(willChangeMap);
      // 広告読み込みと OK ラベル設定を委譲
      preloadAd();
      if (state.levelId) {
        const current = {
          stage: state.stage,
          steps: state.totalSteps,
          bumps: state.totalBumps,
        };
        updateScore(current, state.finalStage);
        if (state.finalStage) {
          markCleared(state.levelId);
        }
      } else {
        setNewRecord(false);
      }
    } else if (state.caught) {
      setGameOver(true);
      setStageClear(false);
      setShowResult(true);
      setAdShown(false);
      setDebugAll(true);
      resetLabel();
      if (state.levelId) {
        const current = {
          stage: state.stage - 1,
          steps: state.totalSteps,
          bumps: state.totalBumps,
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
    state.stagePerMap,
    maze.size,
    state.totalSteps,
    state.totalBumps,
    showBanner,
    showResult,
    state.levelId,
    updateScore,
    setNewRecord,
    setStageClear,
    setGameOver,
    setShowResult,
    setDebugAll,
    setGameClear,
    setAdShown,
    markCleared,
    preloadAd,
    resetLabel,
    banner.bannerActiveRef,
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
    devLog("handleOk start", {
      stage: state.stage,
      gameOver,
      gameClear,
      stageClear,
      showResult,
    });

    if (gameOver) {
      addRecord(state.stage, state.steps, state.bumps);
      // === ゲームオーバー時の処理 ===
      // 1. ランを初期状態へ戻す
      resetRun();
      // 2. 中断セーブを削除して続きから再開できないようにする
      await clearGame(showSnackbar ? { showError: showSnackbar } : undefined);
      // 3. 各種表示フラグをリセットする
      setShowResult(false);
      setGameOver(false);
      setStageClear(false);
      setGameClear(false);
      setNewRecord(false);
      setAdShown(false);
      // ゲームオーバー後は可視化状態を引き継がないようリセット
      setDebugAll(false);
      // 4. OK ボタンのロック状態も解除
      okLockedRef.current = false;
      setOkLocked(false);
      // 5. 念のためバナー表示も強制終了
      setShowBanner(false);
      banner.bannerActiveRef.current = false;
      // 6. ホーム画面へ戻る
      await router.replace("/");
      // ここで return して以降の処理を行わない
      return;
    } else if (gameClear) {
      // ゲームクリア時はリザルト一覧へ遷移
      addRecord(state.stage, state.steps, state.bumps);
      resetRun();
      // ゲームクリア後はステージ1バナーを再度出さないように
      // bannerShown フラグを true に更新する
      setBannerShown(true);
      // ゲームオーバーと同じく中断データを削除する
      await clearGame(showSnackbar ? { showError: showSnackbar } : undefined);
      setShowResult(false);
      setGameOver(false);
      setStageClear(false);
      setGameClear(false);
      setNewRecord(false);
      setAdShown(false);
      okLockedRef.current = false;
      setOkLocked(false);
      router.replace("/game-result");
      return;
    }

    // ステージクリア直後で広告未表示なら広告を表示
    if (wasStageClear && !adShown) {
      setAdShown(true);
      const shown = await showLoadedAd();
      // 広告が表示されたときのみボタンラベルを変更して処理を終了
      if (shown) {
        okLockedRef.current = false;
        setOkLocked(false);
        return;
      }
    }

    // 次ステージ番号を設定しバナーを表示
    banner.startBanner(state.stage + 1);
    // ステージクリア時はここでステージを進める
    if (wasStageClear) {
      addRecord(state.stage, state.steps, state.bumps);
      nextStage();
    }
    // バナー表示中は判定をスキップする
    banner.bannerActiveRef.current = true;


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
      resetLabel();
    }

    // ステート更新後の値を確認するための空 await
    await Promise.resolve();

    devLog("after reset", {
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
    banner.bannerActiveRef.current = false;
    // バナー表示後に OK ボタンのラベルを戻す
    resetLabel();
    okLockedRef.current = false;
    setOkLocked(false);
  }, [setShowBanner, resetLabel, setOkLocked, banner.bannerActiveRef, okLockedRef]);

  // モーダルのフェードアウトが終わった後に番号をリセットする
  const handleBannerDismiss = useCallback(() => {
    setBannerStage(0);
  }, [setBannerStage]);

  // リセット処理
  const handleReset = () => {
    setShowMenu(false);
    setGameOver(false);
    setStageClear(false);
    setGameClear(false);
    setNewRecord(false);
    setAdShown(false);
    // 可視化フラグを初期化
    setDebugAll(false);
    // 全表示ボタンの使用回数もリセット
    setRevealUsed(0);
    // 初期ステージへ戻るのでバナー表示済みフラグもリセットする
    setBannerShown(false);
    // ステージ記録もリセットする
    reset();
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
    // タイトルへ戻る際に可視化フラグをリセット
    setDebugAll(false);
    // こちらも使用回数を初期化する
    setRevealUsed(0);
    // 次回開始時にステージバナーを表示するためフラグを戻す
    setBannerShown(false);
    // 記録は残したままにするのでここでは reset() しない
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
    revealUsed,
    setRevealUsed,
    okLocked,
    okLabel,
    showBanner,
    bannerStage,
    handleBannerFinish,
    handleBannerDismiss,
    handleOk,
    handleReset,
    handleExit,
  } as const;
}
