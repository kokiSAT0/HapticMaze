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
  const finishedTxIdsRef = useRef<Set<string>>(new Set());
  // expo-iap が提供する useIAP で購入処理を監視
  const {
    connected,
    connectAsync,
    disconnectAsync,
    currentPurchase,
    currentPurchaseError,
    products,
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
       console.log('[IAP] requested products');
     } catch (e) {
        console.warn('[IAP] requestProducts error', e);
      }
    })();
  }, [connected, requestProducts]);

  // IAP 接続後に購入履歴を取得しフラグを更新
  useEffect(() => {
    // ネイティブ環境かつ接続完了している、かつまだ未購入判定の場合のみ実行
    if (!isNative || !connected || adsRemoved) return;
    (async () => {
      try {
       await getAvailablePurchases();
       console.log('[IAP] requested available purchases');
     } catch (e) {
        console.warn('[IAP] getAvailablePurchases error', e);
      }
    })();
  }, [connected, adsRemoved, getAvailablePurchases]);

   // 取得できた products をログ確認（任意）
 useEffect(() => {
   if (!isNative) return;
  if (products?.length) {
    console.log('[IAP] products=', products.map(p => p.id));
  } else {
    console.log('[IAP] products is empty');
  }
 }, [products]);


  // 購入履歴に変更があったらフラグを更新
  useEffect(() => {
    if (!isNative) return;
     const bought = availablePurchases.some((p: any) =>
       p.productId === PRODUCT_ID || p.productIdentifier === PRODUCT_ID
     );
     console.log('[IAP] availablePurchases changed. bought =', bought);
    if (bought) {
      setAdsRemoved(true);
      AsyncStorage.setItem(STORAGE_KEY, "true").catch(() => { });
    }
  }, [availablePurchases]);

  // 新規購入が発生したときの処理
  useEffect(() => {
    if (!isNative || !currentPurchase) return;
     console.log('[IAP] currentPurchase arrived', {
   productId: (currentPurchase as any).productId ?? (currentPurchase as any).productIdentifier,
   transactionId: (currentPurchase as any).transactionId,
 });
{
       console.log('[IAP] currentPurchase =', currentPurchase);

   // 二重finish防止（StoreKitは同じTxに2回finish投げると失敗しがち）
   const txId = String((currentPurchase as any).transactionId ?? '');
   if (txId && finishedTxIdsRef.current.has(txId)) {
     console.log('[IAP] skip finishTransaction (already finished):', txId);
     return;
   }
      (async () => {
        try {
          // 購入が完了したらトランザクションを終了
          console.log('[IAP] finishTransaction start');
          await finishTransaction({ purchase: currentPurchase, isConsumable: false });
          console.log('[IAP] finishTransaction done');
          // 正常終了したらフラグを更新
          setAdsRemoved(true);
          await AsyncStorage.setItem(STORAGE_KEY, "true").catch(() => { });
                 // ここが重要：ストアの状態を取り直してUI側も同期
       try {
          const _ = await getAvailablePurchases(); // 返り値が無くてもOK。state更新待ち。
          console.log('[IAP] called getAvailablePurchases after finish');
       } catch (e) {
         console.warn('[IAP] getAvailablePurchases error after finish', e);
       }
       if (txId) finishedTxIdsRef.current.add(txId);
          // 購入待ち Promise があれば解決
          purchaseResolver.current?.resolve();
        } catch (e) {
          console.warn('[IAP] finishTransaction error:', e);
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
    console.warn('[IAP] purchase error', currentPurchaseError);
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

  console.log('[IAP] requestPurchase sku=', PRODUCT_ID);
  await requestPurchase({
    request: {
      ios: { sku: PRODUCT_ID },        // ← iOS は単一 sku
      android: { skus: [PRODUCT_ID] }, // ← Android は配列
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
    await getAvailablePurchases();
    const bought = [...availablePurchases].some((p: any) =>
      p.productId === PRODUCT_ID || p.productIdentifier === PRODUCT_ID
    );
    if (bought) {
      // 即座に反映できるようフラグも更新
      setAdsRemoved(true);
      await AsyncStorage.setItem(STORAGE_KEY, "true").catch(() => { });
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