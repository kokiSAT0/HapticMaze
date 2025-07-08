import { InterstitialAd, TestIds, AdEventType } from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

// テスト用ID。__DEV__ でのみ使われます
const TEST_ID = TestIds.INTERSTITIAL;

// 本番用ID。環境変数が無ければテストIDを使用
export const AD_UNIT_ID = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID ?? TEST_ID;

// 環境変数 EXPO_PUBLIC_DISABLE_ADS が 'true' のとき広告関連処理を無効化する
export const DISABLE_ADS = process.env.EXPO_PUBLIC_DISABLE_ADS === 'true';

/**
 * インタースティシャル広告を読み込みつつ表示する関数
 * 広告が閉じられると解決します
 */
export async function showInterstitial() {
  // Web 環境や広告無効化フラグが立っている場合はすぐ解決します
  if (Platform.OS === 'web' || DISABLE_ADS) {
    return Promise.resolve();
  }

  const ad = InterstitialAd.createForAdRequest(AD_UNIT_ID);

  return new Promise<void>((resolve) => {
    // React Native 環境の setTimeout は number を返すため ReturnType で受け取る
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // 広告イベントを監視し、読み込み完了で表示、閉じるかエラーで終了
    const unsubscribe = ad.addAdEventsListener(({ type }) => {
      console.log('Interstitial event', type);
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

/**
 * 広告だけを事前に読み込む関数。成功時は InterstitialAd を返す
 */
export async function loadInterstitial(): Promise<InterstitialAd | null> {
  if (Platform.OS === 'web' || DISABLE_ADS) return Promise.resolve(null);
  const ad = InterstitialAd.createForAdRequest(AD_UNIT_ID);
  return new Promise((resolve) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const unsubscribe = ad.addAdEventsListener(({ type }) => {
      console.log('Interstitial load', type);
      if (type === AdEventType.LOADED) {
        if (timeoutId) clearTimeout(timeoutId);
        unsubscribe();
        resolve(ad);
      }
      if (type === AdEventType.ERROR) {
        if (timeoutId) clearTimeout(timeoutId);
        unsubscribe();
        resolve(null);
      }
    });
    timeoutId = setTimeout(() => {
      unsubscribe();
      resolve(null);
    }, 10000);
    ad.load();
  });
}

/**
 * 読み込み済み広告を表示する関数
 */
export async function showLoadedInterstitial(ad: InterstitialAd) {
  if (Platform.OS === 'web' || DISABLE_ADS) return Promise.resolve();
  return new Promise<void>((resolve) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const unsubscribe = ad.addAdEventsListener(({ type }) => {
      console.log('Interstitial show', type);
      if (type === AdEventType.OPENED) {
        if (timeoutId) clearTimeout(timeoutId);
      }
      if (type === AdEventType.CLOSED || type === AdEventType.ERROR) {
        if (timeoutId) clearTimeout(timeoutId);
        unsubscribe();
        resolve();
      }
    });
    timeoutId = setTimeout(() => {
      unsubscribe();
      resolve();
    }, 10000);
    ad.show();
  });
}
