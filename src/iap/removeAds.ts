import type * as IAPType from 'expo-in-app-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Expo の IAP モジュールを動的に読み込むための変数
let IAP: IAPType | null = null;
// iOS/Android 以外では IAP を利用しない
const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

// 永続化に利用するキー名
const STORAGE_KEY = 'adsRemoved';
// App Store Connect で登録した商品ID
const PRODUCT_ID = 'remove_ads';

// 購入済みかを保持するフラグ
let adsRemoved = false;
// IAP 接続状態を示すフラグ
let connected = false;

// 必要なときにだけ IAP モジュールを読み込む
function ensureModule(): IAPType | null {
  if (!IAP && isNative) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    IAP = require('expo-in-app-purchases');
  }
  return IAP;
}

/** 現在の購入状態を返す */
export function isAdsRemoved() {
  return adsRemoved;
}

// ストアへ接続する共通処理
async function ensureConnection() {
  const mod = ensureModule();
  if (!mod) return; // Web 環境などでは何もしない
  if (!connected) {
    await mod.connectAsync();
    connected = true;
  }
}

/** 購入情報の初期化と履歴確認 */
export async function init() {
  // Web など非対応環境では処理をスキップ
  if (!ensureModule()) return;
  await ensureConnection();
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (stored === 'true') {
    adsRemoved = true;
    return;
  }
  await restore();
}

/** 広告削除を購入する */
export async function purchase() {
  const mod = ensureModule();
  if (!mod) return; // 非対応環境では何もしない
  await ensureConnection();
  await mod.getProductsAsync([PRODUCT_ID]);
  await mod.purchaseItemAsync(PRODUCT_ID);
  adsRemoved = true;
  await AsyncStorage.setItem(STORAGE_KEY, 'true');
}

/** 購入済みか履歴を確認し、フラグを復元する */
export async function restore() {
  const mod = ensureModule();
  if (!mod) return; // 非対応環境では処理なし
  await ensureConnection();
  try {
    // 購入履歴取得が失敗することがあるため例外を捕捉する
    const { results } = await mod.getPurchaseHistoryAsync();
    const bought = results?.some((r) => r.productId === PRODUCT_ID);
    if (bought) {
      adsRemoved = true;
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
    }
  } catch (e) {
    // ログインしていない場合など、取得失敗時は無視して続行する
    console.error('getPurchaseHistoryAsync failed:', e);
  }
}
