import { useEffect, useRef, useCallback } from 'react';
import { useResultState } from '@/src/hooks/useResultState';

interface Options {
  stage: number;
  steps: number;
  totalSteps: number;
}

/**
 * ステージバナー表示と記録リセットを管理するフック。
 * ゲーム開始直後のバナー表示やバナー終了処理を担当します。
 */
export function useBannerControl({ stage, steps, totalSteps }: Options) {
  const {
    showBanner,
    setShowBanner,
    bannerStage,
    setBannerStage,
    bannerShown,
    setBannerShown,
  } = useResultState();

  // バナー表示中かどうかのフラグ
  const bannerActiveRef = useRef(false);

  // バナー非表示時はフラグも戻す
  useEffect(() => {
    if (!showBanner) bannerActiveRef.current = false;
  }, [showBanner]);

  // ステージ1開始時に一度だけバナーを出す
  useEffect(() => {
    if (
      stage === 1 &&
      steps === 0 &&
      !showBanner &&
      bannerStage === 0 &&
      !bannerShown
    ) {
      setBannerStage(1);
      setShowBanner(true);
      bannerActiveRef.current = true;
      setBannerShown(true);
    }
  }, [stage, steps, showBanner, bannerStage, bannerShown, setBannerStage, setShowBanner, setBannerShown]);


  /** バナーの終了処理 */
  const handleBannerFinish = useCallback(() => {
    setShowBanner(false);
    bannerActiveRef.current = false;
  }, [setShowBanner]);

  /** フェードアウト後に番号をリセット */
  const handleBannerDismiss = useCallback(() => {
    setBannerStage(0);
  }, [setBannerStage]);

  /** 次ステージ番号を設定してバナーを表示 */
  const startBanner = useCallback(
    (nextStage: number) => {
      setBannerStage(nextStage);
      setShowBanner(true);
      bannerActiveRef.current = true;
    },
    [setBannerStage, setShowBanner],
  );

  return {
    showBanner,
    bannerStage,
    bannerActiveRef,
    handleBannerFinish,
    handleBannerDismiss,
    startBanner,
  } as const;
}
