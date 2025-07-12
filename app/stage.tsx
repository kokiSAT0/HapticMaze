import React, { useCallback, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { StageBanner } from '@/components/StageBanner';
import { useResultState } from '@/src/hooks/useResultState';

export default function StageScreen() {
  const { stage } = useLocalSearchParams<{ stage?: string }>();
  const router = useRouter();
  // router オブジェクトは毎回新しくなる可能性があるため
  // useRef で保持しコールバックから参照する
  const routerRef = useRef(router);
  routerRef.current = router;
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
    // 状態更新が反映される前に遷移すると
    // バナーが再表示されてしまうことがある
    // 少し余裕を持って待機してから Play 画面へ戻す
    setTimeout(() => {
      // ref から router を参照して常に同じ関数を使う
      routerRef.current.replace('/play');
    }, 100);
  }, [setShowBanner, setBannerStage, setOkLocked]);


  return (
    <StageBanner
      visible
      stage={stageNum}
      onFinish={handleFinish}
    />
  );
}
