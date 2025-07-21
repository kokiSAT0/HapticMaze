import { InterstitialAd, TestIds, AdEventType } from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';
// 広告削除課金の状態を参照する
import { isAdsRemoved } from '@/src/iap/removeAds';
// 広告の詳細なログ出力用関数を読み込む
import { adLog } from '@/src/utils/logger';

// テスト用ID。__DEV__ でのみ使われます
const TEST_ID = TestIds.INTERSTITIAL;

// 本番用ID。環境変数が無ければテストIDを使用
export const AD_UNIT_ID = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID ?? TEST_ID;

// 環境変数 EXPO_PUBLIC_DISABLE_ADS が 'true' のとき広告関連処理を無効化する
export const DISABLE_ADS = process.env.EXPO_PUBLIC_DISABLE_ADS === 'true';

// インタースティシャル広告の読み込み・表示を待つ最大時間をミリ秒単位で指定する
const INTERSTITIAL_TIMEOUT_MS = 10000;

/**
 * インタースティシャル広告を読み込みつつ表示する関数
 * 広告が閉じられると解決、エラーやタイムアウトでは reject します
 */
export async function showInterstitial() {
  // Web 環境や広告無効化フラグが立っている場合はすぐ解決します
  if (Platform.OS === 'web' || DISABLE_ADS || isAdsRemoved()) {
    return Promise.resolve();
  }

  const ad = InterstitialAd.createForAdRequest(AD_UNIT_ID);
  // どの ID を使っているか確認できるように出力しておく
  adLog('showInterstitial start', { unitId: AD_UNIT_ID });

  return new Promise<void>((resolve, reject) => {
    // Promise を reject できるように第二引数を追加
    // React Native 環境の setTimeout は number を返すため ReturnType で受け取る
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // 広告イベントを監視し、読み込み完了で表示、閉じるかエラーで終了
    const unsubscribe = ad.addAdEventsListener(({ type, payload }) => {
      // すべてのイベントとペイロードを出力しておく
      adLog('Interstitial event', { type, payload });
      if (type === AdEventType.LOADED) {
        ad.show();
      }
      if (type === AdEventType.OPENED) {
        // 表示されたらフェイルセーフ用タイマーを解除
        if (timeoutId) clearTimeout(timeoutId);
      }
      if (type === AdEventType.CLOSED) {
        if (timeoutId) clearTimeout(timeoutId);
        unsubscribe();
        resolve(); // 正常終了
      }
      if (type === AdEventType.ERROR) {
        // エラーオブジェクトの内容もログに含める
        adLog('Interstitial error detail', payload);
        if (timeoutId) clearTimeout(timeoutId);
        unsubscribe();
        // 受け取ったエラーオブジェクトをそのまま返す
        reject(payload instanceof Error ? payload : new Error(String(payload)));
      }
    });

    // 読み込みに 10 秒以上かかった場合はあきらめて終了
    timeoutId = setTimeout(() => {
      // 読み込みが終わらなければタイムアウトエラーを返す
      unsubscribe();
      reject(new Error('timeout'));
    }, INTERSTITIAL_TIMEOUT_MS);

    ad.load();
  });
}

/**
 * 広告だけを事前に読み込む関数。成功時は InterstitialAd を返す
 */
export async function loadInterstitial(): Promise<InterstitialAd | null> {
  if (Platform.OS === 'web' || DISABLE_ADS || isAdsRemoved()) return Promise.resolve(null);
  const ad = InterstitialAd.createForAdRequest(AD_UNIT_ID);
  // 現在の広告ユニットを確認するためログ出力
  adLog('loadInterstitial start', { unitId: AD_UNIT_ID });
  return new Promise((resolve) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const unsubscribe = ad.addAdEventsListener(({ type, payload }) => {
      // 読み込み時のイベントも詳細に出力する
      adLog('Interstitial load', { type, payload });
      if (type === AdEventType.LOADED) {
        if (timeoutId) clearTimeout(timeoutId);
        unsubscribe();
        resolve(ad);
      }
      if (type === AdEventType.ERROR) {
        if (timeoutId) clearTimeout(timeoutId);
        // 発生したエラー詳細をログしておく
        adLog('loadInterstitial error', payload);
        unsubscribe();
        resolve(null);
      }
    });
    timeoutId = setTimeout(() => {
      unsubscribe();
      resolve(null);
    }, INTERSTITIAL_TIMEOUT_MS);
    ad.load();
  });
}

/**
 * 読み込み済み広告を表示する関数
 * 閉じられれば resolve、失敗時やタイムアウトでは reject します
 */
export async function showLoadedInterstitial(ad: InterstitialAd) {
  if (Platform.OS === 'web' || DISABLE_ADS || isAdsRemoved()) return Promise.resolve();
  // 呼び出しタイミングを把握するため出力しておく
  adLog('showLoadedInterstitial start');
  return new Promise<void>((resolve, reject) => {
    // エラー時に catch へ渡すため reject 可能にしておく
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const unsubscribe = ad.addAdEventsListener(({ type, payload }) => {
      // 表示時のイベントを全て記録する
      adLog('Interstitial show', { type, payload });
      if (type === AdEventType.OPENED) {
        if (timeoutId) clearTimeout(timeoutId);
      }
      if (type === AdEventType.CLOSED) {
        if (timeoutId) clearTimeout(timeoutId);
        unsubscribe();
        resolve(); // 表示後正常に閉じられた
      }
      if (type === AdEventType.ERROR) {
        // エラー詳細を記録
        adLog('showLoadedInterstitial error', payload);
        if (timeoutId) clearTimeout(timeoutId);
        unsubscribe();
        // エラーオブジェクトがあればそのまま返す
        reject(payload instanceof Error ? payload : new Error(String(payload)));
      }
    });
    timeoutId = setTimeout(() => {
      // 表示処理が長引いたときはタイムアウトエラーを返す
      unsubscribe();
      reject(new Error('timeout'));
    }, INTERSTITIAL_TIMEOUT_MS);
    ad.show();
  });
}
