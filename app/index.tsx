import { Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TitleScreen() {
  const router = useRouter();
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
      {/* ボタンの色も白に合わせる。onPress でゲーム画面へ遷移 */}
      <Button
        title="スタート"
        onPress={() => router.replace('/play')}
        accessibilityLabel="ゲームスタート"
        color="#fff"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
});
