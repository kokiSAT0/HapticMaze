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
  const [sense, setSense] = React.useState('1');
  const [random, setRandom] = React.useState('0');
  const [slow, setSlow] = React.useState('0');
  const [sight, setSight] = React.useState('0');
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
        <ThemedText lightColor="#fff" darkColor="#fff">等速・感知</ThemedText>
        <TextInput
          style={styles.input}
          value={sense}
          onChangeText={setSense}
          keyboardType="number-pad"
          accessibilityLabel="等速・感知の数"
        />
      </View>
      <View style={styles.row}>
        <ThemedText lightColor="#fff" darkColor="#fff">等速・ランダム</ThemedText>
        <TextInput
          style={styles.input}
          value={random}
          onChangeText={setRandom}
          keyboardType="number-pad"
          accessibilityLabel="等速・ランダムの数"
        />
      </View>
      <View style={styles.row}>
        <ThemedText lightColor="#fff" darkColor="#fff">鈍足・視認</ThemedText>
        <TextInput
          style={styles.input}
          value={slow}
          onChangeText={setSlow}
          keyboardType="number-pad"
          accessibilityLabel="鈍足・視認の数"
        />
      </View>
      <View style={styles.row}>
        <ThemedText lightColor="#fff" darkColor="#fff">等速・視認</ThemedText>
        <TextInput
          style={styles.input}
          value={sight}
          onChangeText={setSight}
          keyboardType="number-pad"
          accessibilityLabel="等速・視認の数"
        />
      </View>
      {/* 迷路サイズ別のスタートボタン */}
      <Button
        title="5×5"
        onPress={() => {
          // 5×5 迷路を読み込んでからプレイ画面へ遷移
          newGame(5, {
            sense: parseInt(sense) || 0,
            random: parseInt(random) || 0,
            slow: parseInt(slow) || 0,
            sight: parseInt(sight) || 0,
            fast: 0,
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
            sense: parseInt(sense) || 0,
            random: parseInt(random) || 0,
            slow: parseInt(slow) || 0,
            sight: parseInt(sight) || 0,
            fast: 0,
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
