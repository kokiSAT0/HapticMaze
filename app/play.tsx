import { useEffect, useState } from 'react';
import { Button, Modal, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { DPad } from '@/components/DPad';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useGame } from '@/game/useGame';

export default function PlayScreen() {
  const router = useRouter();
  const { state, move, reset } = useGame();
  const [showResult, setShowResult] = useState(false);

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

  return (
    <ThemedView style={styles.container}>
      <ThemedText>位置: {state.player[0]}, {state.player[1]}</ThemedText>
      <DPad onPress={move} />
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
