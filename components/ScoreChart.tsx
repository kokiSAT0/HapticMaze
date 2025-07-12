import React from 'react';
import Svg, { Polyline } from 'react-native-svg';
import { UI } from '@/constants/ui';

/**
 * 折れ線グラフを描画するシンプルなコンポーネント
 * data 配列の長さに合わせて自動的に点を配置する
 */
export interface ScoreChartProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  /** 画面読み上げ用のラベル */
  accessibilityLabel?: string;
}

export function ScoreChart({
  data,
  color,
  width = UI.resultModalWidth,
  height = UI.miniMapSize / 3,
  accessibilityLabel,
}: ScoreChartProps) {
  // 最大値が 0 だと計算できないので 1 を下限とする
  const max = Math.max(...data, 1);
  const stepX = data.length > 1 ? width / (data.length - 1) : 0;

  // SVG Polyline 用の文字列 "x,y x,y ..." を作成
  const points = data
    .map((v, i) => {
      const x = i * stepX;
      const y = height - (v / max) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Svg
      width={width}
      height={height}
      accessibilityLabel={accessibilityLabel}
    >
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}
