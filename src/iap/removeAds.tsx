import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIAP } from "expo-iap";
import { getAvailablePurchases as getAvailablePurchasesCore } from 'expo-iap';

// ネイティブ環境 (iOS/Android) かどうかを判定
const isNative = Platform.OS === "ios" || Platform.OS === "android";

// 購入状態保存用キー
const STORAGE_KEY = "adsRemoved";
// App Store Connect / Google Play に登録した商品ID
const PRODUCT_ID = "adstest";

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
  // 復元処理の結果を boolean で返すように変更
  restore: () => Promise<boolean>;
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
    currentPurchaseError,
    availablePurchases,
    getAvailablePurchases,
    requestProducts,
    requestPurchase,
    finishTransaction,
  } = useIAP({ autoFinishTransactions: false });

  const [adsRemoved, setAdsRemoved] = useState(false);
  // 購入処理の完了を待ち受ける Promise の resolver を保持
  const purchaseResolver = useRef<
    | { resolve: () => void; reject: (e: Error) => void }
    | null
  >(null);

  // アプリ起動直後にストレージから購入済みフラグを読み込む
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === "true") {
          setAdsRemoved(true);
        }
      } catch {
        // 読み込み失敗時もエラーにはしない
      }
    })();
  }, []);

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

  // IAP 接続後に購入履歴を取得しフラグを更新
  useEffect(() => {
    // ネイティブ環境かつ接続完了している、かつまだ未購入判定の場合のみ実行
    if (!isNative || !connected || adsRemoved) return;
    (async () => {
      try {
        // ストアから購入履歴を取得して購入済みか確認する
        await getAvailablePurchases();
      } catch {
        // 失敗してもエラーにはしない
      }
    })();
  }, [connected, adsRemoved, getAvailablePurchases]);

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
          await finishTransaction({ purchase: currentPurchase, isConsumable: false });
          // 正常終了したらフラグを更新
          setAdsRemoved(true);
          await AsyncStorage.setItem(STORAGE_KEY, "true").catch(() => {});
          // 購入待ち Promise があれば解決
          purchaseResolver.current?.resolve();
        } catch (e) {
          // エラー時は Promise を reject
          purchaseResolver.current?.reject(e as Error);
        } finally {
          purchaseResolver.current = null;
        }
      })();
    }
  }, [currentPurchase, finishTransaction]);

  // 購入フロー中にエラーが発生した場合の処理
  useEffect(() => {
    if (!currentPurchaseError) return;
    // Promise が待機中なら reject してクリア
    if (purchaseResolver.current) {
      purchaseResolver.current.reject(
        new Error(currentPurchaseError.message)
      );
      purchaseResolver.current = null;
    }
  }, [currentPurchaseError]);

  // フラグが変わったら外部参照用変数へ反映
  useEffect(() => {
    adsRemovedFlag = adsRemoved;
  }, [adsRemoved]);

  /**
   * 広告削除を購入する
   * 接続前に実行すると失敗するため connected を確認する
   */
  const purchase = async () => {
    // 接続できていなければ購入処理を開始できないためエラーを投げる
    if (!isNative || !connected) {
      throw new Error("IAP not connected");
    }

    await requestPurchase({
      request: {
        ios: { sku: PRODUCT_ID },
        android: { skus: [PRODUCT_ID] },
      },
    });

    // ストアでの購入処理が完了するまで待ち受ける
    return new Promise<void>((resolve, reject) => {
      purchaseResolver.current = { resolve, reject };
    });
  };

  /**
   * 購入履歴を復元する
   * 購入が見つかったか boolean で返す
   */
  const restore = async (): Promise<boolean> => {
    if (!isNative) {
      // Web 環境ではストレージ上のフラグのみ返す
      return adsRemovedFlag;
    }
    // 接続されていない場合は復元処理ができないためエラー
    if (!connected) {
      throw new Error('IAP not connected');
    }

    // 購入履歴取得用の配列を初期化
    // API の戻り値はプラットフォームごとに型が異なるため any 配列で受け取る
    // コアAPIは Purchase[] を返します
    const purchases = await getAvailablePurchasesCore();

    const bought = (purchases ?? []).some((p) => p.productId === PRODUCT_ID);
    if (bought) {
      // 即座に反映できるようフラグも更新
      setAdsRemoved(true);
      await AsyncStorage.setItem(STORAGE_KEY, "true").catch(() => {});
    }
    return bought;
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
