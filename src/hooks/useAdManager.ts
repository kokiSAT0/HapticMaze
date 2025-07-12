import { useRef, useState, useCallback } from 'react';
import type { InterstitialAd } from 'react-native-google-mobile-ads';
import { useStageEffects } from '@/src/hooks/useStageEffects';
import { useLocale } from '@/src/locale/LocaleContext';
import { useResultState } from '@/src/hooks/useResultState';

interface Options {
  stage: number;
  finalStage: boolean;
  levelId?: string | null;
  pauseBgm: () => void;
  resumeBgm: () => void;
}

/**
 * インタースティシャル広告の管理を行うフック。
 * 読み込みと表示、OK ボタンラベル制御をまとめています。
 */
export function useAdManager({ stage, finalStage, levelId, pauseBgm, resumeBgm }: Options) {
  const { t } = useLocale();
  const { loadAdIfNeeded, showAd } = useStageEffects({ pauseBgm, resumeBgm, levelId: levelId ?? undefined });

  const loadedAdRef = useRef<InterstitialAd | null>(null);
  const { okLocked, setOkLocked } = useResultState();
  const [okLabel, setOkLabel] = useState(t('ok'));
  const okLockedRef = useRef(false);

  /** ステージクリア時に広告を読み込む */
  const preloadAd = useCallback(() => {
    okLockedRef.current = true;
    setOkLocked(true);
    setOkLabel(t('loadingAd'));
    loadAdIfNeeded(stage).then((ad) => {
      loadedAdRef.current = ad;
      if (finalStage) {
        setOkLabel(t('goGameResult'));
      } else {
        setOkLabel(ad ? t('showAd') : t('nextStage'));
      }
      okLockedRef.current = false;
      setOkLocked(false);
    });
  }, [loadAdIfNeeded, stage, finalStage, t, setOkLocked]);

  /** 広告を表示し、表示されたらラベルを更新 */
  const showLoadedAd = useCallback(async () => {
    const shown = await showAd(loadedAdRef.current);
    loadedAdRef.current = null;
    if (shown) setOkLabel(t('nextStage'));
    return shown;
  }, [showAd, t]);

  /** ラベルとロックを初期状態へ戻す */
  const resetLabel = useCallback(() => {
    setOkLabel(t('ok'));
    okLockedRef.current = false;
    setOkLocked(false);
  }, [t, setOkLocked]);

  return {
    okLabel,
    okLocked,
    okLockedRef,
    preloadAd,
    showLoadedAd,
    resetLabel,
  } as const;
}
