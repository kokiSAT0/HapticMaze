import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PlainButton } from '@/components/PlainButton';
import { useRunRecords } from '@/src/hooks/useRunRecords';
import { useLocale } from '@/src/locale/LocaleContext';
import { useBgm } from '@/src/hooks/useBgm';
// 広告表示に必要な関数と無効化フラグ
import { showInterstitial, DISABLE_ADS } from '@/src/ads/interstitial';
import { useHandleError } from '@/src/utils/handleError';
import { UI } from '@/constants/ui';

export default function GameResultScreen() {
  const { records } = useRunRecords();
  const { t } = useLocale();
  const router = useRouter();
  // BGM 制御フック。広告表示中は音を止めるために利用
  const { pause: pauseBgm, resume: resumeBgm } = useBgm();
  // 例外処理を共通化したフック。エラー通知とログ出力を行う
  const handleError = useHandleError();

  /** ホームへ戻るボタンの処理。広告を見てから遷移する */
  const handleBack = async () => {
    // 広告が表示されるときだけ音を止める
    const needMute = !DISABLE_ADS && Platform.OS !== 'web';
    try {
      if (needMute) pauseBgm();
      await showInterstitial();
    } catch (e) {
      // 広告が表示できなかった場合はユーザーへ知らせる
      handleError('広告を表示できませんでした', e);
    } finally {
      if (needMute) resumeBgm();
      router.replace('/');
    }
  };

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
        onPress={handleBack}
        accessibilityLabel={t('backToTitle')}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: UI.screenGap },
});
