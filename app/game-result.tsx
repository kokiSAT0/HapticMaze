import React from 'react';
// ScrollView を使うために追加インポート
import { StyleSheet, Platform, ScrollView } from 'react-native';
// SafeArea の情報を取得するためのフックを追加
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PlainButton } from '@/components/PlainButton';
import { ScoreChart } from '@/components/ScoreChart';
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
  // 端末のセーフエリア余白を取得する
  const insets = useSafeAreaInsets();
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

  // 各ステージごとのスコアを配列化してグラフ用に整形
  const stepData = records.map((r) => r.steps);
  const bumpData = records.map((r) => r.bumps);
  const respawnData = records.map((r) => r.respawns);
  const revealData = records.map((r) => r.reveals);

  return (
    <ThemedView
      lightColor="#000"
      darkColor="#000"
      // セーフエリアを考慮して上と下に余白を追加
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      {/* ScrollView で一覧を縦スクロール可能にする */}
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" lightColor="#fff" darkColor="#fff">
          {t('gameResults')}
        </ThemedText>
        <ThemedText lightColor="#fff" darkColor="#fff">
          {t('stepsGraph')}
        </ThemedText>
        <ScoreChart
          data={stepData}
          color="#00f"
          accessibilityLabel={t('stepsGraph')}
        />
        <ThemedText lightColor="#fff" darkColor="#fff">
          {t('bumpsGraph')}
        </ThemedText>
        <ScoreChart
          data={bumpData}
          color="#f33"
          accessibilityLabel={t('bumpsGraph')}
        />
        <ThemedText lightColor="#fff" darkColor="#fff">
          {t('respawnsGraph')}
        </ThemedText>
        <ScoreChart
          data={respawnData}
          color="#3c3"
          accessibilityLabel={t('respawnsGraph')}
        />
        <ThemedText lightColor="#fff" darkColor="#fff">
          {t('revealsGraph')}
        </ThemedText>
        <ScoreChart
          data={revealData}
          color="#ff0"
          accessibilityLabel={t('revealsGraph')}
        />
        <ThemedText lightColor="#fff" darkColor="#fff">
          {t('totalStats', totals)}
        </ThemedText>
        <PlainButton
          title={t('backToTitle')}
          onPress={handleBack}
          accessibilityLabel={t('backToTitle')}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  // 外側の View は背景色をつけるだけ
  container: { flex: 1 },
  // ScrollView 内の要素を中央寄せにする
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: UI.screenGap,
    paddingVertical: UI.screenGap,
  },
});
