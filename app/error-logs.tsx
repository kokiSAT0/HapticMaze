import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { PlainButton } from '@/components/PlainButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { UI } from '@/constants/ui';
import { getErrorLogs, type ErrorLog, clearErrorLogs } from '@/src/utils/errorLogger';
import { useLocale } from '@/src/locale/LocaleContext';

export default function ErrorLogsScreen() {
  const router = useRouter();
  // 取得したエラーログを保持
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const { t } = useLocale();

  // 画面表示時にログを読み込む
  useEffect(() => {
    (async () => {
      const list = await getErrorLogs();
      setLogs(list);
    })();
  }, []);

  // ログをクリアして一覧も更新する
  const handleClear = async () => {
    await clearErrorLogs();
    setLogs([]);
  };

  return (
    <ThemedView lightColor="#000" darkColor="#000" style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText type="title" lightColor="#fff" darkColor="#fff">
          {t('errorLogs')}
        </ThemedText>
        {logs.map((log, i) => (
          // 1 件ごとのログをシンプルに表示
          <ThemedText key={i} lightColor="#fff" darkColor="#fff" style={styles.logItem}>
            {new Date(log.time).toLocaleString()} / {log.message} / {log.error}
          </ThemedText>
        ))}
        {logs.length === 0 && (
          <ThemedText lightColor="#fff" darkColor="#fff">
            ログはありません
          </ThemedText>
        )}
        <PlainButton
          title={t('deleteLogs')}
          onPress={handleClear}
          // ログを全削除するボタン
          accessibilityLabel={t('deleteLogs')}
        />
        <PlainButton
          title={t('backToTitle')}
          onPress={() => router.replace('/')}
          accessibilityLabel={t('backToTitle')}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', gap: UI.screenGap, paddingVertical: UI.screenGap },
  logItem: {
    // 長いメッセージが折り返されるように幅を制限
    width: UI.modalWidth,
  },
});
