import {
  loadInterstitial,
  showLoadedInterstitial,
  type InterstitialAd,
  DISABLE_ADS,
} from "@/src/ads/interstitial";
import { useCallback } from "react";

interface Options {
  pauseBgm: () => void;
  resumeBgm: () => void;
  showSnackbar: (msg: string) => void;
}

/**
 * ステージ間で行う広告表示や BGM 停止をまとめたフック。
 * 副作用が多くなる処理を切り出して使いやすくします。
 */
export function useStageEffects({
  pauseBgm,
  resumeBgm,
  showSnackbar,
}: Options) {
  /**
   * ステージ番号に応じて広告を表示する
   * 9 の倍数または 1 ステージ目で実行
   */
  const shouldShowAd = (stage: number) => stage % 9 === 0 || stage === 1;

  // 広告読み込み処理をメモ化
  const loadAdIfNeeded = useCallback(
    async (stage: number): Promise<InterstitialAd | null> => {
      const shouldShow = shouldShowAd(stage);
      console.log("loadAdIfNeeded", { stage, shouldShow });
      if (!shouldShow || DISABLE_ADS) return null;
      return loadInterstitial();
    },
    [],
  );

  // 広告表示処理をメモ化。BGM 制御や通知を依存として指定
  const showAd = useCallback(
    async (ad: InterstitialAd | null): Promise<boolean> => {
      if (!ad || DISABLE_ADS) return false;
      try {
        pauseBgm();
        await showLoadedInterstitial(ad);
      } catch (e) {
        console.error("interstitial error", e);
        showSnackbar("広告を表示できませんでした");
      } finally {
        resumeBgm();
      }
      return true;
    },
    [pauseBgm, resumeBgm, showSnackbar],
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
