import React from 'react';
import { Line, Rect } from 'react-native-svg';
import type { MazeData } from '@/src/types/maze';

// 壁描画処理をまとめたファイル
// MiniMap 以外でも使えるように関数として定義

// グレーの壁色を定数化
const WALL_COLOR = 'gray';

export interface WallsProps {
  maze: MazeData;
  cell: number;
  size: number;
  showAll: boolean;
}

// 迷路全体の壁を描く関数
export function renderWalls({ maze, cell, size, showAll }: WallsProps): React.JSX.Element[] | null {
  if (!showAll) return null;
  const lines: React.JSX.Element[] = [];
  // 迷路の外周がわかりやすいように白枠を追加
  lines.push(
    <Rect
      key="debugBorder"
      x={0}
      y={0}
      width={size}
      height={size}
      stroke="white"
      strokeWidth={1}
      fill="none"
    />
  );

  // 縦方向の壁
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
        stroke={WALL_COLOR}
        strokeWidth={1}
      />
    );
  }

  // 横方向の壁
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
        stroke={WALL_COLOR}
        strokeWidth={1}
      />
    );
  }

  return lines;
}

export interface HitWallProps {
  cell: number;
  hitV?: Map<string, number>;
  hitH?: Map<string, number>;
  wallLifetime: number;
}

// 衝突した壁を描く関数
export function renderHitWalls({ cell, hitV, hitH, wallLifetime }: HitWallProps): React.JSX.Element[] {
  const lines: React.JSX.Element[] = [];
  hitV?.forEach((life, k) => {
    const [x, y] = k.split(',').map(Number);
    const op = wallLifetime === Infinity || life === Infinity ? 1 : life / wallLifetime;
    lines.push(
      <Line
        key={`hv${k}`}
        x1={(x + 1) * cell}
        y1={y * cell}
        x2={(x + 1) * cell}
        y2={y * cell + cell}
        stroke={`rgba(128,128,128,${op})`}
        strokeWidth={1}
      />
    );
  });
  hitH?.forEach((life, k) => {
    const [x, y] = k.split(',').map(Number);
    const op = wallLifetime === Infinity || life === Infinity ? 1 : life / wallLifetime;
    lines.push(
      <Line
        key={`hh${k}`}
        x1={x * cell}
        y1={(y + 1) * cell}
        x2={x * cell + cell}
        y2={(y + 1) * cell}
        stroke={`rgba(128,128,128,${op})`}
        strokeWidth={1}
      />
    );
  });
  return lines;
}

export interface AdjacentWallProps {
  maze: import("@/src/game/state").MazeSets;
  pos: import("@/src/types/maze").Vec2;
  cell: number;
}

// プレイヤー周囲の壁を描画する
export function renderAdjacentWalls({ maze, pos, cell }: AdjacentWallProps): React.JSX.Element[] {
  const lines: React.JSX.Element[] = [];
  const { x, y } = pos;
  const last = maze.size - 1;
  const addV = (vx: number, vy: number) => {
    lines.push(
      <Line
        key={`av${vx},${vy}`}
        x1={(vx + 1) * cell}
        y1={vy * cell}
        x2={(vx + 1) * cell}
        y2={vy * cell + cell}
        stroke={WALL_COLOR}
        strokeWidth={1}
      />,
    );
  };
  const addH = (hx: number, hy: number) => {
    lines.push(
      <Line
        key={`ah${hx},${hy}`}
        x1={hx * cell}
        y1={(hy + 1) * cell}
        x2={hx * cell + cell}
        y2={(hy + 1) * cell}
        stroke={WALL_COLOR}
        strokeWidth={1}
      />,
    );
  };
  if (x <= 0 || maze.v_walls.has(`${x - 1},${y}`)) addV(x - 1, y);
  if (x >= last || maze.v_walls.has(`${x},${y}`)) addV(x, y);
  if (y <= 0 || maze.h_walls.has(`${x},${y - 1}`)) addH(x, y - 1);
  if (y >= last || maze.h_walls.has(`${x},${y}`)) addH(x, y);
  return lines;
}

