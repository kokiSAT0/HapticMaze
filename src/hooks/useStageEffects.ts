import {
  loadInterstitial,
  showLoadedInterstitial,
  type InterstitialAd,
  DISABLE_ADS,
} from "@/src/ads/interstitial";
import { useCallback } from "react";
import { useHandleError } from "@/src/utils/handleError";

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
  // 広告読み込み処理をメモ化
  const loadAdIfNeeded = useCallback(
    async (stage: number): Promise<InterstitialAd | null> => {
      // 広告を出す条件:
      // チュートリアルでは5の倍数、その他では6の倍数ステージのクリア時
      const shouldShow =
        levelId === 'tutorial' ? stage % 5 === 0 : stage % 6 === 0;
      console.log("loadAdIfNeeded", { stage, shouldShow });
      if (!shouldShow || DISABLE_ADS) return null;
      return loadInterstitial();
    },
    [levelId],
  );

  // 広告表示処理をメモ化。BGM 制御や通知を依存として指定
  const showAd = useCallback(
    async (ad: InterstitialAd | null): Promise<boolean> => {
      if (!ad || DISABLE_ADS) return false;
      try {
        pauseBgm();
        await showLoadedInterstitial(ad);
      } catch (e) {
        handleError("広告を表示できませんでした", e);
      } finally {
        resumeBgm();
      }
      return true;
    },
    [pauseBgm, resumeBgm, handleError],
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
