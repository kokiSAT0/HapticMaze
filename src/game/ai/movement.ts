// 敵の移動ロジックを扱うモジュール
// 初心者にも理解しやすいようコメントを追加

import type { Vec2, Dir } from '@/src/types/maze';
import type { MazeSets } from '../state/core';
import type { Enemy } from '@/src/types/enemy';
import { canMove, nextPosition } from '../maze';
import { shortestStep, inSight } from './utils';

/** ランダムに一マス移動する単純な行動 */
export function moveEnemyRandom(
  enemy: Enemy,
  maze: MazeSets,
  _visited?: Map<string, number>,
  _player?: Vec2,
  rnd: () => number = Math.random,
): Enemy {
  const dirs: Dir[] = ['Up', 'Down', 'Left', 'Right'].filter((d) =>
    canMove(enemy.pos, d, maze),
  );
  if (dirs.length === 0) return enemy;
  const idx = Math.floor(rnd() * dirs.length);
  return { ...enemy, pos: nextPosition(enemy.pos, dirs[idx]) };
}

/** 未踏マスを優先して移動する基本行動 */
export function moveEnemyBasic(
  enemy: Enemy,
  maze: MazeSets,
  visited: Map<string, number>,
  rnd: () => number = Math.random,
): Enemy {
  const dirs: Dir[] = ['Up', 'Down', 'Left', 'Right'].filter((d) =>
    canMove(enemy.pos, d, maze),
  );
  if (dirs.length === 0) return enemy;

  let bestDirs: Dir[] = [];
  let bestCount = Infinity;
  for (const d of dirs) {
    const next = nextPosition(enemy.pos, d);
    const key = `${next.x},${next.y}`;
    const count = visited.get(key) ?? 0;
    if (count < bestCount) {
      bestCount = count;
      bestDirs = [d];
    } else if (count === bestCount) {
      bestDirs.push(d);
    }
  }

  const idx = Math.floor(rnd() * bestDirs.length);
  return { ...enemy, pos: nextPosition(enemy.pos, bestDirs[idx]) };
}

/** 壁を考慮した最短経路で距離を測り、近ければ追跡する敵 AI */
export function moveEnemySmart(
  enemy: Enemy,
  maze: MazeSets,
  visited: Map<string, number>,
  player: Vec2,
  rnd: () => number = Math.random,
): Enemy {
  const dirs: Dir[] = ['Up', 'Down', 'Left', 'Right'].filter((d) =>
    canMove(enemy.pos, d, maze),
  );
  if (dirs.length === 0) return enemy;

  const chase = shortestStep(enemy.pos, player, maze);
  if (chase && chase.dist <= 2) {
    return { ...enemy, pos: chase.next };
  }

  return moveEnemyBasic(enemy, maze, visited, rnd);
}

/** 視界に入った場合のみ追跡する敵 AI */
export function moveEnemySight(
  enemy: Enemy,
  maze: MazeSets,
  visited: Map<string, number>,
  player: Vec2,
  rnd: () => number = Math.random,
  range: number = Infinity,
): Enemy {
  let target = enemy.target ?? null;
  if (inSight(enemy.pos, player, maze, range)) {
    target = { ...player };
  }
  if (target) {
    const chase = shortestStep(enemy.pos, target, maze);
    if (chase) {
      const next = chase.next;
      const reached = next.x === target.x && next.y === target.y;
      return { ...enemy, pos: next, target: reached ? null : target };
    }
    // 最短経路が無い場合は単純に距離の近い方向へ進む
    let best: Dir[] = [];
    let bestDist = Infinity;
    for (const d of ['Up', 'Down', 'Left', 'Right'] as const) {
      if (!canMove(enemy.pos, d, maze)) continue;
      const next = nextPosition(enemy.pos, d);
      const dist = Math.abs(next.x - player.x) + Math.abs(next.y - player.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = [d];
      } else if (dist === bestDist) {
        best.push(d);
      }
    }
    const idx = Math.floor(rnd() * best.length);
    return { ...enemy, pos: nextPosition(enemy.pos, best[idx]) };
  }
  return moveEnemyBasic(enemy, maze, visited, rnd);
}

