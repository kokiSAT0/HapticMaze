import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import Constants from 'expo-constants';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

/**
 * AdMob に渡されている各種 ID を画面に表示するためのデバッグ用コンポーネント
 */
export function AdInfo() {
  // app.config.js で extra に注入した値を取得
  const extra = Constants.expoConfig?.extra as {
    admobAndroidAppId?: string;
    admobIosAppId?: string;
    admobInterstitialId?: string;
  } | undefined;

  // プラットフォームに応じて App ID を選択
  const appId = Platform.OS === 'ios' ? extra?.admobIosAppId : extra?.admobAndroidAppId;
  const interstitialId = extra?.admobInterstitialId;

  return (
    <ThemedView style={styles.container}>
      {/* 実際に注入された値をそのまま表示 */}
      <ThemedText lightColor="#fff" darkColor="#fff">
        App ID: {appId ?? 'undefined'}
      </ThemedText>
      <ThemedText lightColor="#fff" darkColor="#fff">
        Interstitial ID: {interstitialId ?? 'undefined'}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    alignItems: 'center',
  },
});
