import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PlainButton } from '@/components/PlainButton';
import { LEVELS } from '@/constants/levels';
import {
  loadHighScore,
  clearAllHighScores,
  type HighScore,
} from '@/src/game/highScore';
import { useSnackbar } from '@/src/hooks/useSnackbar';
import { UI } from '@/constants/ui';
import { useLocale, type MessageKey } from '@/src/locale/LocaleContext';

export default function ScoresScreen() {
  const router = useRouter();
  const { t } = useLocale();
  const { show: showSnackbar } = useSnackbar();
  // レベルIDごとのハイスコアを保持
  const [scores, setScores] = useState<Record<string, HighScore | null>>({});
  // リセット確認モーダルの表示状態
  const [showConfirm, setShowConfirm] = useState(false);

  // ハイスコアを読み込んで state を更新する共通処理
  const loadScores = async () => {
    const result: Record<string, HighScore | null> = {};
    for (const lv of LEVELS) {
      result[lv.id] = await loadHighScore(lv.id, { showError: showSnackbar });
    }
    setScores(result);
  };

  // 画面初期表示時に各レベルのハイスコアを読み込む
  useEffect(() => {
    loadScores();
    // showSnackbar は変化しない想定なので依存配列から除外
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        title={t('resetHighScores')}
        onPress={() => setShowConfirm(true)}
        accessibilityLabel={t('resetHighScores')}
      />
      <PlainButton
        title={t('backToTitle')}
        onPress={() => router.replace('/')}
        accessibilityLabel={t('backToTitle')}
      />

      {/* リセット確認モーダル */}
      <Modal transparent visible={showConfirm} animationType="fade">
        <View style={styles.modalWrapper} accessible accessibilityLabel="リセット確認オーバーレイ">
          <ThemedView style={styles.modalContent}>
            <ThemedText type="title" lightColor="#fff" darkColor="#fff">
              {t('confirmResetHighScores')}
            </ThemedText>
            <PlainButton
              title={t('yes')}
              onPress={async () => {
                await clearAllHighScores(
                  LEVELS.map((l) => l.id),
                  { showError: showSnackbar },
                );
                await loadScores();
                setShowConfirm(false);
              }}
              accessibilityLabel={t('yes')}
            />
            <PlainButton
              title={t('cancel')}
              onPress={() => setShowConfirm(false)}
              accessibilityLabel={t('cancel')}
            />
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: UI.screenGap },
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  modalContent: {
    gap: UI.modalGap,
    padding: UI.modalPadding,
    backgroundColor: '#000',
  },
});
