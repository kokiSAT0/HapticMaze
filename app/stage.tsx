import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { StageBanner } from '@/components/StageBanner';
import { usePlayLogic } from '@/src/hooks/usePlayLogic';

export default function StageScreen() {
  const { stage } = useLocalSearchParams<{ stage?: string }>();
  const router = useRouter();
  const { handleBannerFinish, handleBannerDismiss } = usePlayLogic();
  const stageNum = Number(stage) || 1;

  return (
    <StageBanner
      visible
      stage={stageNum}
      onFinish={() => {
        handleBannerFinish();
        handleBannerDismiss();
        router.replace('/play');
      }}
    />
  );
}
