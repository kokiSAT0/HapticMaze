import { Button, StyleSheet, View } from 'react-native';

export type DPadDirection = 'up' | 'down' | 'left' | 'right';

export function DPad({ onPress }: { onPress: (dir: DPadDirection) => void }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Button title="▲" onPress={() => onPress('up')} accessibilityLabel="上へ移動" />
      </View>
      <View style={styles.row}>
        <Button title="◀" onPress={() => onPress('left')} accessibilityLabel="左へ移動" />
        <Button title="▼" onPress={() => onPress('down')} accessibilityLabel="下へ移動" />
        <Button title="▶" onPress={() => onPress('right')} accessibilityLabel="右へ移動" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
});
