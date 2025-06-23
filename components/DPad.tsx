import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Dir } from '@/src/types/maze';

/**
 * DPad コンポーネント
 * 方向入力を受け取り、useGame の move 関数へ渡す役割を持ちます。
 * Dir 型は 'Up' | 'Down' | 'Left' | 'Right' の四種類を表します。
 */
export function DPad({
  onPress,
  disabled = false, // true のときタップを受け付けない
}: {
  onPress: (dir: Dir) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.container}>
      {/* 一段目: 上ボタンを中央に配置 */}
      <View style={styles.row}>
        <View style={styles.spacer} />
        <Pressable
          disabled={disabled}
          onPress={() => onPress('Up')}
          style={styles.btn}
          accessibilityLabel="上へ移動"
        >
          {/* \u25B2: 三角形の記号を表示 */}
          <Text style={styles.txt}>▲</Text>
        </Pressable>
        <View style={styles.spacer} />
      </View>
      {/* 二段目: 左右ボタン */}
      <View style={styles.row}>
        <Pressable
          disabled={disabled}
          onPress={() => onPress('Left')}
          style={styles.btn}
          accessibilityLabel="左へ移動"
        >
          <Text style={styles.txt}>◀</Text>
        </Pressable>
        <View style={styles.spacer} />
        <Pressable
          disabled={disabled}
          onPress={() => onPress('Right')}
          style={styles.btn}
          accessibilityLabel="右へ移動"
        >
          <Text style={styles.txt}>▶</Text>
        </Pressable>
      </View>
      {/* 三段目: 下ボタンを中央に配置 */}
      <View style={styles.row}>
        <View style={styles.spacer} />
        <Pressable
          disabled={disabled}
          onPress={() => onPress('Down')}
          style={styles.btn}
          accessibilityLabel="下へ移動"
        >
          <Text style={styles.txt}>▼</Text>
        </Pressable>
        <View style={styles.spacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  // ボタンを十字の形に配置するための空白
  spacer: {
    width: 40,
  },
  // 押下範囲のスタイル。幅・高さを 48 にして指が届きやすくする
  btn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ボタン内の文字色を白に設定
  txt: {
    color: 'white',
    fontSize: 24,
  },
});
