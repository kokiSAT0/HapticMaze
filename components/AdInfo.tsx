import React from 'react';
import { StyleSheet, Platform } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

/**
 * AdMob に渡されている各種 ID を画面に表示するためのデバッグ用コンポーネント
 */
export function AdInfo() {
  // 環境変数はビルド時に置き換わるため、eas update でも値を確認可能
  const appId =
    Platform.OS === 'ios'
      ? process.env.IOS_ADMOB_APP_ID
      : process.env.ANDROID_ADMOB_APP_ID;
  const interstitialId = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID;

  return (
    <ThemedView
      style={styles.container}
      accessible
      accessibilityLabel="広告設定情報"
    >
      {/* 実際にビルド時の値をそのまま表示する */}
      <ThemedText lightColor="#000" darkColor="#000">
        App ID: {appId ?? 'undefined'}
      </ThemedText>
      <ThemedText lightColor="#000" darkColor="#000">
        Interstitial ID: {interstitialId ?? 'undefined'}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16, // 上部との余白
    alignItems: 'center', // 中央揃え
  },
});
