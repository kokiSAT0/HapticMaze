import { View, Pressable, StyleSheet, useWindowDimensions, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated, { useAnimatedStyle, useAnimatedProps, useDerivedValue } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { DPad } from "@/components/DPad";
import { MiniMap } from "@/src/components/MiniMap";
import type { MazeData as MazeView } from "@/src/types/maze";
import { useLocale } from "@/src/locale/LocaleContext";
import { usePlayLogic } from "@/src/hooks/usePlayLogic";
import { PlayMenu } from "@/components/PlayMenu";
import { ResultModal } from "@/components/ResultModal";

// LinearGradient を Reanimated 用にラップ
// Web 環境では setAttribute エラーを避けるためアニメーション無し
const AnimatedLG =
  Platform.OS === "web"
    ? LinearGradient
    : Animated.createAnimatedComponent(LinearGradient);

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
    borderColor,
    borderW,
    maxBorder,
    locked,
    handleMove,
    handleOk,
    handleReset,
    handleExit,
  } = usePlayLogic();

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

  const dpadTop = height * (2 / 3);
  // ミニマップは ResultModal と重ならないよう少し上に配置する
  // mapTop は画面高さの 1/3 から 80px 引いた位置
  const mapTop = height / 3 - 80;
  // ResultModal はミニマップ下端より 10px 下に表示する
  // MiniMap のサイズは 300px のため、mapTop + 310 が位置となる
  const resultTop = mapTop + 310;

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
        top={insets.top + 40}
        onClose={() => setShowMenu(false)}
        onReset={handleReset}
        debugAll={debugAll}
        setDebugAll={setDebugAll}
        bgmVolume={bgmVolume}
        seVolume={seVolume}
        incBgm={incBgm}
        decBgm={decBgm}
        incSe={incSe}
        decSe={decSe}
        labelReset={t('resetMaze')}
        labelResetAcc={t('resetMazeLabel')}
        labelShowAll={t('showAll')}
        labelShowMaze={t('showMazeAll')}
        labelBgm={t('bgmVolume')}
        labelSe={t('seVolume')}
        accIncBgm={t('increase', { label: t('bgmVolume') })}
        accDecBgm={t('decrease', { label: t('bgmVolume') })}
        accIncSe={t('increase', { label: t('seVolume') })}
        accDecSe={t('decrease', { label: t('seVolume') })}
      />
      <ResultModal
        visible={showResult}
        top={resultTop}
        title={gameClear ? t('gameClear') : gameOver ? t('gameOver') : t('goal')}
        steps={t('steps', { count: state.steps })}
        bumps={t('bumps', { count: state.bumps })}
        stageText={t('stage', { current: state.stage, total: totalStages })}
        highScore={highScore && (gameClear || gameOver) ? highScore : null}
        newRecord={newRecord && (gameClear || gameOver)}
        onOk={handleOk}
        okLabel={t('ok')}
        accLabel={t('backToTitle')}
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
