import React, { useCallback, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { StageBanner } from '@/components/StageBanner';
import { useResultState } from '@/src/hooks/useResultState';

export default function StageScreen() {
  const { stage } = useLocalSearchParams<{ stage?: string }>();
  const router = useRouter();
  const { setShowBanner, setBannerStage, setOkLocked } = useResultState();
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
    // 状態更新が完了する前に画面遷移すると
    // banner のフラグが戻らずループする場合がある
    // 少し待ってから Play 画面へ戻る
    setTimeout(() => {
      router.replace('/play');
    }, 50);
  }, [router, setShowBanner, setBannerStage, setOkLocked]);

  return (
    <StageBanner
      visible
      stage={stageNum}
      onFinish={handleFinish}
    />
  );
}
