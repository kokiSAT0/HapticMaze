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
    let timeoutId: NodeJS.Timeout;

    const unsubscribe = ad.onAdEvent((type, error) => {
      if (type === AdEventType.LOADED) {
        ad.show();
      }
      if (type === AdEventType.CLOSED || type === AdEventType.ERROR || error) {
        clearTimeout(timeoutId);
        unsubscribe();
        resolve();
      }
    });

    // 一定時間表示されない場合でも解決するようタイマーを設定
    timeoutId = setTimeout(() => {
      unsubscribe();
      resolve();
    }, 3000);

    ad.load();
  });
}
