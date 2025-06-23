import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useGame } from '../src/game/useGame';
import { router } from 'expo-router';
import { IconSymbol } from './ui/IconSymbol';

export function HeaderMenu() {
  const { dispatch } = useGame();
  const [visible, setVisible] = useState(false);

  const close = () => setVisible(false);

  return (
    <>
      <Pressable onPress={() => setVisible(true)} accessibilityLabel="メニューを開く">
        <IconSymbol name="line.3.horizontal" size={24} color="black" />
      </Pressable>
      <Modal transparent visible={visible} animationType="fade" onRequestClose={close}>
        <Pressable style={styles.overlay} onPress={close}>
          <View style={styles.menu}>
            <Pressable
              onPress={() => {
                dispatch({ type: 'reset' });
                close();
              }}
              accessibilityLabel="迷路をリセット"
              style={styles.item}>
              <Text>Reset Maze</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                dispatch({ type: 'reset' });
                router.replace('/');
                close();
              }}
              accessibilityLabel="タイトルへ戻る"
              style={styles.item}>
              <Text>Exit to Title</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  menu: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 4,
    minWidth: 160,
    gap: 8,
  },
  item: {
    paddingVertical: 8,
  },
});
