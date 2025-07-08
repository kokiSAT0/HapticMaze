import React from 'react';
import { StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { PlainButton } from '@/components/PlainButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LEVELS } from '@/constants/levels';
import { clearGame } from '@/src/game/saveGame';
import { useSnackbar } from '@/src/hooks/useSnackbar';
import { useGame } from '@/src/game/useGame';
import { useLocale } from '@/src/locale/LocaleContext';
import { useBgm } from '@/src/hooks/useBgm';

export default function ResetConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const levelId = typeof params.level === 'string' ? params.level : undefined;
  const { newGame } = useGame();
  const { t } = useLocale();
  const { change } = useBgm();
  const { show: showSnackbar } = useSnackbar();

  const start = async () => {
    if (!levelId) {
      router.replace('/');
      return;
    }
    const level = LEVELS.find((lv) => lv.id === levelId);
    if (!level) {
      router.replace('/');
      return;
    }
    await clearGame({ showError: showSnackbar });
    if (levelId === 'level2') {
      change(require('../assets/sounds/日没廃校_調整.mp3'));
    } else {
      change(require('../assets/sounds/降りしきる、白_調整.mp3'));
    }
    newGame(
      level.size,
      level.enemies,
      level.enemyPathLength,
      level.playerPathLength,
      level.wallLifetime,
      level.enemyCountsFn,
      level.wallLifetimeFn,
      level.biasedSpawn,
      level.id,
    );
    router.replace('/play');
  };

  return (
    <ThemedView lightColor="#000" darkColor="#000" style={styles.container}>
      <ThemedText type="title" lightColor="#fff" darkColor="#fff">
        {t('confirmReset')}
      </ThemedText>
      <PlainButton title={t('yes')} onPress={start} accessibilityLabel={t('yes')} />
      <PlainButton
        title={t('backToTitle')}
        onPress={() => router.replace('/')}
        accessibilityLabel={t('backToTitle')}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
});
