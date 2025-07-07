import { View, Pressable, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { DPad } from "@/components/DPad";
import { MiniMap } from "@/src/components/MiniMap";
import type { MazeData as MazeView } from "@/src/types/maze";
import { useLocale } from "@/src/locale/LocaleContext";
import { usePlayLogic } from "@/src/hooks/usePlayLogic";
import { ResultModal } from "@/components/ResultModal";
import { StageBanner } from "@/components/StageBanner";
import { EdgeOverlay } from "@/components/EdgeOverlay";
import { playStyles } from "@/src/styles/playStyles";
import { UI } from "@/constants/ui";

export default function PlayScreen() {
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
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
    borderColor,
    borderW,
    maxBorder,
    locked,
    okLocked,
    okLabel,
    showBanner,
    bannerStage,
    handleBannerFinish,
    handleMove,
    handleOk,
    handleRespawn,
    handleExit,
  } = usePlayLogic();

  const dpadTop = height * (2 / 3);
  // ミニマップは ResultModal と重ならないよう少し上に配置する
  // mapTop は画面高さの 1/3 から 80px 引いた位置
  const mapTop = height / 3 - 80;
  // ResultModal はミニマップ下端より 10px 下に表示する
  // MiniMap のサイズは 300px のため、mapTop + 310 が位置となる
  const resultTop = mapTop + 310;
  // リセットボタンの色。使用回数に応じて白から黒へ変化させる
  const gray = Math.round((state.respawnStock / 3) * 255);
  const resetColor = `rgb(${gray},${gray},${gray})`;

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
        onPress={() => setDebugAll(!debugAll)}
        accessibilityLabel={t("showMazeAll")}
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
          // ミニマップを300pxで表示する
          size={300}
        />
      </View>
      <View style={[playStyles.dpadWrapper, { top: dpadTop }]}>
        <DPad onPress={handleMove} disabled={locked} />
      </View>
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
      <StageBanner
        visible={showBanner}
        stage={bannerStage}
        onFinish={handleBannerFinish}
      />
    </View>
  );
}
