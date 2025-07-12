import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import mobileAds from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';
import { DISABLE_ADS } from '@/src/ads/interstitial';

import { useColorScheme } from '@/hooks/useColorScheme';
import { GameProvider } from '@/src/game/useGame';
import { LocaleProvider } from '@/src/locale/LocaleContext';
import { ResultStateProvider } from '@/src/hooks/useResultState';
import { RunRecordProvider } from '@/src/hooks/useRunRecords';
import { BgmProvider } from '@/src/audio/BgmProvider';
import { SeVolumeProvider } from '@/src/audio/SeVolumeProvider';
import { useSnackbar } from '@/src/hooks/useSnackbar';
import { initGlobalErrorHandler } from '@/src/utils/initGlobalErrorHandler';
import { initUnhandledRejectionHandler } from '@/src/utils/initUnhandledRejectionHandler';

import { ErrorBoundary } from '@/src/components/ErrorBoundary';


export default function RootLayout() {
  const colorScheme = useColorScheme();
  // スナックバー表示用フック。エラー通知に利用する
  const { show: showSnackbar } = useSnackbar();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // アプリ全体のエラーハンドラを設定
  useEffect(() => {
    initGlobalErrorHandler(showSnackbar);
    initUnhandledRejectionHandler(showSnackbar);
  }, [showSnackbar]);

  // Google Mobile Ads SDK を初期化する。web 環境や広告無効化時はスキップ
  useEffect(() => {
    if (!DISABLE_ADS && Platform.OS !== 'web') {
      // OS は Android/iOS のいずれか。ここで初期化しないと広告が表示されないことがある
      try {
        mobileAds().initialize();
      } catch (e) {
        // エラー内容をログに出し、ユーザーにも通知する
        console.error(e);
        showSnackbar('広告初期化に失敗しました');
      }
    }
  }, [showSnackbar]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ErrorBoundary onError={showSnackbar}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <BgmProvider>
          <SeVolumeProvider>
            <LocaleProvider>
              <ResultStateProvider>
                <RunRecordProvider>
                <GameProvider>
                <Stack>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="practice" options={{ headerShown: false }} />
                  <Stack.Screen name="scores" options={{ headerShown: false }} />
                  <Stack.Screen name="options" options={{ headerShown: false }} />
                  <Stack.Screen name="rules" options={{ headerShown: false }} />
                  <Stack.Screen name="play" options={{ headerShown: false }} />
                  <Stack.Screen name="stage" options={{ headerShown: false }} />
                  <Stack.Screen name="reset" options={{ headerShown: false }} />
                  <Stack.Screen name="game-result" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </GameProvider>
              </RunRecordProvider>
              </ResultStateProvider>
            </LocaleProvider>
            <StatusBar style="auto" />
          </SeVolumeProvider>
        </BgmProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
