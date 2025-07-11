import React, { useCallback, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { StageBanner } from '@/components/StageBanner';
import { usePlayLogic } from '@/src/hooks/usePlayLogic';

export default function StageScreen() {
  const { stage } = useLocalSearchParams<{ stage?: string }>();
  const router = useRouter();
  const { handleBannerFinish, handleBannerDismiss } = usePlayLogic();
  const stageNum = Number(stage) || 1;

  // handleFinish が複数回呼ばれないようフラグを保持する
  // useRef を使うと値の変更で再レンダーが起こらない
  const finishedRef = useRef(false);

  // StageBanner に渡すコールバックは useCallback で固定する
  // これにより再レンダー時も参照が変わらず、
  // StageBanner の useEffect が無限ループするのを防ぐ
  const handleFinish = useCallback(() => {
    // 一度実行したら何もしない
    if (finishedRef.current) return;
    finishedRef.current = true;
    handleBannerFinish();
    handleBannerDismiss();
    // setState の反映を待ってから画面遷移する
    // 0ms だと更新が間に合わずループすることがあるため
    setTimeout(() => {
      router.replace('/play');
    }, 30);
  }, [handleBannerFinish, handleBannerDismiss, router]);

  return (
    <StageBanner
      visible
      stage={stageNum}
      onFinish={handleFinish}
    />
  );
}
