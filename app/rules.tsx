import React from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { PlainButton } from '@/components/PlainButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocale } from '@/src/locale/LocaleContext';
import { UI } from '@/constants/ui';

export default function RulesScreen() {
  const router = useRouter();
  const { t } = useLocale();
  return (
    <ThemedView lightColor="#000" darkColor="#000" style={styles.container}>
      {/* 画面タイトル */}
      <ThemedText type="title" lightColor="#fff" darkColor="#fff">
        {t('howToPlay')}
      </ThemedText>
      {/* ゲームの概要説明 */}
      <ThemedText lightColor="#fff" darkColor="#fff" style={styles.text}>
        {t('ruleIntro')}
      </ThemedText>
      {/* リスポーンボタンの説明 */}
      <ThemedText lightColor="#fff" darkColor="#fff" style={styles.text}>
        {t('respawnUsage')}
      </ThemedText>
      {/* 可視化ボタンの説明 */}
      <ThemedText lightColor="#fff" darkColor="#fff" style={styles.text}>
        {t('revealUsage')}
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: UI.screenGap,
    paddingHorizontal: 20,
  },
  // 説明文の幅が広くなりすぎないよう中央揃えに
  text: {
    textAlign: 'center',
  },
});
