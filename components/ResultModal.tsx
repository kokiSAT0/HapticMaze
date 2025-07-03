import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PlainButton } from '@/components/PlainButton';
import { useLocale } from '@/src/locale/LocaleContext';
import type { HighScore } from '@/src/game/highScore';

/** 結果表示モーダル */
export function ResultModal({
  visible,
  top,
  title,
  steps,
  bumps,
  stageText,
  highScore,
  newRecord,
  onOk,
  okLabel,
  accLabel,
}: {
  visible: boolean;
  top: number;
  title: string;
  steps: string;
  bumps: string;
  stageText: string;
  highScore: HighScore | null;
  newRecord: boolean;
  onOk: () => void | Promise<void>;
  okLabel: string;
  accLabel: string;
}) {
  // 画面の文言を取得するためにロケールフックを利用
  const { t } = useLocale();
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.wrapper} accessible accessibilityLabel="結果表示オーバーレイ">
        <ThemedView style={[styles.content, { marginTop: top }]}>
          <ThemedText type="title">{title}</ThemedText>
          <ThemedText>{steps}</ThemedText>
          <ThemedText>{bumps}</ThemedText>
          <ThemedText>{stageText}</ThemedText>
          {highScore && (
            <ThemedText>
              {t('best', {
                stage: highScore.stage,
                steps: highScore.steps,
                bumps: highScore.bumps,
              })}
            </ThemedText>
          )}
          {newRecord && <ThemedText>{t('newRecord')}</ThemedText>}
          <PlainButton title={okLabel} onPress={onOk} accessibilityLabel={accLabel} />
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
