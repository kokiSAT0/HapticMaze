import { useEffect, useState } from 'react';
import { Button, Modal, StyleSheet, View, Pressable, Switch, Text } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { DPad } from '@/components/DPad';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MiniMap } from '@/src/components/MiniMap';
import type { MazeData as MazeView } from '@/src/types/maze';
import { useGame } from '@/game/useGame';

export default function PlayScreen() {
  const router = useRouter();
  const { state, move, reset } = useGame();
  const [showResult, setShowResult] = useState(false);
  // メニュー表示フラグ。true のときサブメニューを表示
  const [showMenu, setShowMenu] = useState(false);
  // デバッグ用: ミニマップで迷路全体を表示するかどうか
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (state.player[0] === state.maze.goal[0] && state.player[1] === state.maze.goal[1]) {
      setShowResult(true);
    }
  }, [state.player, state.maze.goal]);

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
    <ThemedView style={styles.container}>
      {/* 右上のメニューアイコン */}
      <Pressable
        style={styles.menuBtn}
        onPress={() => setShowMenu(true)}
        accessibilityLabel="メニューを開く"
      >
        <MaterialIcons name="more-vert" size={24} color="black" />
      </Pressable>
      <ThemedText>位置: {state.player[0]}, {state.player[1]}</ThemedText>
      <DPad onPress={move} />
      {showAll && (
        <MiniMap
          maze={state.maze as MazeView}
          path={state.path.map(([x, y]) => ({ x, y }))}
          pos={{ x: state.player[0], y: state.player[1] }}
        />
      )}
      {/* サブメニュー本体 */}
      <Modal transparent visible={showMenu} animationType="fade">
        {/* 画面全体を押すと閉じるオーバーレイ */}
        <Pressable style={styles.menuOverlay} onPress={() => setShowMenu(false)}>
          <View style={styles.menuContent}>
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
            <View style={styles.toggleRow}>
              <Text>全てを可視化</Text>
              <Switch
                value={showAll}
                onValueChange={setShowAll}
                accessibilityLabel="ミニマップに迷路全体を表示する"
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
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
