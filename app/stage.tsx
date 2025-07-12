import React, { useCallback, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { StageBanner } from '@/components/StageBanner';
import { useResultState } from '@/src/hooks/useResultState';

export default function StageScreen() {
  const { stage } = useLocalSearchParams<{ stage?: string }>();
  const router = useRouter();
  const { showBanner, setShowBanner, setBannerStage, setOkLocked } = useResultState();
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
    setShowBanner(false);
    setBannerStage(0);
    setOkLocked(false);

  }, [setShowBanner, setBannerStage, setOkLocked]);

  // バナー非表示になった後で画面遷移する
  useEffect(() => {
    if (!showBanner && finishedRef.current) {
      router.replace('/play');
    }
  }, [showBanner, router]);


  return (
    <StageBanner
      visible={showBanner}
      stage={stageNum}
      onFinish={handleFinish}
    />
  );
}
