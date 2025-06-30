import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PlainButton } from '@/components/PlainButton';
import { LEVELS } from '@/constants/levels';
import { loadHighScore, type HighScore } from '@/src/game/highScore';
import { useLocale, type MessageKey } from '@/src/locale/LocaleContext';

export default function ScoresScreen() {
  const router = useRouter();
  const { t } = useLocale();
  // レベルIDごとのハイスコアを保持
  const [scores, setScores] = useState<Record<string, HighScore | null>>({});

  // 画面初期表示時に各レベルのハイスコアを読み込む
  useEffect(() => {
    (async () => {
      const result: Record<string, HighScore | null> = {};
      for (const lv of LEVELS) {
        result[lv.id] = await loadHighScore(lv.id);
      }
      setScores(result);
    })();
  }, []);

  return (
    <ThemedView lightColor="#000" darkColor="#000" style={styles.container}>
      <ThemedText type="title" lightColor="#fff" darkColor="#fff">
        {t('highScores')}
      </ThemedText>
      {LEVELS.map((lv) => {
        const score = scores[lv.id];
        return (
          <ThemedText key={lv.id} lightColor="#fff" darkColor="#fff">
            {t(lv.id as MessageKey)}:
            {score
              ? t('best', {
                  stage: score.stage,
                  steps: score.steps,
                  bumps: score.bumps,
                })
              : t('noRecord')}
          </ThemedText>
        );
      })}
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
