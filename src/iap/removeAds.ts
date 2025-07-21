import * as IAP from 'expo-in-app-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 永続化に利用するキー名
const STORAGE_KEY = 'adsRemoved';
// App Store Connect で登録した商品ID
const PRODUCT_ID = 'remove_ads';

// 購入済みかを保持するフラグ
let adsRemoved = false;
// IAP 接続状態を示すフラグ
let connected = false;

/** 現在の購入状態を返す */
export function isAdsRemoved() {
  return adsRemoved;
}

// ストアへ接続する共通処理
async function ensureConnection() {
  if (!connected) {
    await IAP.connectAsync();
    connected = true;
  }
}

/** 購入情報の初期化と履歴確認 */
export async function init() {
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
  await ensureConnection();
  await IAP.getProductsAsync([PRODUCT_ID]);
  await IAP.purchaseItemAsync(PRODUCT_ID);
  adsRemoved = true;
  await AsyncStorage.setItem(STORAGE_KEY, 'true');
}

/** 購入済みか履歴を確認し、フラグを復元する */
export async function restore() {
  await ensureConnection();
  const { results } = await IAP.getPurchaseHistoryAsync();
  const bought = results?.some((r) => r.productId === PRODUCT_ID);
  if (bought) {
    adsRemoved = true;
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
  }
}
