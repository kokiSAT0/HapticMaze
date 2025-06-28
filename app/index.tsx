import React from 'react';
import { StyleSheet } from 'react-native';
import { PlainButton } from '@/components/PlainButton';
import { useRouter } from 'expo-router';
import { useGame } from '@/src/game/useGame';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LEVELS } from '@/constants/levels';

export default function TitleScreen() {
  const router = useRouter();
  // GameProvider から新しい迷路を読み込む関数を取得
  const { newGame } = useGame();

  // 定義済みレベルの設定を使ってゲームを開始する
  const startLevel = (id: string) => {
    const level = LEVELS.find((l) => l.id === id);
    if (!level) return;
    newGame(
      level.size,
      level.enemies,
      level.enemyPathLength,
      level.playerPathLength,
      level.wallLifetime,
    );
    router.replace('/play');
  };
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
      {/* 練習モードへの遷移 */}
      <PlainButton
        title="練習モード"
        onPress={() => router.push('/practice')}
        accessibilityLabel="練習モードを開く"
      />
      {/* プリセットレベルの開始ボタン */}
      {LEVELS.map((lv) => (
        <PlainButton
          key={lv.id}
          title={lv.name}
          onPress={() => startLevel(lv.id)}
          accessibilityLabel={`${lv.name}を開始`}
        />
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
});
