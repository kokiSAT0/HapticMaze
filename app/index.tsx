import { Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/src/game/useGame';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TitleScreen() {
  const router = useRouter();
  // GameProvider から新しい迷路を読み込む関数を取得
  const { newGame } = useGame();
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
      {/* 迷路サイズ別のスタートボタン */}
      <Button
        title="5×5"
        onPress={() => {
          // 5×5 迷路を読み込んでからプレイ画面へ遷移
          newGame(5);
          router.replace('/play');
        }}
        accessibilityLabel="5マス迷路を開始"
        color="#fff"
      />
      <Button
        title="10×10"
        onPress={() => {
          // 10×10 迷路を読み込んでからプレイ画面へ遷移
          newGame(10);
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
