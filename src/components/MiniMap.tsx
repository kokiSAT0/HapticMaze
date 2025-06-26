import React from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Line, Rect, Circle, Polygon, Defs, LinearGradient, Stop } from 'react-native-svg';

import type { MazeData, Vec2 } from '@/src/types/maze';
import type { Enemy } from '@/src/types/enemy';

// 星形ポリゴンの座標文字列を生成するヘルパー
function starPoints(cx: number, cy: number, r: number): string {
  const points: string[] = [];
  const step = Math.PI / 5; // 36度おきに頂点を作る
  for (let i = 0; i < 10; i++) {
    const rad = i * step - Math.PI / 2; // 上向きに開始
    const len = i % 2 === 0 ? r : r * 0.5;
    const x = cx + len * Math.cos(rad);
    const y = cy + len * Math.sin(rad);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

// MiniMapProps インターフェース
// ミニマップに必要な情報をまとめて渡す
export interface MiniMapProps {
  maze: MazeData; // 迷路の壁情報
  path: Vec2[]; // 通過したマスの履歴
  pos: Vec2; // 現在の位置
  enemies?: Enemy[]; // 敵の位置一覧
  enemyPaths?: Vec2[][]; // 敵の移動履歴
  flash?: number | import('react-native-reanimated').SharedValue<number>; // 外枠の太さ
  size?: number; // 表示サイズ (デフォルト80px)
  /**
   * デバッグ表示フラグ
   * true のとき壁とゴールを含む全情報を描画
   * 外枠の色もオレンジに変わる
   */
  showAll?: boolean;
  /** 衝突した壁 (縦方向) */
  hitV?: Set<string>;
  /** 衝突した壁 (横方向) */
  hitH?: Set<string>;
  /**
   * これまでにゴールとして使われたマスの集合
   * "x,y" 形式の文字列で座標を保持する
   */
  visitedGoals?: Set<string>;
}

// MiniMap コンポーネント
// react-native-svg を使い迷路と軌跡を描画する
export function MiniMap({
  maze,
  path,
  pos,
  enemies = [],
  enemyPaths = [],
  flash = 2,
  size = 80,
  showAll = false,
  hitV,
  hitH,
  visitedGoals,
}: MiniMapProps) {
  const cell = size / maze.size; // 各マスの大きさ
  const style = useAnimatedStyle(() => ({
    borderWidth: typeof flash === 'number' ? flash : flash.value,
  }));

  // 壁の線をまとめて描画
  const renderWalls = () => {
    // デバッグオフ時は外周を含む壁を描画しない
    if (!showAll) return null;
    const lines = [] as React.JSX.Element[];

    // 外周の壁
    // 通常モードでは表示しないが、デバッグ時のみ全体を確認するため描画
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
  // 外周との衝突も同じ座標形式で渡される
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
          strokeWidth={1}
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
          strokeWidth={1}
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
          stroke="white"
          strokeWidth={2}
        />
      );
    }
    return segments;
  };

  // 敵の移動履歴を線で描画
  // 最も古い線は透明から始まり徐々に白くなる
  const renderEnemyPaths = () => {
    const lines = [] as React.JSX.Element[];
    enemyPaths.forEach((p, idx) => {
      const enemy = enemies[idx];
      if (enemy && !enemy.visible && !showAll) return;
      for (let i = 0; i < p.length - 1; i++) {
        const a = p[i];
        const b = p[i + 1];
        const id = `ep${idx}-${i}`;
        const startO = i === 0 ? 0 : i === 1 ? 0.5 : 0.8;
        const endO = i === p.length - 2 ? 1 : i === 0 ? 0.5 : 0.8;
        lines.push(
          <React.Fragment key={id}>
            <Defs>
              <LinearGradient
                id={id}
                x1={(a.x + 0.5) * cell}
                y1={(a.y + 0.5) * cell}
                x2={(b.x + 0.5) * cell}
                y2={(b.y + 0.5) * cell}
                gradientUnits="userSpaceOnUse"
              >
                <Stop offset="0" stopColor="white" stopOpacity={startO} />
                <Stop offset="1" stopColor="white" stopOpacity={endO} />
              </LinearGradient>
            </Defs>
            <Line
              x1={(a.x + 0.5) * cell}
              y1={(a.y + 0.5) * cell}
              x2={(b.x + 0.5) * cell}
              y2={(b.y + 0.5) * cell}
              stroke={`url(#${id})`}
              strokeWidth={1}
            />
          </React.Fragment>
        );
      }
    });
    return lines;
  };

  // 敵を星形で描画
  const renderEnemies = () => {
    // __DEV__ は React Native が提供する開発判定フラグ
    const colorMap = {
      random: '#999',
      sense: '#0ff',
      slow: '#fa0',
      sight: '#0f0',
      fast: '#f0f',
    } as const;
    return enemies.map((e, i) => {
      if (!e.visible && !showAll) return null;
      const color = __DEV__ ? colorMap[e.kind ?? 'random'] : 'white';
      return (
        <Polygon
          key={`enemy${i}`}
          points={starPoints(
            (e.pos.x + 0.5) * cell,
            (e.pos.y + 0.5) * cell,
            cell * 0.35,
          )}
          fill={color}
        />
      );
    });
  };

  // 過去にゴールだったマスを枠線のみで描画
  // これまでにゴールだったマスを常に描画する
  // showAll フラグに関係なく表示することで
  // プレイヤーが到達済みの地点を確認できる
  const renderVisitedGoals = () => {
    if (!visitedGoals) return null;
    const rects = [] as React.JSX.Element[];
    visitedGoals.forEach((k) => {
      const [x, y] = k.split(',').map(Number);
      rects.push(
        <Rect
          key={`vg${k}`}
          x={(x + 0.25) * cell}
          y={(y + 0.25) * cell}
          width={cell * 0.5}
          height={cell * 0.5}
          stroke="white"
          strokeWidth={1}
          fill="none"
        />,
      );
    });
    return rects;
  };

  return (
    // デバッグ表示の有無にかかわらず外枠は描画しない
    // borderColor を常に transparent にして非表示にする
    <Animated.View
      style={[
        { width: size, height: size, borderColor: 'transparent' },
        style,
      ]}
    >
      <Svg width={size} height={size}>
        {renderWalls()}
        {renderHitWalls()}
        {renderPath()}
        {renderEnemyPaths()}
        {renderVisitedGoals()}
        {/* スタート位置を正方形で表示 */}
        <Rect
          x={(maze.start[0] + 0.25) * cell}
          y={(maze.start[1] + 0.25) * cell}
          width={cell * 0.5}
          height={cell * 0.5}
          fill="white"
        />
        {showAll && (
          // ゴール位置はデバッグ時のみ表示
          <Rect
            x={(maze.goal[0] + 0.25) * cell}
            y={(maze.goal[1] + 0.25) * cell}
            width={cell * 0.5}
            height={cell * 0.5}
            fill="white"
          />
        )}
        {/* 現在位置を円で表示 */}
        <Circle
          cx={(pos.x + 0.5) * cell}
          cy={(pos.y + 0.5) * cell}
          r={cell * 0.3}
          fill="white"
        />
        {renderEnemies()}
      </Svg>
    </Animated.View>
  );
}
