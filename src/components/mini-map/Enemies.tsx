import React from 'react';
import { Circle, Line } from 'react-native-svg';
import type { Enemy } from '@/src/types/enemy';

// 敵描画に関する処理

// 中心から放射状に線を伸ばすヘルパー
function enemyLines(cx: number, cy: number, r: number, count: number): React.JSX.Element[] {
  const lines: React.JSX.Element[] = [];
  const step = (2 * Math.PI) / count;
  for (let i = 0; i < count; i++) {
    const rad = i * step - Math.PI / 2; // 12時方向基準
    lines.push(
      <Line
        key={`l${i}`}
        x1={cx}
        y1={cy}
        x2={cx + r * Math.cos(rad)}
        y2={cy + r * Math.sin(rad)}
        stroke="white"
        strokeWidth={1}
      />
    );
  }
  return lines;
}

export interface EnemiesProps {
  enemies: Enemy[];
  cell: number;
  showAll: boolean;
}

// 敵本体と放射線を描画
export function renderEnemies({ enemies, cell, showAll }: EnemiesProps): (React.JSX.Element | null)[] {
  const lineMap = { random: 4, slow: 6, sight: 24, fast: 12 } as const;
  return enemies.map((e, i) => {
    if (!e.visible && !showAll) return null;
    const cx = (e.pos.x + 0.5) * cell;
    const cy = (e.pos.y + 0.5) * cell;
    const lines = enemyLines(cx, cy, cell * 0.35, lineMap[e.kind ?? 'random']);
    return (
      <React.Fragment key={`enemy${i}`}>
        <Circle cx={cx} cy={cy} r={cell * 0.1} fill="white" />
        {lines}
      </React.Fragment>
    );
  });
}

