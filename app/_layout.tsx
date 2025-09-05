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
import { LocaleProvider, useLocale } from '@/src/locale/LocaleContext';
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

export default function RootLayout() {
  // LocaleProvider でアプリ全体を包み、内部コンポーネントから翻訳を利用可能にする
  return (
    <LocaleProvider>
      <RootLayoutInner />
    </LocaleProvider>
  );
}

/**
 * 実際のレイアウト本体。翻訳関数 t を利用してエラーメッセージを表示する。
 */
function RootLayoutInner() {
  const colorScheme = useColorScheme();
  // スナックバー表示用フック。エラー通知に利用する
  const { show: showSnackbar } = useSnackbar();
  const handleError = useHandleError();
  const { t } = useLocale();
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
      // すでに初期化済みであれば何もせず終了する
      if (adsInitialized) return;

      // Web 環境や広告の無効化フラグが立っている場合は初期化不要
      if (Platform.OS === 'web' || DISABLE_ADS) return;

      try {
        // iOS のみ ATT を確認。その他は常に許可相当として扱う
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

        // 非パーソナライズ設定を先に反映してから SDK 初期化
        setNonPersonalized(!authorized);

        // 広告 SDK を初期化
        await mobileAds().initialize();

        // 初期化が完了したことを示すフラグを更新
        adsInitialized = true;
      } catch (e) {
        // 翻訳キーを利用してエラーメッセージを表示
        handleError(t('adInitFailure'), e);
      }
    }

    // 初回レンダー直後だとダイアログが無視されることがあるため一フレーム遅らせる
    // requestAnimationFrame で次フレームに処理を移す
    const id = requestAnimationFrame(() => {
      // この時点でアプリがアクティブになっているので安全に広告初期化を行える
      void initAds();
    });
    // コンポーネントがアンマウントされた場合に備えてキャンセルを行う
    return () => cancelAnimationFrame(id);
  }, [handleError, t]);

  // フォアグラウンド復帰時に追跡許可ステータスを再確認
  useEffect(() => {
    // AppState の状態変化時に呼び出されるコールバック
    const handleAppStateChange = async (state: AppStateStatus) => {
      if (state !== 'active') return;
      try {
        let authorized = Platform.OS !== 'ios';
        if (Platform.OS === 'ios') {
          const { status } = await getTrackingPermissionsAsync();
          authorized = status === 'granted';
        }
        setNonPersonalized(!authorized);
      } catch (e) {
        // 取得に失敗した場合は翻訳キーから文言を取得して表示
        handleError(t('trackingPermissionFailure'), e);
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [handleError, t]);

  if (!loaded) return null;

  return (
    <ErrorBoundary onError={showSnackbar}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RemoveAdsProvider>
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
        </RemoveAdsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
