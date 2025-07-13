import React from 'react';
// 目盛りや軸を描くために Line と Text を追加
import Svg, { Polyline, Line, Text } from 'react-native-svg';
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
  /** ステップ数グラフなど中間値の目盛りを表示するか */
  showMidTick?: boolean;
  /** 画面読み上げ用のラベル */
  accessibilityLabel?: string;
}

export function ScoreChart({
  data,
  color,
  width = UI.resultModalWidth,
  height = UI.miniMapSize / 3,
  showMidTick = false,
  accessibilityLabel,
}: ScoreChartProps) {
  // グラフ領域以外に目盛り用の余白を確保
  const marginLeft = 30;
  // 右端のラベルが切れないように余白を追加
  const marginRight = 10;
  // 縦軸のラベルが上で見切れないように上側にも余白を追加
  const marginTop = 10;
  // 縦軸の目盛りと数字を置くための下側余白
  // 値を大きくするとグラフ下部の文字が見切れにくくなる
  const marginBottom = 30;
  const chartWidth = width - marginLeft - marginRight;
  const chartHeight = height;
  const svgWidth = width;
  const svgHeight = chartHeight + marginBottom + marginTop;

  // 最大値が 0 だと計算できないので 1 を下限とする
  const max = Math.max(...data, 1);

  // 折れ線用の X 方向の間隔
  const stepGraphX = data.length > 1 ? chartWidth / (data.length - 1) : 0;
  // 目盛り表示用の X 方向の間隔
  const stepAxisX = data.length > 0 ? chartWidth / data.length : 0;

  // 折れ線グラフの座標を作成
  const points = data
    .map((v, i) => {
      const x = marginLeft + i * stepGraphX;
      // 実際の値を最大値で割って 0〜1 に正規化し、1 を超えたら 1 に丸める
      const rate = Math.min(v / max, 1);
      const y = marginTop + chartHeight - rate * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  // 横軸目盛り値 (5 等分)
  const xTicks = Array.from({ length: 5 }, (_, i) =>
    Math.round(((i + 1) * data.length) / 5),
  );
  // 縦軸目盛り値 (2 等分)
  // showMidTick が true のときだけ中間値の目盛りを入れる
  const yTicks = showMidTick ? [Math.round(max / 2), max] : [max];

  return (
    <Svg
      width={svgWidth}
      height={svgHeight}
      accessibilityLabel={accessibilityLabel}
    >
      {/* 軸の描画 */}
      <Line
        x1={marginLeft}
        y1={marginTop + chartHeight}
        x2={marginLeft + chartWidth}
        y2={marginTop + chartHeight}
        stroke={color}
        strokeWidth={1}
      />
      <Line
        x1={marginLeft}
        y1={marginTop}
        x2={marginLeft}
        y2={marginTop + chartHeight}
        stroke={color}
        strokeWidth={1}
      />

      {/* X 軸目盛りとラベル */}
      {xTicks.map((v) => {
        const x = marginLeft + stepAxisX * v;
        return (
          <React.Fragment key={`x${v}`}>
            <Line
              x1={x}
              y1={marginTop + chartHeight}
              x2={x}
              y2={marginTop + chartHeight + 4}
              stroke={color}
              strokeWidth={1}
            />
            <Text
              x={x}
              // X軸のラベルが下部に貼り付かないよう余白分だけ下げる
              y={marginTop + chartHeight + 25}
              fill={color}
              fontSize={10}
              textAnchor="middle"
            >
              {v}
            </Text>
          </React.Fragment>
        );
      })}

      {/* Y 軸目盛りとラベル */}
      {yTicks.map((v) => {
        const y = marginTop + chartHeight - (v / max) * chartHeight;
        return (
          <React.Fragment key={`y${v}`}>
            <Line
              x1={marginLeft - 4}
              y1={y}
              x2={marginLeft}
              y2={y}
              stroke={color}
              strokeWidth={1}
            />
            <Text
              x={marginLeft - 6}
              y={y + 4}
              fill={color}
              fontSize={10}
              textAnchor="end"
            >
              {Math.round(v)}
            </Text>
          </React.Fragment>
        );
      })}

      {/* 折れ線グラフ本体 */}
      <Polyline points={points} fill="none" stroke={color} strokeWidth={2} />
    </Svg>
  );
}
