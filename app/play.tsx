import { StyleSheet, View } from 'react-native';
import { GameProvider, useGame } from '@/src/game/useGame';
import { DPad } from '@/src/components/DPad';
import { ThemedText } from '@/components/ThemedText';

function PlayInner() {
  const { state, move } = useGame();
  return (
    <View style={styles.container}>
      <ThemedText>pos: {state.pos.x}, {state.pos.y}</ThemedText>
      <ThemedText>steps: {state.steps}</ThemedText>
      <ThemedText>bumps: {state.bumps}</ThemedText>
      <DPad onMove={move} />
    </View>
  );
}

export default function PlayScreen() {
  return (
    <GameProvider>
      <PlayInner />
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
