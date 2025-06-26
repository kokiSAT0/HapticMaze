import React from 'react';
import { Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/src/game/useGame';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { EnemyCounter } from '@/components/EnemyCounter';

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
      <EnemyCounter label="等速・感知" value={sense} setValue={setSense} />
      <EnemyCounter label="等速・ランダム" value={random} setValue={setRandom} />
      <EnemyCounter label="鈍足・視認" value={slow} setValue={setSlow} />
      <EnemyCounter label="等速・視認" value={sight} setValue={setSight} />
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
});
