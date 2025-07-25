import {
  loadInterstitial,
  showLoadedInterstitial,
  type InterstitialAd,
  DISABLE_ADS,
} from "@/src/ads/interstitial";
// 広告削除課金済みかどうかを参照
import { useRemoveAds } from "@/src/iap/removeAds";
import { useCallback } from "react";
import { useHandleError } from "@/src/utils/handleError";
import { useLocale } from "@/src/locale/LocaleContext";
import { devLog } from "@/src/utils/logger";

interface Options {
  pauseBgm: () => void;
  resumeBgm: () => void;
  /** レベル識別子。'tutorial' のときチュートリアル扱い */
  levelId?: string;
}

/**
 * ステージ間で行う広告表示や BGM 停止をまとめたフック。
 * 副作用が多くなる処理を切り出して使いやすくします。
 */
export function useStageEffects({ pauseBgm, resumeBgm, levelId }: Options) {
  const handleError = useHandleError();
  // 国際化されたメッセージを取得する関数
  const { t } = useLocale();
  // 購入状態を Context から取得
  const { adsRemoved } = useRemoveAds();
  // 広告読み込み処理をメモ化
  const loadAdIfNeeded = useCallback(
    async (stage: number): Promise<InterstitialAd | null> => {
      // 広告を出す条件:
      // チュートリアルでは10の倍数、その他では6の倍数ステージのクリア時
      // "% 10" は「10で割った余り」を計算する演算子(mod演算)です
      // 余りが0のとき「10の倍数」と判定できます
      const shouldShow =
        levelId === 'tutorial' ? stage % 10 === 0 : stage % 6 === 0;
      devLog("loadAdIfNeeded", { stage, shouldShow });
      if (!shouldShow || DISABLE_ADS || adsRemoved) return null;
      return loadInterstitial();
    },
    [levelId, adsRemoved],
  );

  // 広告表示処理をメモ化。BGM 制御や通知を依存として指定
  const showAd = useCallback(
    async (ad: InterstitialAd | null): Promise<boolean> => {
      if (!ad || DISABLE_ADS || adsRemoved) return false;
      try {
        pauseBgm();
        await showLoadedInterstitial(ad);
      } catch (e) {
        // showLoadedInterstitial で reject された場合はここに到達する
        // ユーザーへエラーメッセージを表示できることを確認済み
        handleError(t('adDisplayFailure'), e);
      } finally {
        resumeBgm();
      }
      return true;
    },
    [pauseBgm, resumeBgm, handleError, t, adsRemoved],
  );

  // 読み込みと表示をまとめた処理もメモ化
  const showAdIfNeeded = useCallback(
    async (stage: number): Promise<boolean> => {
      const ad = await loadAdIfNeeded(stage);
      return showAd(ad);
    },
    [loadAdIfNeeded, showAd],
  );

  return { loadAdIfNeeded, showAd, showAdIfNeeded } as const;
}
