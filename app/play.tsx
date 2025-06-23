import { useEffect, useState } from 'react';
import { Button, Modal, StyleSheet, View, Pressable, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSharedValue } from 'react-native-reanimated';

import { DPad } from '@/components/DPad';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MiniMap } from '@/src/components/MiniMap';
import type { MazeData as MazeView } from '@/src/types/maze';
import { useGame } from '@/src/game/useGame';
import { applyDistanceFeedback } from '@/src/game/utils';

export default function PlayScreen() {
  const router = useRouter();
  // SafeArea 用の余白情報を取得
  const insets = useSafeAreaInsets();
  const { state, move, reset, maze } = useGame();
  const [showResult, setShowResult] = useState(false);
  // メニュー表示フラグ。true のときサブメニューを表示
  const [showMenu, setShowMenu] = useState(false);
  // 全てを可視化するかのフラグ。デフォルトはオフ
  const [debugAll, setDebugAll] = useState(false);
  const borderW = useSharedValue(2);

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

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* 右上のメニューアイコン */}
      <Pressable
        style={[styles.menuBtn, { top: insets.top + 10 }]}
        onPress={() => setShowMenu(true)}
        accessibilityLabel="メニューを開く"
      >
        <MaterialIcons name="more-vert" size={24} color="black" />
      </Pressable>
      <ThemedText>位置: {state.pos.x}, {state.pos.y}</ThemedText>
      <DPad onPress={move} />
      <MiniMap
        maze={maze as MazeView}
        path={state.path}
        pos={state.pos}
        flash={borderW}
        showAll={debugAll}
      />
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
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
});
