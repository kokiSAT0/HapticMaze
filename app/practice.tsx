import React from 'react';
import { StyleSheet } from 'react-native';
import { PlainButton } from '@/components/PlainButton';
import { useRouter } from 'expo-router';
import { useGame } from '@/src/game/useGame';
import { useLocale } from '@/src/locale/LocaleContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { EnemyCounter } from '@/components/EnemyCounter';
import { UI } from '@/constants/ui';

export default function PracticeScreen() {
  const router = useRouter();
  const { newGame } = useGame();
  const { t } = useLocale();
  // 各敵タイプの数を状態として管理
  const [random, setRandom] = React.useState(0);
  const [slow, setSlow] = React.useState(0);
  const [sight, setSight] = React.useState(0);
  // 敵の軌跡を残す長さ。デフォルトは通常プレイと同じ4
  const [pathLen, setPathLen] = React.useState(4);
  // プレイヤー軌跡の長さ。無限大を表すため Infinity を使用
  const [playerLen, setPlayerLen] = React.useState<number>(Infinity);
  // 壁表示ターン数。無限大なら永続表示
  const [wallLife, setWallLife] = React.useState<number>(Infinity);

  const start = (size: number) => {
    newGame(
      size,
      { random, slow, sight, fast: 0 },
      pathLen,
      playerLen,
      wallLife,
      undefined,
      undefined,
      true,
      true,
      'practice',
      3,
      3,
    );
    router.replace('/play');
  };

  return (
    <ThemedView lightColor="#000" darkColor="#000" style={styles.container}>
      <ThemedText type="title" lightColor="#fff" darkColor="#fff">
        {t('practiceMode')}
      </ThemedText>
      <EnemyCounter label={t('enemyRandom')} value={random} setValue={setRandom} />
      <EnemyCounter label={t('enemySlow')} value={slow} setValue={setSlow} />
      <EnemyCounter label={t('enemySight')} value={sight} setValue={setSight} />
      {/* 敵の軌跡長 */}
      <EnemyCounter label={t('enemyPathLen')} value={pathLen} setValue={setPathLen} />
      {/* プレイヤーの軌跡長。無限大選択を許可 */}
      <EnemyCounter
        label={t('playerPathLen')}
        value={playerLen}
        setValue={setPlayerLen}
        allowInfinity
      />
      {/* 壁表示ターン数 */}
      <EnemyCounter
        label={t('wallDuration')}
        value={wallLife}
        setValue={setWallLife}
        allowInfinity
      />
      <PlainButton
        title="5×5"
        onPress={() => start(5)}
        accessibilityLabel={t('startMazeSize', { size: 5 })}
      />
      <PlainButton
        title="10×10"
        onPress={() => start(10)}
        accessibilityLabel={t('startMazeSize', { size: 10 })}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: UI.screenGap },
});
