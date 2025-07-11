import { View, Pressable, useWindowDimensions } from "react-native";
import { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { DPad } from "@/components/DPad";
import { MiniMap } from "@/src/components/MiniMap";
import type { MazeData as MazeView } from "@/src/types/maze";
import { useLocale } from "@/src/locale/LocaleContext";
import { usePlayLogic } from "@/src/hooks/usePlayLogic";
import { useBgm } from "@/src/hooks/useBgm";
import { useStageEffects } from "@/src/hooks/useStageEffects";
import { ResultModal } from "@/components/ResultModal";
import { useRouter } from "expo-router";
import { EdgeOverlay } from "@/components/EdgeOverlay";
import { playStyles } from "@/src/styles/playStyles";
import { UI } from "@/constants/ui";
import { LEVELS } from "@/constants/levels";

export default function PlayScreen() {
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const router = useRouter();
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
    handleExit,
  } = usePlayLogic();

  // BGM 制御用フックを取得し広告表示の際に一時停止できるようにする
  const { pause: pauseBgm, resume: resumeBgm } = useBgm();
  const { showAd } = useStageEffects({
    pauseBgm,
    resumeBgm,
    levelId: state.levelId,
  });

  // レベル設定から周囲の壁表示フラグを取得
  const levelCfg = LEVELS.find((lv) => lv.id === state.levelId);
  const showAdjWalls = levelCfg?.showAdjacentWallsFn
    ? levelCfg.showAdjacentWallsFn(state.stage)
    : levelCfg?.showAdjacentWalls ?? false;

  // useEffect は指定した値が変わるたびに実行される React の仕組みです。
  // ここではプレイ画面の主な状態とバナー状態をログに出して
  // 今何が表示されているか確認しやすくします。
  useEffect(() => {
    console.log('[PlayScreen]', {
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

  // ステージバナー表示フラグが立ったら専用ページへ移動
  useEffect(() => {
    // bannerStage が 0 のときは表示データが無いので遷移しない
    if (showBanner && bannerStage > 0) {
      router.replace(`/stage?stage=${bannerStage}`);
    }
  }, [showBanner, bannerStage, router]);

  const dpadTop = height * (2 / 3);
  // ミニマップはリザルトパネルと重ならないよう少し上に配置する
  // mapTop は画面高さの 1/3 から 80px 引いた位置
  const mapTop = height / 3 - 80;
  // リザルトパネルは DPad と同じ位置に表示する
  const resultTop = dpadTop;
  // リセットボタンの色。使用回数に応じて白から黒へ変化させる
  const gray = Math.round((state.respawnStock / 3) * 255);
  const resetColor = `rgb(${gray},${gray},${gray})`;

  // 全表示ボタンの処理。未使用ならそのままON、2回目以降は広告後にON
  const handleRevealAll = async () => {
    if (revealUsed === 0) {
      setDebugAll(true);
      setRevealUsed(1);
      return;
    }
    const shown = await showAd(null);
    if (shown) setDebugAll(true);
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
        onPress={handleRespawn}
        accessibilityLabel="敵をリスポーン"
      >
        <MaterialIcons name="refresh" size={24} color={resetColor} />
      </Pressable>
      {/* 全てを可視化するボタン。押す度に表示/非表示を切り替える */}
      <Pressable
        style={[playStyles.menuBtn, { top: insets.top + 10 }]}
        onPress={handleRevealAll}
        accessibilityLabel={
          revealUsed === 0 ? t("showMazeAll") : t("watchAdForReveal")
        }
      >
        {/* debugAll の状態に応じてアイコンを変更 */}
        <MaterialIcons
          name={debugAll ? "visibility-off" : "visibility"}
          size={24}
          color={UI.colors.icon}
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
