import React from "react";
import { Platform, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useLocale } from "@/src/locale/LocaleContext";

/**
 * AdMob に渡されている各種 ID を画面に表示するためのデバッグ用コンポーネント
 */
export function AdInfo() {
  const { t } = useLocale();
  // 環境変数はビルド時に置き換わるため、eas update でも値を確認可能
  const appId =
    Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_IOS_ADMOB_APP_ID
      : process.env.EXPO_PUBLIC_ANDROID_ADMOB_APP_ID;
  const interstitialId = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID;

  return (
    <ThemedView
      style={styles.container}
      accessible
      // デバッグ情報全体の説明ラベル
      accessibilityLabel={t('adInfo')}
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
    alignItems: "center", // 中央揃え
  },
});
