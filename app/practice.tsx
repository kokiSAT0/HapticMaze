import React from 'react';
import { Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/src/game/useGame';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { EnemyCounter } from '@/components/EnemyCounter';

export default function PracticeScreen() {
  const router = useRouter();
  const { newGame } = useGame();
  // 各敵タイプの数を状態として管理
  const [sense, setSense] = React.useState(0);
  const [random, setRandom] = React.useState(0);
  const [slow, setSlow] = React.useState(0);
  const [sight, setSight] = React.useState(0);
  // 敵の軌跡を残す長さ。デフォルトは通常プレイと同じ4
  const [pathLen, setPathLen] = React.useState(4);

  const start = (size: number) => {
    newGame(size, { sense, random, slow, sight, fast: 0 }, pathLen);
    router.replace('/play');
  };

  return (
    <ThemedView lightColor="#000" darkColor="#000" style={styles.container}>
      <ThemedText type="title" lightColor="#fff" darkColor="#fff">
        練習モード
      </ThemedText>
      <EnemyCounter label="等速・感知" value={sense} setValue={setSense} />
      <EnemyCounter label="等速・ランダム" value={random} setValue={setRandom} />
      <EnemyCounter label="鈍足・視認" value={slow} setValue={setSlow} />
      <EnemyCounter label="等速・視認" value={sight} setValue={setSight} />
      {/* 軌跡の長さを変更するカウンター */}
      <EnemyCounter label="軌跡長" value={pathLen} setValue={setPathLen} />
      <Button
        title="5×5"
        onPress={() => start(5)}
        accessibilityLabel="5マス迷路を開始"
        color="#fff"
      />
      <Button
        title="10×10"
        onPress={() => start(10)}
        accessibilityLabel="10マス迷路を開始"
        color="#fff"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
});
