import { useEffect, useState } from 'react';
import { Button, Modal, StyleSheet, View, Pressable, Switch, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { DPad } from '@/components/DPad';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MiniMap } from '@/src/components/MiniMap';
import type { MazeData as MazeView, Dir } from '@/src/types/maze';
import { useGame } from '@/src/game/useGame';
import { applyDistanceFeedback, applyBumpFeedback } from '@/src/game/utils';

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
  const flashStyle = useAnimatedStyle(() => ({ borderWidth: borderW.value }));
  const colorStyle = { borderColor };

  useEffect(() => {
    if (state.pos.x === maze.goal[0] && state.pos.y === maze.goal[1]) {
      setShowResult(true);
    }
    applyDistanceFeedback(state.pos, { x: maze.goal[0], y: maze.goal[1] }, borderW);
  }, [state.pos, maze.goal, borderW]);

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
      {/* 枠線用のオーバーレイ。pointerEvents を none にして操作に影響しない */}
      <Animated.View
        pointerEvents="none"
        style={[styles.borderOverlay, flashStyle, colorStyle]}
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
          size={160}
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
  // 枠線だけを表示するための絶対配置ビュー
  borderOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderColor: 'white',
  },
});
