import { StyleSheet, View, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { DPad } from "@/components/DPad";

import { MiniMap } from "@/src/components/MiniMap";
import type { MazeData as MazeView } from "@/src/types/maze";
import { PlayMenu } from "@/components/PlayMenu";
import { ResultModal } from "@/components/ResultModal";
import { usePlayLogic } from "@/src/hooks/usePlayLogic";

// LinearGradient を Reanimated 用にラップ
// Web 環境では setAttribute エラーを避けるためアニメーション無し
const AnimatedLG =
  Platform.OS === "web"
    ? LinearGradient
    : Animated.createAnimatedComponent(LinearGradient);

export default function PlayScreen() {
  // SafeArea 用の余白情報を取得
  const insets = useSafeAreaInsets();
  const {
    height,
    totalStages,
    state,
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
    vertStyle,
    horizStyle,
    gradColors,
    gradProps,
    gradLocs,
    handleMove,
    handleOk,
    handleReset,
    handleExit,
    locked,
    maze,
  } = usePlayLogic();

  const dpadTop = height * (2 / 3);
  // ミニマップを画面上1/3の位置から少し上へずらす
  // 今回は40pxだけ上に移動させる
  const mapTop = height / 3 - 40;
  // リザルト表示位置。ミニマップより少し下へ配置する
  const resultTop = mapTop + 260;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 左上のホームボタン。家アイコンを表示しタイトルへ戻る */}
      <Pressable
        style={[styles.homeBtn, { top: insets.top + 10 }]}
        onPress={handleExit}
        accessibilityLabel="ホーム画面へ戻る"
      >
        <MaterialIcons name="home" size={24} color="#555" />
      </Pressable>
      {/* 枠線用のオーバーレイ。グラデーションで中央へ行くほど色が薄くなる */}
      <AnimatedLG
        pointerEvents="none"
        colors={gradColors}
        {...(Platform.OS === "web"
          ? { locations: gradLocs }
          : { animatedProps: gradProps })}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.edge, styles.topEdge, vertStyle]}
      />
      <AnimatedLG
        pointerEvents="none"
        colors={gradColors}
        {...(Platform.OS === "web"
          ? { locations: gradLocs }
          : { animatedProps: gradProps })}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={[styles.edge, styles.bottomEdge, vertStyle]}
      />
      <AnimatedLG
        pointerEvents="none"
        colors={gradColors}
        {...(Platform.OS === "web"
          ? { locations: gradLocs }
          : { animatedProps: gradProps })}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.edge, styles.leftEdge, horizStyle]}
      />
      <AnimatedLG
        pointerEvents="none"
        colors={gradColors}
        {...(Platform.OS === "web"
          ? { locations: gradLocs }
          : { animatedProps: gradProps })}
        start={{ x: 1, y: 0.5 }}
        end={{ x: 0, y: 0.5 }}
        style={[styles.edge, styles.rightEdge, horizStyle]}
      />
      {/* 右上のリセットアイコン。迷路を初期状態に戻す */}
      <Pressable
        style={[styles.resetBtn, { top: insets.top + 10 }]}
        onPress={handleReset}
        accessibilityLabel="迷路をリセット"
      >
        <MaterialIcons name="refresh" size={24} color="#555" />
      </Pressable>
      {/* 右上のメニューアイコン */}
      <Pressable
        style={[styles.menuBtn, { top: insets.top + 10 }]}
        onPress={() => setShowMenu(true)}
        accessibilityLabel="メニューを開く"
      >
        {/* 背景が黒のためアイコンを濃いグレーにして視認性を確保 */}
        <MaterialIcons name="more-vert" size={24} color="#555" />
      </Pressable>
      <View style={[styles.miniMapWrapper, { top: mapTop }]}>
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
      <View style={[styles.dpadWrapper, { top: dpadTop }]}>
        <DPad onPress={handleMove} disabled={locked} />
      </View>
      <PlayMenu
        visible={showMenu}
        debugAll={debugAll}
        onChangeDebug={setDebugAll}
        onReset={handleReset}
        onClose={() => setShowMenu(false)}
        topOffset={insets.top + 40}
      />
      <ResultModal
        visible={showResult}
        gameOver={gameOver}
        stageClear={stageClear}
        gameClear={gameClear}
        steps={state.steps}
        bumps={state.bumps}
        stage={state.stage}
        totalStages={totalStages}
        highScore={highScore}
        newRecord={newRecord}
        onOk={handleOk}
        topOffset={resultTop}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  menuBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 4,
  },
  // ホームボタン用スタイル。左上に固定表示
  homeBtn: {
    position: "absolute",
    top: 10,
    left: 10,
    padding: 4,
  },
  // 迷路リセットボタン。メニューボタンの左隣に配置
  resetBtn: {
    position: "absolute",
    top: 10,
    right: 44,
    padding: 4,
  },
  // ミニマップを画面上 1/3 より40px上の位置に中央揃えで配置
  miniMapWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  // DPad を画面下 1/3 の位置に中央揃えで配置
  dpadWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  // 枠線 (グラデーション) の各辺共通スタイル
  edge: {
    position: "absolute",
  },
  topEdge: {
    top: 0,
    left: 0,
    right: 0,
  },
  bottomEdge: {
    bottom: 0,
    left: 0,
    right: 0,
  },
  leftEdge: {
    left: 0,
    top: 0,
    bottom: 0,
  },
  rightEdge: {
    right: 0,
    top: 0,
    bottom: 0,
  },
});
