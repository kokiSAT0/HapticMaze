import { Button, StyleSheet, View } from 'react-native';
import type { Dir } from '@/src/types/maze';

/**
 * DPad コンポーネント
 * 方向入力を受け取り、useGame の move 関数へ渡す役割を持ちます。
 * Dir 型は 'Up' | 'Down' | 'Left' | 'Right' の四種類を表します。
 */
export function DPad({ onPress }: { onPress: (dir: Dir) => void }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* onPress 時に大文字の方向文字列を渡す */}
        <Button title="▲" onPress={() => onPress('Up')} accessibilityLabel="上へ移動" />
      </View>
      <View style={styles.row}>
        <Button title="◀" onPress={() => onPress('Left')} accessibilityLabel="左へ移動" />
        <Button title="▼" onPress={() => onPress('Down')} accessibilityLabel="下へ移動" />
        <Button title="▶" onPress={() => onPress('Right')} accessibilityLabel="右へ移動" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
});
