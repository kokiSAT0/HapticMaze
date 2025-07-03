// 敵 AI で利用する汎用的な関数をまとめたモジュール
// BFS(幅優先探索) など少し難しい用語にも簡単な説明を添えています

import type { Vec2, Dir } from '@/src/types/maze';
import type { MazeSets } from '../state/core';
import { canMove, nextPosition } from '../maze';

/**
 * BFS を用いて start から goal までの最短経路を探す
 * BFS は幅優先探索と呼ばれる探索手法で、
 * 一歩ずつ広げながらゴールにたどり着くルートを見つけます。
 */
export function shortestStep(
  start: Vec2,
  goal: Vec2,
  maze: MazeSets,
): { next: Vec2; dist: number } | null {
  const visited = new Set<string>([`${start.x},${start.y}`]);
  type Node = { pos: Vec2; dist: number; first: Vec2 | null };
  const queue: Node[] = [{ pos: start, dist: 0, first: null }];

  while (queue.length > 0) {
    const { pos, dist, first } = queue.shift() as Node;
    if (pos.x === goal.x && pos.y === goal.y) {
      return { next: first ?? pos, dist };
    }

    for (const dir of ['Up', 'Down', 'Left', 'Right'] as const) {
      if (!canMove(pos, dir, maze)) continue;
      const nxt = nextPosition(pos, dir);
      const key = `${nxt.x},${nxt.y}`;
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push({ pos: nxt, dist: dist + 1, first: first ?? nxt });
    }
  }
  return null;
}

/** 敵からプレイヤーが見えるか判定する処理 */
export function inSight(
  enemy: Vec2,
  player: Vec2,
  maze: MazeSets,
  range: number = Infinity,
): boolean {
  if (enemy.x === player.x) {
    const dy = player.y - enemy.y;
    const dir: Dir = dy > 0 ? 'Down' : 'Up';
    if (Math.abs(dy) > range) return false;
    for (let i = 0; i < Math.abs(dy); i++) {
      const pos = { x: enemy.x, y: enemy.y + i * Math.sign(dy) };
      if (!canMove(pos, dir, maze)) return false;
    }
    return true;
  }
  if (enemy.y === player.y) {
    const dx = player.x - enemy.x;
    const dir: Dir = dx > 0 ? 'Right' : 'Left';
    if (Math.abs(dx) > range) return false;
    for (let i = 0; i < Math.abs(dx); i++) {
      const pos = { x: enemy.x + i * Math.sign(dx), y: enemy.y };
      if (!canMove(pos, dir, maze)) return false;
    }
    return true;
  }
  return false;
}

/** 敵の移動履歴を更新する */
export function updateEnemyPaths(
  paths: Vec2[][],
  enemies: Vec2[],
  maxLen: number,
): Vec2[][] {
  return enemies.map((e, i) => {
    const prev = paths[i] ?? [];
    const next = [...prev, e];
    while (next.length > maxLen) next.shift();
    return next;
  });
}

/** プレイヤーの移動履歴を更新する */
export function updatePlayerPath(
  path: Vec2[],
  pos: Vec2,
  maxLen: number,
): Vec2[] {
  const next = [...path, pos];
  while (maxLen !== Infinity && next.length > maxLen) next.shift();
  return next;
}

/** 衝突壁マップの寿命を1減らす */
export function decayHitMap(map: Map<string, number>): Map<string, number> {
  const next = new Map<string, number>();
  map.forEach((v, k) => {
    const nv = v === Infinity ? Infinity : v - 1;
    if (nv > 0 || nv === Infinity) next.set(k, nv);
  });
  return next;
}
