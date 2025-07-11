import type { Enemy } from "@/src/types/enemy";
import type { Vec2 } from "@/src/types/maze";
import React from "react";
import { Defs, Line, LinearGradient, Polygon, Stop } from "react-native-svg";

// 軌跡描画に関する関数群

export interface PathProps {
  path: Vec2[];
  cell: number;
  playerPathLength: number;
}

// プレイヤーの移動履歴を描画
export function renderPath({
  path,
  cell,
  playerPathLength,
}: PathProps): React.JSX.Element[] | null {
  if (path.length < 2) return null;
  const segments: React.JSX.Element[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    if (playerPathLength === Infinity) {
      segments.push(
        <Line
          key={`p${i}`}
          x1={(a.x + 0.5) * cell}
          y1={(a.y + 0.5) * cell}
          x2={(b.x + 0.5) * cell}
          y2={(b.y + 0.5) * cell}
          stroke="white"
          strokeWidth={1}
        />
      );
    } else {
      const id = `pp${i}`;
      const segs = path.length - 1;
      const startO = i / segs;
      const endO = (i + 1) / segs;
      segments.push(
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
  }
  return segments;
}

export interface EnemyPathsProps {
  enemyPaths: Vec2[][];
  enemies: Enemy[];
  cell: number;
  showAll: boolean;
}

// 敵の移動履歴を描画
export function renderEnemyPaths({
  enemyPaths,
  enemies,
  cell,
  showAll,
}: EnemyPathsProps): React.JSX.Element[] {
  const lines: React.JSX.Element[] = [];
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
}

export interface VisitedProps {
  visitedGoals?: Set<string>;
  cell: number;
  showResult: boolean;
  showAll: boolean;
}

// 過去のゴール位置をダイヤ型で表示
export function renderVisitedGoals({
  visitedGoals,
  cell,
  showResult,
  showAll,
}: VisitedProps): React.JSX.Element[] | null {
  if (!visitedGoals || (!showResult && !showAll)) return null;
  const diamonds: React.JSX.Element[] = [];
  visitedGoals.forEach((k) => {
    const [x, y] = k.split(",").map(Number);
    // 中心座標を計算
    const cx = (x + 0.5) * cell;
    const cy = (y + 0.5) * cell;
    // 半径を小さめに設定する
    const r = cell * 0.15;
    // Polygon でダイヤ型を描く
    diamonds.push(
      <Polygon
        key={`vg${k}`}
        points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${
          cx - r
        },${cy}`}
        fill="white"
      />
    );
  });
  return diamonds;
}
