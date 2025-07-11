import React, { useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { StageBanner } from '@/components/StageBanner';
import { usePlayLogic } from '@/src/hooks/usePlayLogic';

export default function StageScreen() {
  const { stage } = useLocalSearchParams<{ stage?: string }>();
  const router = useRouter();
  const { handleBannerFinish, handleBannerDismiss } = usePlayLogic();
  const stageNum = Number(stage) || 1;

  // StageBanner に渡すコールバックは useCallback で固定する
  // これにより再レンダー時も参照が変わらず、
  // StageBanner の useEffect が無限ループするのを防ぐ
  const handleFinish = useCallback(() => {
    handleBannerFinish();
    handleBannerDismiss();
    // 状態更新が反映される前に遷移すると再度バナーが表示されてしまうため
    // わずかに遅らせてから Play 画面へ戻る
    setTimeout(() => {
      router.replace('/play');
    }, 0);
  }, [handleBannerFinish, handleBannerDismiss, router]);

  return (
    <StageBanner
      visible
      stage={stageNum}
      onFinish={handleFinish}
    />
  );
}
