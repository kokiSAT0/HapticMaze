import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { PlainButton } from '@/components/PlainButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocale } from '@/src/locale/LocaleContext';
import type { HighScore } from '@/src/game/highScore';

interface ResultModalProps {
  visible: boolean;
  gameOver: boolean;
  stageClear: boolean;
  gameClear: boolean;
  steps: number;
  bumps: number;
  stage: number;
  totalStages: number;
  highScore: HighScore | null;
  newRecord: boolean;
  onOk: () => void;
  topOffset: number;
}

// ゴールやゲームオーバー時に表示するモーダル
export function ResultModal({
  visible,
  gameOver,
  stageClear,
  gameClear,
  steps,
  bumps,
  stage,
  totalStages,
  highScore,
  newRecord,
  onOk,
  topOffset,
}: ResultModalProps) {
  const { t } = useLocale();
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.wrapper}>
        <ThemedView style={[styles.content, { marginTop: topOffset }]}>
          <ThemedText type="title">
            {gameClear ? t('gameClear') : gameOver ? t('gameOver') : t('goal')}
          </ThemedText>
          <ThemedText>{t('steps', { count: steps })}</ThemedText>
          <ThemedText>{t('bumps', { count: bumps })}</ThemedText>
          <ThemedText>{t('stage', { current: stage, total: totalStages })}</ThemedText>
          {highScore && (gameClear || gameOver) && (
            <ThemedText>
              {t('best', {
                stage: highScore.stage,
                steps: highScore.steps,
                bumps: highScore.bumps,
              })}
            </ThemedText>
          )}
          {newRecord && (gameClear || gameOver) && (
            <ThemedText>{t('newRecord')}</ThemedText>
          )}
          <PlainButton
            title={t('ok')}
            onPress={onOk}
            accessibilityLabel={t('backToTitle')}
          />
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    gap: 10,
    width: 250,
  },
});

