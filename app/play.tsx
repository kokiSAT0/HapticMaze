import { View, Pressable, useWindowDimensions, Platform } from "react-native";

// React から必要なフックを個別にインポート
import { useEffect, useRef, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";

import { DPad } from "@/components/DPad";
import { MiniMap } from "@/src/components/MiniMap";
import type { MazeData as MazeView } from "@/src/types/maze";
import { useLocale } from "@/src/locale/LocaleContext";
import { usePlayLogic } from "@/src/hooks/usePlayLogic";
import { useBgm } from "@/src/hooks/useBgm";
// 広告表示に使う関数と無効化フラグを読み込む
import { showInterstitial, DISABLE_ADS } from "@/src/ads/interstitial";
import { useHandleError } from "@/src/utils/handleError";
import { ResultModal } from "@/components/ResultModal";
import { useRouter } from "expo-router";
import { EdgeOverlay } from "@/components/EdgeOverlay";
import { playStyles } from "@/src/styles/playStyles";
import { UI } from "@/constants/ui";
import { LEVELS } from "@/constants/levels";
import { useRunRecords } from "@/src/hooks/useRunRecords";
import { cmToDp } from "@/src/utils/layout";
import { devLog } from "@/src/utils/logger";

export default function PlayScreen() {
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const router = useRouter();
  const { incRespawn, incReveal } = useRunRecords();
  const {
    state,
    maze,
    totalStages,
    showResult,
    gameOver,
    gameClear,
    highScore,
    newRecord,
    debugAll,
    setDebugAll,
    revealUsed,
    setRevealUsed,
    borderColor,
    borderW,
    maxBorder,
    locked,
    okLocked,
    okLabel,
    showBanner,
    bannerStage,
    handleMove,
    handleOk,
    handleRespawn,
    respawnLocked,
    handleExit,
  } = usePlayLogic();

  // 広告読み込み中かどうかのフラグ
  const [revealLocked, setRevealLocked] = useState(false);

  // BGM 制御用フックを取得し広告表示の際に一時停止できるようにする
  const { pause: pauseBgm, resume: resumeBgm } = useBgm();
  const handleError = useHandleError();

  // レベル設定から周囲の壁表示フラグを取得
  const levelCfg = LEVELS.find((lv) => lv.id === state.levelId);
  const showAdjWalls = levelCfg?.showAdjacentWallsFn
    ? levelCfg.showAdjacentWallsFn(state.stage)
    : levelCfg?.showAdjacentWalls ?? false;

  // useEffect は指定した値が変わるたびに実行される React の仕組みです。
  // ここではプレイ画面の主な状態とバナー状態をログに出して
  // 今何が表示されているか確認しやすくします。
  useEffect(() => {
    devLog('[PlayScreen]', {
      stage: state.stage,
      showResult,
      gameOver,
      gameClear,
      showBanner,
      bannerStage,
    });
  }, [
    state.stage,
    showResult,
    gameOver,
    gameClear,
    showBanner,
    bannerStage,
  ]);


  // ステージバナー表示フラグが変化したときだけ遷移するようにする
  // これにより状態更新が遅れた場合でも無限ループを防げる
  // React をインポートしていないので useRef を直接使う
  const prevBanner = useRef(false);
  // router オブジェクトは再レンダー時に変わらないため
  // 依存配列から除外して無駄な再実行を防ぐ
  const { replace } = router;
  useEffect(() => {
    // bannerStage が 0 のときは表示データが無いので遷移しない
    if (showBanner && bannerStage > 0 && !prevBanner.current) {
      prevBanner.current = true;
      replace(`/stage?stage=${bannerStage}`);
    } else if (!showBanner && prevBanner.current) {
      // バナーが閉じられたらフラグを戻す
      prevBanner.current = false;

    }
  }, [showBanner, bannerStage, replace]);

  // 1cm を dp に変換し、UI 位置調整に利用
  const oneCm = cmToDp(1);

  // DPad は画面下 1/3 の位置から 1cm 上へずらす
  const dpadTop = height * (2 / 3) - oneCm;
  // ミニマップも同様に 1cm 上へ移動させる
  // mapTop は画面高さの 1/3 から 80px 引いた位置を基準とする
  const mapTop = height / 3 - 80 - oneCm;
  // リザルトパネルは DPad と同じ位置に表示する
  const resultTop = dpadTop;
  // リセットボタンの色計算は useMemo でメモ化する
  // 依存値が変わらない限り再計算されず無駄なレンダーを抑える
  const { resetColor, resetIcon } = useMemo(() => {
    const isEmpty = state.respawnStock <= 0;
    // "#555" (10進で 85) を基準に 0～3 回で白 (255) へ近づける
    const baseGray = parseInt(
      UI.colors.icon.replace('#', '').substring(0, 2),
      16,
    );
    // respawnMax が 0 または未設定なら無制限とみなして白に近づける
    const ratio =
      state.respawnMax && state.respawnMax > 0
        ? Math.min(state.respawnStock / state.respawnMax, 1)
        : 1;
    const gray = Math.round(baseGray + ratio * (255 - baseGray));
    if (__DEV__) {
      // DEBUG: 計算結果をコンソールに出力して確認する
      devLog('respawn color', {
        stock: state.respawnStock,
        max: state.respawnMax,
        ratio,
        gray,
      });
    }
    return {
      resetColor: isEmpty ? UI.colors.icon : `rgb(${gray},${gray},${gray})`,
      resetIcon: isEmpty ? 'refresh-outline' : 'refresh',
    };
  }, [state.respawnStock, state.respawnMax]);

  // 可視化ボタンの色設定
  // 広告なしで利用できるときは濃い白、それ以外は半透明の白にする
  const revealColor =
    revealUsed === 0 || debugAll
      ? UI.colors.revealFree
      : UI.colors.revealAd;

  // 全表示ボタンの処理
  // debugAll が true なら広告なしで OFF にする
  // OFF → ON は初回のみ無償、それ以降は広告視聴が必要
  const handleRevealAll = async () => {
    // 連打防止。ロック中は処理しない
    if (revealLocked) return;
    setRevealLocked(true);
    try {
      if (debugAll) {
        setDebugAll(false);
        return;
      }
      if (revealUsed === 0) {
        setDebugAll(true);
        setRevealUsed(1);
        incReveal();
        return;
      }
      // 広告が出る可能性があるときだけ BGM を止める
      const needMute = !DISABLE_ADS && Platform.OS !== "web";
      try {
        if (needMute) pauseBgm();
        await showInterstitial();
        setDebugAll(true);
        incReveal();
      } catch (e) {
        // showInterstitial が reject を返した場合にここへ到達
        // try/catch によりエラーメッセージが表示されることを確認する
        handleError("広告を表示できませんでした", e);
      } finally {
        if (needMute) resumeBgm();
      }
    } finally {
      setRevealLocked(false);
    }
  };

  return (
    <View style={[playStyles.container, { paddingTop: insets.top }]}>
      {/* 左上のホームボタン。家アイコンを表示しタイトルへ戻る */}
      <Pressable
        style={[playStyles.homeBtn, { top: insets.top + 10 }]}
        onPress={handleExit}
        accessibilityLabel="ホーム画面へ戻る"
      >
        <MaterialIcons name="home" size={24} color={UI.colors.icon} />
      </Pressable>
      {/* 枠線用のオーバーレイ。処理は EdgeOverlay にまとめた */}
      <EdgeOverlay
        borderColor={borderColor}
        borderW={borderW}
        maxBorder={maxBorder}
      />
      {/* 右上のリセットアイコン。敵だけを再配置する */}
      <Pressable
        style={[playStyles.resetBtn, { top: insets.top + 10 }]}
        onPress={() => {
          incRespawn();
          handleRespawn();
        }}
        disabled={respawnLocked}
        accessibilityLabel="敵をリスポーン"
      >
        {/* リスポーン回数が 0 回ならアウトライン表示に切り替える */}
        <Ionicons name={resetIcon} size={24} color={resetColor} />
      </Pressable>
      {/* 全てを可視化するボタン。押す度に表示/非表示を切り替える */}
      <Pressable
        style={[playStyles.menuBtn, { top: insets.top + 10 }]}
        onPress={handleRevealAll}
        disabled={revealLocked}
        accessibilityLabel={
          debugAll
            ? t("hideMazeAll")
            : revealUsed === 0
              ? t("showMazeAll")
              : t("watchAdForReveal")
        }
      >
        {/* debugAll の状態に応じてアイコンを変更 */}
        <MaterialIcons
          name={debugAll ? "visibility-off" : "visibility"}
          size={24}
          color={revealColor}
        />
      </Pressable>
      <View style={[playStyles.miniMapWrapper, { top: mapTop }]}>
        <MiniMap
          maze={maze as MazeView}
          path={state.path}
          pos={state.pos}
          enemies={state.enemies}
          enemyPaths={state.enemyPaths}
          visitedGoals={state.visitedGoals}
          showAll={debugAll}
          showResult={showResult}
          hitV={state.hitV}
          hitH={state.hitH}
          playerPathLength={state.playerPathLength}
          wallLifetime={state.wallLifetime}
          adjacentWalls={showAdjWalls}
          // ミニマップを300pxで表示する
          size={300}
        />
      </View>
      {!showResult && (
        <View style={[playStyles.dpadWrapper, { top: dpadTop }]}>
          <DPad onPress={handleMove} disabled={locked} />
        </View>
      )}
      <ResultModal
        visible={showResult}
        top={resultTop}
        title={
          gameClear ? t("gameClear") : gameOver ? t("gameOver") : t("goal")
        }
        steps={t("steps", { count: state.steps })}
        bumps={t("bumps", { count: state.bumps })}
        stageText={t("stage", { current: state.stage, total: totalStages })}
        highScore={highScore && (gameClear || gameOver) ? highScore : null}
        newRecord={newRecord && (gameClear || gameOver)}
        onOk={handleOk}
        okLabel={okLabel}
        accLabel={t("backToTitle")}
        disabled={okLocked}
      />
      {/* バナー表示時は Stage ページへ遷移する */}
    </View>
  );
}
