import React from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PlainButton } from '@/components/PlainButton';
import { useRunRecords } from '@/src/hooks/useRunRecords';
import { useLocale } from '@/src/locale/LocaleContext';
import { UI } from '@/constants/ui';

export default function GameResultScreen() {
  const { records } = useRunRecords();
  const { t } = useLocale();
  const router = useRouter();

  const totals = records.reduce(
    (acc, r) => {
      acc.steps += r.steps;
      acc.bumps += r.bumps;
      acc.respawns += r.respawns;
      acc.reveals += r.reveals;
      return acc;
    },
    { steps: 0, bumps: 0, respawns: 0, reveals: 0 },
  );

  return (
    <ThemedView lightColor="#000" darkColor="#000" style={styles.container}>
      <ThemedText type="title" lightColor="#fff" darkColor="#fff">
        {t('gameResults')}
      </ThemedText>
      {records.map((r) => (
        <ThemedText key={r.stage} lightColor="#fff" darkColor="#fff">
          {t('stageRecord', {
            stage: r.stage,
            steps: r.steps,
            bumps: r.bumps,
            respawns: r.respawns,
            reveals: r.reveals,
          })}
        </ThemedText>
      ))}
      <ThemedText lightColor="#fff" darkColor="#fff">
        {t('totalStats', totals)}
      </ThemedText>
      <PlainButton
        title={t('backToTitle')}
        onPress={() => router.replace('/')}
        accessibilityLabel={t('backToTitle')}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: UI.screenGap },
});
