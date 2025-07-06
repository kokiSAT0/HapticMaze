import { showInterstitial } from '@/src/ads/interstitial';

interface Options {
  pauseBgm: () => void;
  resumeBgm: () => void;
  showSnackbar: (msg: string) => void;
}

/**
 * ステージ間で行う広告表示や BGM 停止をまとめたフック。
 * 副作用が多くなる処理を切り出して使いやすくします。
 */
export function useStageEffects({ pauseBgm, resumeBgm, showSnackbar }: Options) {
  /**
   * ステージ番号に応じて広告を表示する
   * 9 の倍数または 1 ステージ目で実行
   */
  const showAdIfNeeded = async (stage: number): Promise<boolean> => {
    // 実行条件となるステージかどうか計算しておく
    const shouldShow = stage % 9 === 0 || stage === 1;
    console.log('showAdIfNeeded check', { stage, shouldShow });
    if (shouldShow) {
      try {
        console.log('interstitial start');
        pauseBgm();
        await showInterstitial();
        console.log('interstitial end');
      } catch (e) {
        console.error('interstitial error', e);
        showSnackbar('広告を表示できませんでした');
      } finally {
        resumeBgm();
      }
      return true;
    }
    return false;
  };

  return { showAdIfNeeded } as const;
}
