import React from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Line, Rect, Circle } from 'react-native-svg';

import type { MazeData, Vec2 } from '@/src/types/maze';

// MiniMapProps インターフェース
// ミニマップに必要な情報をまとめて渡す
export interface MiniMapProps {
  maze: MazeData; // 迷路の壁情報
  path: Vec2[]; // 通過したマスの履歴
  pos: Vec2; // 現在の位置
  flash?: number | import('react-native-reanimated').SharedValue<number>; // 外枠の太さ
  size?: number; // 表示サイズ (デフォルト80px)
  /**
   * デバッグ表示フラグ
   * true のとき壁とゴールを含む全情報を描画
   */
  showAll?: boolean;
  /** 衝突した壁 (縦方向) */
  hitV?: Set<string>;
  /** 衝突した壁 (横方向) */
  hitH?: Set<string>;
}

// MiniMap コンポーネント
// react-native-svg を使い迷路と軌跡を描画する
export function MiniMap({
  maze,
  path,
  pos,
  flash = 2,
  size = 80,
  showAll = false,
  hitV,
  hitH,
}: MiniMapProps) {
  const cell = size / maze.size; // 各マスの大きさ
  const style = useAnimatedStyle(() => ({
    borderWidth: typeof flash === 'number' ? flash : flash.value,
  }));

  // 壁の線をまとめて描画
  const renderWalls = () => {
    // デバッグオフなら壁を描かない
    if (!showAll) return null;
    const lines = [] as React.JSX.Element[];

    // 外周の壁
    lines.push(
      <Rect
        key="border"
        x={0}
        y={0}
        width={size}
        height={size}
        // 背景が黒でも見えるよう白色で枠線を描く
        stroke="white"
        strokeWidth={1}
        fill="none"
      />
    );

    // 縦壁
    for (const [x, y] of maze.v_walls) {
      const px = (x + 1) * cell;
      const py = y * cell;
      lines.push(
        <Line
          key={`v${x},${y}`}
          x1={px}
          y1={py}
          x2={px}
          y2={py + cell}
          // 縦壁も白で描画する
          stroke="white"
          strokeWidth={1}
        />
      );
    }

    // 横壁
    for (const [x, y] of maze.h_walls) {
      const px = x * cell;
      const py = (y + 1) * cell;
      lines.push(
        <Line
          key={`h${x},${y}`}
          x1={px}
          y1={py}
          x2={px + cell}
          y2={py}
          // 横壁も白で描画する
          stroke="white"
          strokeWidth={1}
        />
      );
    }

    return lines;
  };

  // 衝突した壁を黄色で描画
  const renderHitWalls = () => {
    const lines = [] as React.JSX.Element[];
    hitV?.forEach((k) => {
      const [x, y] = k.split(',').map(Number);
      lines.push(
        <Line
          key={`hv${k}`}
          x1={(x + 1) * cell}
          y1={y * cell}
          x2={(x + 1) * cell}
          y2={y * cell + cell}
          stroke="yellow"
          strokeWidth={2}
        />
      );
    });
    hitH?.forEach((k) => {
      const [x, y] = k.split(',').map(Number);
      lines.push(
        <Line
          key={`hh${k}`}
          x1={x * cell}
          y1={(y + 1) * cell}
          x2={x * cell + cell}
          y2={(y + 1) * cell}
          stroke="yellow"
          strokeWidth={2}
        />
      );
    });
    return lines;
  };

  // プレイヤーの通過軌跡を線で描く
  const renderPath = () => {
    if (path.length < 2) return null;
    const segments = [] as React.JSX.Element[];
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];
      segments.push(
        <Line
          key={`p${i}`}
          x1={(a.x + 0.5) * cell}
          y1={(a.y + 0.5) * cell}
          x2={(b.x + 0.5) * cell}
          y2={(b.y + 0.5) * cell}
          stroke="red"
          strokeWidth={2}
        />
      );
    }
    return segments;
  };

  return (
    <Animated.View style={[{ width: size, height: size, borderColor: 'orange' }, style]}>
      <Svg width={size} height={size}>
        {renderWalls()}
        {renderHitWalls()}
        {renderPath()}
        {/* スタート位置を緑色で表示 */}
        <Rect
          x={(maze.start[0] + 0.25) * cell}
          y={(maze.start[1] + 0.25) * cell}
          width={cell * 0.5}
          height={cell * 0.5}
          fill="green"
        />
        {showAll && (
          // ゴール位置はデバッグ時のみ表示
          <Rect
            x={(maze.goal[0] + 0.25) * cell}
            y={(maze.goal[1] + 0.25) * cell}
            width={cell * 0.5}
            height={cell * 0.5}
            fill="red"
          />
        )}
        {/* 現在位置を円で表示 */}
        <Circle
          cx={(pos.x + 0.5) * cell}
          cy={(pos.y + 0.5) * cell}
          r={cell * 0.3}
          fill="blue"
        />
      </Svg>
    </Animated.View>
  );
}
