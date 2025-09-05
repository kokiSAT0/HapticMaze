import React from 'react';
import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
// 多言語化のために Locale コンテキストを利用
import { useLocale } from '@/src/locale/LocaleContext';

export default function NotFoundScreen() {
  // t 関数で翻訳済みの文言を取得
  const { t } = useLocale();

  return (
    <>
      {/* 画面タイトルも翻訳キーから取得 */}
      <Stack.Screen options={{ title: t('notFoundTitle') }} />
      <ThemedView style={styles.container}>
        {/* ユーザーに存在しない画面であることを説明 */}
        <ThemedText type="title">{t('notFoundMessage')}</ThemedText>
        <Link href="/" style={styles.link}>
          {/* ホーム画面へ戻るリンク */}
          <ThemedText type="link">{t('goHome')}</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
