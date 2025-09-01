import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import mobileAds from 'react-native-google-mobile-ads';
import { AppState, AppStateStatus, Platform } from 'react-native';
// expo-tracking-transparency は Expo SDK に同梱されている
import {
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
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

// 広告 SDK の初期化がすでに完了しているかどうかを管理するフラグ
// initAds 内で利用し、二重初期化を防ぐ
let adsInitialized = false;

// iOS: アプリが active になるまで待機（最大 5 秒）
async function waitForActive(timeoutMs = 5000) {
  if (Platform.OS !== 'ios') return;
  if (AppState.currentState === 'active') return;
  await new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      sub.remove();
      resolve();
    }, timeoutMs);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        clearTimeout(timer);
        sub.remove();
        resolve();
      }
    });
  });
}

// 初回フレーム完了＋短い遅延（ダイアログを安全に出すため）
async function settleUI(delayMs = 150) {
  await new Promise<void>((r) => requestAnimationFrame(() => r()));
  await new Promise<void>((r) => setTimeout(r, delayMs));
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // スナックバー表示用フック。エラー通知に利用する
  const { show: showSnackbar } = useSnackbar();
  const handleError = useHandleError();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // グローバルハンドラ設定
  useEffect(() => {
    initGlobalErrorHandler(showSnackbar);
    initUnhandledRejectionHandler(showSnackbar);
  }, [showSnackbar]);

  // ATT を確認してから広告 SDK を初期化（初回のみ）
  useEffect(() => {
    async function initAds() {
      // すでに初期化済みであれば何もせず終了する
      if (adsInitialized) return;

      // Web 環境や広告の無効化フラグが立っている場合は初期化不要
      if (Platform.OS === 'web' || DISABLE_ADS) return;

      try {
        // iOS ではアプリが active になってからダイアログを出す
        await waitForActive();
        await settleUI();

        let authorized = Platform.OS !== 'ios';
        if (Platform.OS === 'ios') {
          const current = await getTrackingPermissionsAsync();

          // 初回のみシステムダイアログを表示
          if (current.status === 'undetermined') {
            const req = await requestTrackingPermissionsAsync();
            authorized = req.status === 'granted';
          } else {
            authorized = current.status === 'granted';
          }
        }

        // ユーザー選択を反映（同意なし＝非パーソナライズ）
        setNonPersonalized(!authorized);

        // 反映後に広告 SDK を初期化（同意前に初期化しない）
        await mobileAds().initialize();

        // 初期化が完了したことを示すフラグを更新
        adsInitialized = true;
      } catch (e) {
        handleError('広告初期化に失敗しました', e);
      }
    }

    // 初回レンダーの次フレームで開始
    const id = requestAnimationFrame(() => {
      // この時点でアプリがアクティブになっているので安全に広告初期化を行える
      void initAds();
    });
    // コンポーネントがアンマウントされた場合に備えてキャンセルを行う
    return () => cancelAnimationFrame(id);
  }, [handleError]);

  // 復帰時は非パーソナライズ設定のみ再同期（広告 SDK は再初期化しない）
  useEffect(() => {
    // AppState の状態変化時に呼び出されるコールバック
    const handleAppStateChange = async (state: AppStateStatus) => {
      if (state !== 'active') return;
      try {
        const authorized =
          Platform.OS !== 'ios'
            ? true
            : (await getTrackingPermissionsAsync()).status === 'granted';
        setNonPersonalized(!authorized);
      } catch (e) {
          // 取得に失敗した場合はエラーハンドラで通知
        handleError('追跡許可の再取得に失敗しました', e);
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [handleError]);

  if (!loaded) return null;

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
