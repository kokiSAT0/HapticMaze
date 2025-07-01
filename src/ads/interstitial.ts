import { InterstitialAd, TestIds, AdEventType } from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

// テスト用ID。__DEV__ でのみ使われます
const TEST_ID = TestIds.INTERSTITIAL;

// 本番用ID。環境変数が無ければテストIDを使用
export const AD_UNIT_ID = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID ?? TEST_ID;

/**
 * インタースティシャル広告を読み込みつつ表示する関数
 * 広告が閉じられると解決します
 */
export async function showInterstitial() {
  // Web 環境では広告が表示できないためすぐ解決します
  if (Platform.OS === 'web') {
    return Promise.resolve();
  }

  const ad = InterstitialAd.createForAdRequest(AD_UNIT_ID);

  return new Promise<void>((resolve) => {
    // React Native 環境の setTimeout は number を返すため ReturnType で受け取る
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // 広告イベントを監視し、読み込み完了で表示、閉じるかエラーで終了
    const unsubscribe = ad.addAdEventsListener(({ type }) => {
      if (type === AdEventType.LOADED) {
        ad.show();
      }
      if (type === AdEventType.OPENED) {
        // 表示されたらフェイルセーフ用タイマーを解除
        if (timeoutId) clearTimeout(timeoutId);
      }
      if (type === AdEventType.CLOSED || type === AdEventType.ERROR) {
        if (timeoutId) clearTimeout(timeoutId);
        unsubscribe();
        resolve();
      }
    });

    // 読み込みに 10 秒以上かかった場合はあきらめて終了
    timeoutId = setTimeout(() => {
      unsubscribe();
      resolve();
    }, 10000);

    ad.load();
  });
}
