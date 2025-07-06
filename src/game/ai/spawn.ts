// 敵の生成に関する処理をまとめたモジュール
// プログラミング初心者向けにコメント多めで解説しています

import type { MazeData, Vec2 } from '@/src/types/maze';
import { allCells, biasedPickFrom } from '../maze';

/** 敵をランダムな位置に生成する */
export function spawnEnemies(
  count: number,
  maze: MazeData,
  rnd: () => number = Math.random,
  exclude: Set<string> = new Set(),
  biased: boolean = true,
  // どこから遠ざけるかの基準位置。未指定ならスタート地点
  origin: Vec2 = { x: maze.start[0], y: maze.start[1] },
): Vec2[] {
  const enemies: Vec2[] = [];
  const goal = { x: maze.goal[0], y: maze.goal[1] };
  const candidates = allCells(maze.size).filter((c) => {
    const key = `${c.x},${c.y}`;
    if (exclude.has(key)) return false;
    if (c.x === origin.x && c.y === origin.y) return false;
    if (c.x === goal.x && c.y === goal.y) return false;
    return true;
  });

  while (enemies.length < count && candidates.length > 0) {
    const cell = biased
      ? biasedPickFrom(origin, candidates, rnd)
      : candidates[Math.floor(rnd() * candidates.length)];
    const key = `${cell.x},${cell.y}`;
    enemies.push(cell);
    exclude.add(key);
    const idx = candidates.findIndex((c) => c.x === cell.x && c.y === cell.y);
    if (idx !== -1) candidates.splice(idx, 1);
  }

  return enemies;
}
