import React from 'react';
import { Platform } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { playStyles } from '@/src/styles/playStyles';
import { logError } from '@/src/utils/errorLogger';

// LinearGradient を Reanimated 用にラップする
const AnimatedLG =
  Platform.OS === 'web'
    ? LinearGradient
    : Animated.createAnimatedComponent(LinearGradient);

interface EdgeOverlayProps {
  /** 枠線の色 */
  borderColor: string;
  /** アニメーションさせる枠線の幅 */
  borderW: SharedValue<number>;
  /** 最大幅 (アニメーション停止位置) */
  maxBorder: number;
}

/**
 * 画面四辺に表示するグラデーション枠線コンポーネント
 */
export function EdgeOverlay({ borderColor, borderW, maxBorder }: EdgeOverlayProps) {
  // 縦方向エッジの高さ、横方向エッジの幅をそれぞれアニメーションさせる
  const vertStyle = useAnimatedStyle(() => ({ height: borderW.value }));
  const horizStyle = useAnimatedStyle(() => ({ width: borderW.value }));

  // 枠線の色配列。中央に向かうほど透明に近づける
  const gradColors: [string, string, string] = [borderColor, borderColor, 'transparent'];
  const gradStops = useDerivedValue<[number, number, number]>(() => {
    try {
      // ratio が NaN や Infinity になる可能性を考慮
      const rawRatio = borderW.value / maxBorder;
      let ratio = Number.isFinite(rawRatio) ? rawRatio : 0;
      // 0〜1 の範囲に収める
      ratio = Math.min(Math.max(ratio, 0), 1);

      let loc = 0.2 + ratio * 0.5;
      // 非数の場合は中央寄りで固定
      if (!Number.isFinite(loc)) loc = 0.5;

      return [0, loc, 1];
    } catch (e) {
      runOnJS(logError)('Worklet error', e);
      return [0, 0.5, 1];
    }
  });
  const gradProps = useAnimatedProps(() => {
    try {
      return { locations: gradStops.value };
    } catch (e) {
      runOnJS(logError)('Worklet error', e);
      return { locations: [0, 0.5, 1] };
    }
  });
  const gradLocs = Platform.OS === 'web' ? [0, 0.2, 1] : undefined;

  return (
    <>
      <AnimatedLG
        pointerEvents="none"
        colors={gradColors}
        {...(Platform.OS === 'web'
          ? { locations: gradLocs }
          : { animatedProps: gradProps })}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[playStyles.edge, playStyles.topEdge, vertStyle]}
      />
      <AnimatedLG
        pointerEvents="none"
        colors={gradColors}
        {...(Platform.OS === 'web'
          ? { locations: gradLocs }
          : { animatedProps: gradProps })}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={[playStyles.edge, playStyles.bottomEdge, vertStyle]}
      />
      <AnimatedLG
        pointerEvents="none"
        colors={gradColors}
        {...(Platform.OS === 'web'
          ? { locations: gradLocs }
          : { animatedProps: gradProps })}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[playStyles.edge, playStyles.leftEdge, horizStyle]}
      />
      <AnimatedLG
        pointerEvents="none"
        colors={gradColors}
        {...(Platform.OS === 'web'
          ? { locations: gradLocs }
          : { animatedProps: gradProps })}
        start={{ x: 1, y: 0.5 }}
        end={{ x: 0, y: 0.5 }}
        style={[playStyles.edge, playStyles.rightEdge, horizStyle]}
      />
    </>
  );
}
