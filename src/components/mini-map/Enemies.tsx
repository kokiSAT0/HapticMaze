import React from 'react';
import { Circle, Line } from 'react-native-svg';
import type { Enemy } from '@/src/types/enemy';
import type { Vec2 } from '@/src/types/maze';
import type { MazeSets } from '@/src/game/state';
import { inSight } from '@/src/game/enemyAI';

// 敵描画に関する処理

// 中心から放射状に線を伸ばすヘルパー
// color には赤や黄色などの線色を渡す
function enemyLines(
  cx: number,
  cy: number,
  r: number,
  count: number,
  color: string,
): React.JSX.Element[] {
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
        // ここで線の色を指定する
        stroke={color}
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
  playerPos: Vec2;
  maze: MazeSets;
}

// 敵本体と放射線を描画
export function renderEnemies({ enemies, cell, showAll, playerPos, maze }: EnemiesProps): (React.JSX.Element | null)[] {
  const lineMap = { random: 4, slow: 6, sight: 24, fast: 12 } as const;
  return enemies.map((e, i) => {
    if (!e.visible && !showAll) return null;
    const cx = (e.pos.x + 0.5) * cell;
    const cy = (e.pos.y + 0.5) * cell;
    // 敵がプレイヤーを視認しているかどうかを判定
    // inSight は壁を考慮した直線上の可視判定を行う
    const seeing = inSight(e.pos, playerPos, maze);
    let color = 'white';
    if (e.behavior === 'sight' || e.behavior === 'smart') {
      if (seeing) {
        // 視認中は赤色
        color = 'red';
      } else if (e.target) {
        // 直前の視認位置へ向かっている最中は黄色
        color = 'yellow';
      }
    }
    // 色を決めてから線を生成
    const lines = enemyLines(cx, cy, cell * 0.35, lineMap[e.kind ?? 'random'], color);
    return (
      <React.Fragment key={`enemy${i}`}>
        <Circle cx={cx} cy={cy} r={cell * 0.1} fill={color} />
        {lines}
      </React.Fragment>
    );
  });
}

