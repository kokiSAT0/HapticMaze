// eslint-disable-next-line import/no-unresolved
import { InterstitialAd, TestIds, AdEventType } from 'react-native-google-mobile-ads';

// テスト用ID。__DEV__ でのみ使われます
const TEST_ID = TestIds.INTERSTITIAL;

// 本番用ID。環境変数が無ければテストIDを使用
export const AD_UNIT_ID = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID ?? TEST_ID;

/**
 * インタースティシャル広告を読み込みつつ表示する関数
 * 広告が閉じられると解決します
 */
export async function showInterstitial() {
  const ad = InterstitialAd.createForAdRequest(AD_UNIT_ID);
  return new Promise<void>((resolve) => {
    const unsubscribe = ad.onAdEvent((type, error) => {
      if (type === AdEventType.LOADED) {
        ad.show();
      }
      if (type === AdEventType.CLOSED || error) {
        unsubscribe();
        resolve();
      }
    });
    ad.load();
  });
}
