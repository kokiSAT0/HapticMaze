import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import mobileAds from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// expo-tracking-transparency は Expo SDK に同梱されている
import {
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
  type TrackingStatus,
} from 'expo-tracking-transparency';
import { DISABLE_ADS, setNonPersonalized } from '@/src/ads/interstitial';
// 課金情報の初期化を行うモジュール
import { RemoveAdsProvider } from '@/src/iap/removeAds';
import { useHandleError } from '@/src/utils/handleError';

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
  const handleError = useHandleError();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // アプリ全体のエラーハンドラを設定
  useEffect(() => {
    initGlobalErrorHandler(showSnackbar);
    initUnhandledRejectionHandler(showSnackbar);
  }, [showSnackbar]);


  // ATT 許可を確認してから広告 SDK を初期化
  useEffect(() => {
    async function initAds() {
      if (Platform.OS === 'web' || DISABLE_ADS) return;
      let status: TrackingStatus = 'unavailable';
      try {
        if (Platform.OS === 'ios') {
          const asked = await AsyncStorage.getItem('trackingPermissionRequested');
          if (asked) {
            ({ status } = await getTrackingPermissionsAsync());
          } else {
            ({ status } = await requestTrackingPermissionsAsync());
            await AsyncStorage.setItem('trackingPermissionRequested', 'true');
          }
        }
        const authorized = Platform.OS !== 'ios' || status === 'authorized';
        // 許可されなかった場合は非パーソナライズ広告に切り替え
        setNonPersonalized(!authorized);
        await mobileAds().initialize();
      } catch (e) {
        handleError('広告初期化に失敗しました', e);
      }
    }
    void initAds();
  }, [handleError]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ErrorBoundary onError={showSnackbar}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RemoveAdsProvider>
          <LocaleProvider>
          <BgmProvider>
            <SeVolumeProvider>
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
                  {/* デバッグ用のエラーログ一覧画面 */}
                  <Stack.Screen name="error-logs" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </GameProvider>
              </RunRecordProvider>
              </ResultStateProvider>
              <StatusBar style="auto" />
            </SeVolumeProvider>
          </BgmProvider>
        </LocaleProvider>
        </RemoveAdsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
