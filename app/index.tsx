import React from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/src/game/useGame';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TitleScreen() {
  const router = useRouter();
  // GameProvider から新しい迷路を読み込む関数を取得
  const { newGame } = useGame();
  const [visible, setVisible] = React.useState('1');
  const [invisible, setInvisible] = React.useState('0');
  const [slow, setSlow] = React.useState('0');
  return (
    <ThemedView
      /* 背景色を黒に固定。light/dark ともに同じ色を指定する */
      lightColor="#000"
      darkColor="#000"
      style={styles.container}
    >
      {/* アプリタイトル。文字色を白にして視認性を高める */}
      <ThemedText type="title" lightColor="#fff" darkColor="#fff">
        Haptic Maze
      </ThemedText>
      {/* 敵の数設定欄 */}
      <View style={styles.row}>
        <ThemedText lightColor="#fff" darkColor="#fff">等速・視認あり</ThemedText>
        <TextInput
          style={styles.input}
          value={visible}
          onChangeText={setVisible}
          keyboardType="number-pad"
          accessibilityLabel="等速・視認ありの数"
        />
      </View>
      <View style={styles.row}>
        <ThemedText lightColor="#fff" darkColor="#fff">等速・視認なし</ThemedText>
        <TextInput
          style={styles.input}
          value={invisible}
          onChangeText={setInvisible}
          keyboardType="number-pad"
          accessibilityLabel="等速・視認なしの数"
        />
      </View>
      <View style={styles.row}>
        <ThemedText lightColor="#fff" darkColor="#fff">鈍足・視認あり</ThemedText>
        <TextInput
          style={styles.input}
          value={slow}
          onChangeText={setSlow}
          keyboardType="number-pad"
          accessibilityLabel="鈍足・視認ありの数"
        />
      </View>
      {/* 迷路サイズ別のスタートボタン */}
      <Button
        title="5×5"
        onPress={() => {
          // 5×5 迷路を読み込んでからプレイ画面へ遷移
          newGame(5, {
            visible: parseInt(visible) || 0,
            invisible: parseInt(invisible) || 0,
            slow: parseInt(slow) || 0,
          });
          router.replace('/play');
        }}
        accessibilityLabel="5マス迷路を開始"
        color="#fff"
      />
      <Button
        title="10×10"
        onPress={() => {
          // 10×10 迷路を読み込んでからプレイ画面へ遷移
          newGame(10, {
            visible: parseInt(visible) || 0,
            invisible: parseInt(invisible) || 0,
            slow: parseInt(slow) || 0,
          });
          router.replace('/play');
        }}
        accessibilityLabel="10マス迷路を開始"
        color="#fff"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#888',
    color: '#fff',
    paddingHorizontal: 4,
    minWidth: 40,
    textAlign: 'center',
  },
});
