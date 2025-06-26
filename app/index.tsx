import React from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/src/game/useGame';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TitleScreen() {
  const router = useRouter();
  // GameProvider から新しい迷路を読み込む関数を取得
  const { newGame } = useGame();
  // 敵の数は数値として扱う。初期値はすべて0
  const [sense, setSense] = React.useState(0);
  const [random, setRandom] = React.useState(0);
  const [slow, setSlow] = React.useState(0);
  const [sight, setSight] = React.useState(0);
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
        {/* マイナスボタンで1減らす。最小は0 */}
        <Button
          title="-"
          onPress={() => setSense(Math.max(0, sense - 1))}
          accessibilityLabel="等速・感知を減らす"
        />
        {/* 現在値を表示 */}
        <ThemedText lightColor="#fff" darkColor="#fff" style={styles.count}>
          {sense}
        </ThemedText>
        {/* プラスボタンで1増やす */}
        <Button
          title="+"
          onPress={() => setSense(sense + 1)}
          accessibilityLabel="等速・感知を増やす"
        />
      </View>
      <View style={styles.row}>
        <ThemedText lightColor="#fff" darkColor="#fff">等速・ランダム</ThemedText>
        <Button
          title="-"
          onPress={() => setRandom(Math.max(0, random - 1))}
          accessibilityLabel="等速・ランダムを減らす"
        />
        <ThemedText lightColor="#fff" darkColor="#fff" style={styles.count}>
          {random}
        </ThemedText>
        <Button
          title="+"
          onPress={() => setRandom(random + 1)}
          accessibilityLabel="等速・ランダムを増やす"
        />
      </View>
      <View style={styles.row}>
        <ThemedText lightColor="#fff" darkColor="#fff">鈍足・視認</ThemedText>
        <Button
          title="-"
          onPress={() => setSlow(Math.max(0, slow - 1))}
          accessibilityLabel="鈍足・視認を減らす"
        />
        <ThemedText lightColor="#fff" darkColor="#fff" style={styles.count}>
          {slow}
        </ThemedText>
        <Button
          title="+"
          onPress={() => setSlow(slow + 1)}
          accessibilityLabel="鈍足・視認を増やす"
        />
      </View>
      <View style={styles.row}>
        <ThemedText lightColor="#fff" darkColor="#fff">等速・視認</ThemedText>
        <Button
          title="-"
          onPress={() => setSight(Math.max(0, sight - 1))}
          accessibilityLabel="等速・視認を減らす"
        />
        <ThemedText lightColor="#fff" darkColor="#fff" style={styles.count}>
          {sight}
        </ThemedText>
        <Button
          title="+"
          onPress={() => setSight(sight + 1)}
          accessibilityLabel="等速・視認を増やす"
        />
      </View>
      {/* 迷路サイズ別のスタートボタン */}
      <Button
        title="5×5"
        onPress={() => {
          // 5×5 迷路を読み込んでからプレイ画面へ遷移
          newGame(5, {
            sense,
            random,
            slow,
            sight,
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
            sense,
            random,
            slow,
            sight,
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
  // 現在の数値表示用スタイル
  count: {
    borderWidth: 1,
    borderColor: '#888',
    color: '#fff',
    paddingHorizontal: 8,
    minWidth: 32,
    textAlign: 'center',
  },
});
