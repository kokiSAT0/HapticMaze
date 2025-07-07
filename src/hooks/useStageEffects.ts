import {
  loadInterstitial,
  showLoadedInterstitial,
  type InterstitialAd,
} from "@/src/ads/interstitial";

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

  const loadAdIfNeeded = async (
    stage: number,
  ): Promise<InterstitialAd | null> => {
    const shouldShow = shouldShowAd(stage);
    console.log("loadAdIfNeeded", { stage, shouldShow });
    if (!shouldShow) return null;
    return loadInterstitial();
  };

  const showAd = async (ad: InterstitialAd | null): Promise<boolean> => {
    if (!ad) return false;
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
  };

  const showAdIfNeeded = async (stage: number): Promise<boolean> => {
    const ad = await loadAdIfNeeded(stage);
    return showAd(ad);
  };

  return { loadAdIfNeeded, showAd, showAdIfNeeded } as const;
}
