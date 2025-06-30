import { AdMobInterstitial } from 'expo-ads-admob';

// テスト広告ID。AdMobが提供するサンプル用IDです
const TEST_ID = 'ca-app-pub-3940256099942544/4411468910';

// 環境変数 EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID が定義されていれば本番用として使用
// Expoのビルド時に `EXPO_PUBLIC_` プレフィックスを付けた変数を設定すると
// process.env から参照できます
export const AD_UNIT_ID = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID ?? TEST_ID;

/**
 * インタースティシャル広告を表示するヘルパー関数
 * 非同期処理となるため呼び出し元で await する想定
 */
export async function showInterstitial() {
  try {
    await AdMobInterstitial.setAdUnitID(AD_UNIT_ID);
    // パーソナライズド広告を有効にしてロード
    await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
    // 広告を表示。閉じられると Promise が解決する
    await AdMobInterstitial.showAdAsync();
  } catch (e) {
    // 失敗時はコンソールに表示するだけでゲーム進行には影響させない
    console.log('AdMob error', e);
  }
}
