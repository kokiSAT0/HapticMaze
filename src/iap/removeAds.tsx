import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIAP } from "expo-iap";

// ネイティブ環境 (iOS/Android) かどうかを判定
const isNative = Platform.OS === "ios" || Platform.OS === "android";

// 購入状態保存用キー
const STORAGE_KEY = "adsRemoved";
// App Store Connect / Google Play に登録した商品ID
const PRODUCT_ID = "remove_ads";

// React コンポーネント外から参照できるように保持するフラグ
let adsRemovedFlag = false;

/** 現在の購入状態を返す */
export function isAdsRemoved() {
  return adsRemovedFlag;
}

// Context が保持する値の型定義
interface RemoveAdsValue {
  adsRemoved: boolean;
  purchase: () => Promise<void>;
  restore: () => Promise<void>;
}

const RemoveAdsContext = createContext<RemoveAdsValue | undefined>(undefined);

/**
 * useIAP フックを利用して広告削除課金の状態を管理する Provider
 */
export function RemoveAdsProvider({ children }: { children: ReactNode }) {
  // expo-iap が提供する useIAP で購入処理を監視
  const {
    connected,
    currentPurchase,
    availablePurchases,
    getAvailablePurchases,
    requestProducts,
    requestPurchase,
    finishTransaction,
  } = useIAP({ autoFinishTransactions: false });

  const [adsRemoved, setAdsRemoved] = useState(false);

  // 接続されたら商品情報を取得
  useEffect(() => {
    if (!isNative || !connected) return;
    (async () => {
      try {
        await requestProducts({ skus: [PRODUCT_ID], type: "inapp" });
      } catch {
        // エラーは無視して UI を維持する
      }
    })();
  }, [connected, requestProducts]);

  // 初回接続後に保存済みフラグを確認し、未保存なら購入履歴を取得
  useEffect(() => {
    if (!isNative || !connected) return;
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored === "true") {
        setAdsRemoved(true);
      } else {
        // 購入履歴を取得してフラグを更新する
        await getAvailablePurchases();
      }
    })();
  }, [connected, getAvailablePurchases]);

  // 購入履歴に変更があったらフラグを更新
  useEffect(() => {
    if (!isNative) return;
    const bought = availablePurchases.some((p) => p.productId === PRODUCT_ID);
    if (bought) {
      setAdsRemoved(true);
      AsyncStorage.setItem(STORAGE_KEY, "true").catch(() => {});
    }
  }, [availablePurchases]);

  // 新規購入が発生したときの処理
  useEffect(() => {
    if (!isNative || !currentPurchase) return;
    if (currentPurchase.productId === PRODUCT_ID) {
      (async () => {
        try {
          // 購入が完了したらトランザクションを終了
          await finishTransaction({ purchase: currentPurchase });
        } catch {
          // 失敗してもエラーにはしない
        }
        setAdsRemoved(true);
        await AsyncStorage.setItem(STORAGE_KEY, "true").catch(() => {});
      })();
    }
  }, [currentPurchase, finishTransaction]);

  // フラグが変わったら外部参照用変数へ反映
  useEffect(() => {
    adsRemovedFlag = adsRemoved;
  }, [adsRemoved]);

  /** 広告削除を購入する */
  const purchase = async () => {
    if (!isNative) return;
    await requestPurchase({
      request: {
        ios: { sku: PRODUCT_ID },
        android: { skus: [PRODUCT_ID] },
      },
    });
  };

  /** 購入履歴を復元する */
  const restore = async () => {
    if (!isNative) return;
    await getAvailablePurchases();
  };

  return (
    <RemoveAdsContext.Provider value={{ adsRemoved, purchase, restore }}>
      {children}
    </RemoveAdsContext.Provider>
  );
}

/** Context から広告削除状態を取得するフック */
export function useRemoveAds(): RemoveAdsValue {
  const ctx = useContext(RemoveAdsContext);
  if (!ctx)
    throw new Error("useRemoveAds は RemoveAdsProvider 内で利用してください");
  return ctx;
}
