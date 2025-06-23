import { useEffect, useState } from 'react';
import { Button, Modal, StyleSheet, View, Pressable, Switch, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { DPad } from '@/components/DPad';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MiniMap } from '@/src/components/MiniMap';
import type { MazeData as MazeView, Dir } from '@/src/types/maze';
import { useGame } from '@/src/game/useGame';
import { applyBumpFeedback } from '@/src/game/utils';
import { useDistanceFeedback } from '@/hooks/useDistanceFeedback';

// LinearGradient を Reanimated 用にラップ
const AnimatedLG = Animated.createAnimatedComponent(LinearGradient);

export default function PlayScreen() {
  const router = useRouter();
  // SafeArea 用の余白情報を取得
  const insets = useSafeAreaInsets();
  // 画面サイズを取得。useWindowDimensions は画面回転にも追従する
  const { height } = useWindowDimensions();
  const { state, move, reset, maze } = useGame();
  const [showResult, setShowResult] = useState(false);
  // メニュー表示フラグ。true のときサブメニューを表示
  const [showMenu, setShowMenu] = useState(false);
  // 全てを可視化するかのフラグ。デフォルトはオフ
  const [debugAll, setDebugAll] = useState(false);
  // 枠線の色を状態として管理
  const [borderColor, setBorderColor] = useState('white');
  const borderW = useSharedValue(0);
  // 枠の太さを共通化するため縦横で別々の AnimatedStyle を用意
  const vertStyle = useAnimatedStyle(() => ({ height: borderW.value }));
  const horizStyle = useAnimatedStyle(() => ({ width: borderW.value }));
  // グラデーションの色配列。中心に近いほど透明にする
  // LinearGradient が期待する型に合わせるためタプルにする
  const gradColors: [string, string] = [borderColor, 'transparent'];

  useEffect(() => {
    if (state.pos.x === maze.goal[0] && state.pos.y === maze.goal[1]) {
      setShowResult(true);
    }
  }, [state.pos, maze.goal]);
  // ゴール距離に応じた周期でフィードバックを発火
  useDistanceFeedback(state.pos, { x: maze.goal[0], y: maze.goal[1] }, borderW);

  const handleOk = () => {
    setShowResult(false);
    reset();
    router.replace('/');
  };

  // Reset Maze 選択時に呼ばれる
  const handleReset = () => {
    setShowMenu(false);
    reset();
  };

  // Exit to Title 選択時に呼ばれる
  const handleExit = () => {
    setShowMenu(false);
    reset();
    router.replace('/');
  };

  // DPad からの入力を処理する関数
  const handleMove = (dir: Dir) => {
    // move の戻り値が false のときは壁にぶつかったということ
    const ok = move(dir);
    if (!ok) {
      applyBumpFeedback(
        state.pos,
        { x: maze.goal[0], y: maze.goal[1] },
        borderW,
        setBorderColor
      );
    }
  };

  const dpadTop = height * (2 / 3);
  const mapTop = height / 3;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      {/* 枠線用のオーバーレイ。グラデーションで中央へ行くほど色が薄くなる */}
      <AnimatedLG
        pointerEvents="none"
        colors={gradColors}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.edge, styles.topEdge, vertStyle]}
      />
      <AnimatedLG
        pointerEvents="none"
        colors={gradColors}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={[styles.edge, styles.bottomEdge, vertStyle]}
      />
      <AnimatedLG
        pointerEvents="none"
        colors={gradColors}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.edge, styles.leftEdge, horizStyle]}
      />
      <AnimatedLG
        pointerEvents="none"
        colors={gradColors}
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
        <MaterialIcons name="more-vert" size={24} color="black" />
      </Pressable>
      <View style={[styles.miniMapWrapper, { top: mapTop }]}
      >
        <MiniMap
          maze={maze as MazeView}
          path={state.path}
          pos={state.pos}
          showAll={debugAll}
          hitV={state.hitV}
          hitH={state.hitH}
          // ミニマップを1.5倍のサイズ（240px）で表示する
          size={240}
        />
      </View>
      <View style={[styles.dpadWrapper, { top: dpadTop }]}
      >
        <DPad onPress={handleMove} />
      </View>
      {/* サブメニュー本体 */}
      <Modal transparent visible={showMenu} animationType="fade">
        {/* 画面全体を押すと閉じるオーバーレイ */}
        <Pressable style={styles.menuOverlay} onPress={() => setShowMenu(false)}>
          <View style={[styles.menuContent, { top: insets.top + 40 }]}
          >
            <Button
              title="Reset Maze"
              onPress={handleReset}
              accessibilityLabel="迷路を最初から"
            />
            <Button
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
          <ThemedView style={styles.modalContent}>
            <ThemedText type="title">ゴール！</ThemedText>
            <ThemedText>Steps: {state.steps}</ThemedText>
            <ThemedText>Bumps: {state.bumps}</ThemedText>
            <Button title="OK" onPress={handleOk} accessibilityLabel="タイトルへ戻る" />
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  menuBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4,
  },
  menuOverlay: { flex: 1 },
  menuContent: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    gap: 10,
    width: 250,
  },
  // ミニマップを画面上 1/3 の位置に中央揃えで配置
  miniMapWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  // DPad を画面下 1/3 の位置に中央揃えで配置
  dpadWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  // 枠線 (グラデーション) の各辺共通スタイル
  edge: {
    position: 'absolute',
  },
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bottomEdge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  leftEdge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  rightEdge: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
  },
});
