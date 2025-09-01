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


// 広告 SDK の初期化がすでに完了しているかどうかを管理するフラグ
// initAds 内で利用し、二重初期化を防ぐ
let adsInitialized = false;

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
      // すでに初期化済みであれば何もせず終了する
      if (adsInitialized) return;

      // Web 環境や広告の無効化フラグが立っている場合は初期化不要
      if (Platform.OS === 'web' || DISABLE_ADS) return;

      // 追跡許可ステータスの初期値を設定
      let status: TrackingStatus = 'unavailable';
      try {
        if (Platform.OS === 'ios') {
          // 端末の追跡許可ステータスを直接取得
          // 端末ステータスを直接参照することでフラグに依存しないようにする
          ({ status } = await getTrackingPermissionsAsync());

          // 「未決定」の場合のみユーザーに許可をリクエスト
          if (status === 'not-determined') {
            ({ status } = await requestTrackingPermissionsAsync());
          }
        }
        const authorized = Platform.OS !== 'ios' || status === 'authorized';
        // 許可されなかった場合は非パーソナライズ広告に切り替え
        setNonPersonalized(!authorized);

        // 広告 SDK を初期化
        await mobileAds().initialize();

        // 初期化が完了したことを示すフラグを更新
        adsInitialized = true;
      } catch (e) {
        handleError('広告初期化に失敗しました', e);
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
  }, [handleError]);

  // アプリがバックグラウンドから復帰した際に追跡許可ステータスを再確認
  useEffect(() => {
    // AppState の状態変化時に呼び出されるコールバック
    const handleAppStateChange = async (state: AppStateStatus) => {
      // フォアグラウンドに戻った場合のみ実行する
      if (state === 'active') {
        try {
          // 現在の追跡許可ステータスを取得
          const { status } = await getTrackingPermissionsAsync();
          // iOS で許可されているかどうかを判定
          const authorized = Platform.OS !== 'ios' || status === 'authorized';
          // 許可されていない場合は非パーソナライズ広告を有効にする
          setNonPersonalized(!authorized);
        } catch (e) {
          // 取得に失敗した場合はエラーハンドラで通知
          handleError('追跡許可の再取得に失敗しました', e);
        }
      }
    };

    // AppState の変更を監視開始
    AppState.addEventListener('change', handleAppStateChange);

    // クリーンアップ時にリスナーを解除
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
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
