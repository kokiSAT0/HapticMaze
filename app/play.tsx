import { useEffect, useState, useRef } from "react";
import {
  Modal,
  StyleSheet,
  View,
  Pressable,
  Switch,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  useDerivedValue,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { DPad } from "@/components/DPad";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { PlainButton } from "@/components/PlainButton";
import { MiniMap } from "@/src/components/MiniMap";
import type { MazeData as MazeView, Dir } from "@/src/types/maze";
import { useGame } from "@/src/game/useGame";
import {
  applyBumpFeedback,
  applyDistanceFeedback,
  nextPosition,
} from "@/src/game/utils";

// LinearGradient を Reanimated 用にラップ
// Web 環境では setAttribute エラーを避けるためアニメーション無し
const AnimatedLG =
  Platform.OS === "web"
    ? LinearGradient
    : Animated.createAnimatedComponent(LinearGradient);

export default function PlayScreen() {
  const router = useRouter();
  // SafeArea 用の余白情報を取得
  const insets = useSafeAreaInsets();
  // 画面サイズを取得。useWindowDimensions は画面回転にも追従する
  const { height, width } = useWindowDimensions();
  const { state, move, maze, nextStage, resetRun } = useGame();
  // 全体のステージ数。迷路サイズ×迷路サイズで計算する
  // size は迷路の一辺のマス数なので、面積がステージ総数になる
  const totalStages = maze.size * maze.size;
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [stageClear, setStageClear] = useState(false);
  const [gameClear, setGameClear] = useState(false);
  // メニュー表示フラグ。true のときサブメニューを表示
  const [showMenu, setShowMenu] = useState(false);
  // 全てを可視化するかのフラグ。デフォルトはオフ
  const [debugAll, setDebugAll] = useState(false);
  // 枠線の色を状態として管理
  const [borderColor, setBorderColor] = useState("transparent");
  const borderW = useSharedValue(0);
  // ゴール到達時に画面左右から中央まで埋まるよう
  // 枠線の最大太さを画面幅の半分に設定する
  const maxBorder = width / 2;
  // 連打を防ぐための入力ロック
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // applyDistanceFeedback で使う setInterval の ID を保持
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 枠の太さを共通化するため縦横で別々の AnimatedStyle を用意
  const vertStyle = useAnimatedStyle(() => ({ height: borderW.value }));
  const horizStyle = useAnimatedStyle(() => ({ width: borderW.value }));
  // グラデーションの色配列。中心に近いほど透明にする
  // LinearGradient が期待する型に合わせるためタプルにする
  // 枠線のグラデーション。最初の 20% を完全な色にしてから透明へと変化させる
  const gradColors: [string, string, string] = [
    borderColor,
    borderColor,
    "transparent",
  ];

  // 枠線の太さに応じて完全な色の領域を広げる
  // borderW.value は SharedValue でアニメーション中も値が変わる
  const gradStops = useDerivedValue<[number, number, number]>(() => {
    const ratio = Math.min(borderW.value / maxBorder, 1);
    // 初期 0.2 から ratio に応じて最大 0.7 まで拡大
    const loc = 0.2 + ratio * 0.5;
    return [0, loc, 1];
  });
  // AnimatedLinearGradient へ渡すプロパティ。Web では locations のみ固定
  const gradProps = useAnimatedProps(() => ({ locations: gradStops.value }));
  const gradLocs = Platform.OS === "web" ? [0, 0.2, 1] : undefined;

  useEffect(() => {
    // 次ステージで迷路が変わるか判定
    // ステージ番号が迷路サイズの倍数なら新しいマップを読み込む
    const willChangeMap = state.stage % maze.size === 0;
    if (state.pos.x === maze.goal[0] && state.pos.y === maze.goal[1]) {
      // ゴール到達。最終ステージかどうかで分岐
      setStageClear(true);
      setGameOver(false);
      setGameClear(state.finalStage);
      setShowResult(true);
      // 次ステージが同じマップなら全体表示しない
      setDebugAll(willChangeMap);
    } else if (state.caught) {
      // 敵に捕まったときは常に全てを可視化
      setGameOver(true);
      setStageClear(false);
      setShowResult(true);
      setDebugAll(true);
    }
  }, [
    state.pos,
    state.caught,
    maze.goal,
    state.finalStage,
    state.stage,
    maze.size,
  ]);

  const handleOk = () => {
    // 結果モーダルを閉じるのみ
    setShowResult(false);
    setGameOver(false);
    setDebugAll(false);
    setStageClear(false);
    setGameClear(false);
    if (gameOver) {
      // ゲームオーバー時は1ステージ目から再開
      resetRun();
    } else if (gameClear) {
      // 全ステージクリア
      resetRun();
      router.replace("/");
    } else if (stageClear) {
      // 通常クリアで次のステージへ
      nextStage();
    }
  };

  // Reset Maze 選択時に呼ばれる
  const handleReset = () => {
    setShowMenu(false);
    setGameOver(false);
    setStageClear(false);
    setGameClear(false);
    resetRun();
  };

  // Exit to Title 選択時に呼ばれる
  const handleExit = () => {
    setShowMenu(false);
    setGameOver(false);
    setStageClear(false);
    setGameClear(false);
    resetRun();
    router.replace("/");
  };

  // コンポーネント破棄時にタイマーを解除
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // DPad からの入力を処理する関数
  const handleMove = (dir: Dir) => {
    if (locked) return; // ロック中は無視
    // ここでロックを開始
    setLocked(true);
    // 移動後の座標を計算しておく
    const next = nextPosition(state.pos, dir);

    // 前回の setInterval が残っていれば停止
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // move の戻り値が false のときは壁に衝突
    let wait: number;
    if (!move(dir)) {
      wait = applyBumpFeedback(borderW, setBorderColor);
      // 衝突表示が終わったら色を戻す
      setTimeout(() => setBorderColor("transparent"), wait);
    } else {
      // 盤面サイズから求めた最大マンハッタン距離 (例: 10×10 なら 18)
      const maxDist = (maze.size - 1) * 2;
      const { wait: w, id } = applyDistanceFeedback(
        next,
        { x: maze.goal[0], y: maze.goal[1] },
        { maxDist }
      );
      wait = w;
      intervalRef.current = id;
    }

    // フィードバック終了から 10ms 後にロック解除
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setLocked(false), wait + 10);
  };

  const dpadTop = height * (2 / 3);
  // ミニマップを画面上1/3の位置から少し上へずらす
  // 今回は40pxだけ上に移動させる
  const mapTop = height / 3 - 40;
  // リザルト表示位置。ミニマップより少し下へ配置する
  const resultTop = mapTop + 260;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
      {/* サブメニュー本体 */}
      <Modal transparent visible={showMenu} animationType="fade">
        {/* 画面全体を押すと閉じるオーバーレイ */}
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setShowMenu(false)}
        >
          <View style={[styles.menuContent, { top: insets.top + 40 }]}>
            <PlainButton
              title="Reset Maze"
              onPress={handleReset}
              accessibilityLabel="迷路を最初から"
            />
            <PlainButton
              title="Exit to Title"
              onPress={handleExit}
              accessibilityLabel="タイトルへ戻る"
            />
            {/* デバッグ用スイッチ */}
            <View style={styles.switchRow}>
              <ThemedText>全てを可視化</ThemedText>
              <Switch
                value={debugAll}
                onValueChange={setDebugAll}
                accessibilityLabel="迷路を全て表示"
              />
            </View>
          </View>
        </Pressable>
      </Modal>
      <Modal transparent visible={showResult} animationType="fade">
        <View style={styles.modalWrapper}>
          <ThemedView style={[styles.modalContent, { marginTop: resultTop }]}>
            <ThemedText type="title">
              {gameClear
                ? "ゲームクリア"
                : gameOver
                ? "ゲームオーバー"
                : "ゴール！"}
            </ThemedText>
            <ThemedText>Steps: {state.steps}</ThemedText>
            <ThemedText>Bumps: {state.bumps}</ThemedText>
            {/* 現在クリアしたステージ数と総ステージ数を表示 */}
            {/* totalStages は maze.size × maze.size で計算した結果 */}
            <ThemedText>
              Stage: {state.stage}/{totalStages}
            </ThemedText>
            <PlainButton
              title="OK"
              onPress={handleOk}
              accessibilityLabel="タイトルへ戻る"
            />
          </ThemedView>
        </View>
      </Modal>
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
  menuOverlay: { flex: 1 },
  menuContent: {
    position: "absolute",
    top: 40,
    right: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalWrapper: {
    flex: 1,
    // リザルトを上寄せにするため中央揃えを解除
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    gap: 10,
    width: 250,
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
