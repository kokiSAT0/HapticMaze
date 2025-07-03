// 敵の移動や配置に関する処理を集めたモジュール

import type { MazeData, Vec2, Dir } from '@/src/types/maze';
import type { MazeSets } from './state/core';
import type { Enemy } from '@/src/types/enemy';
import { canMove, nextPosition, allCells, biasedPickGoal } from './maze';

/** 敵をランダムな位置に生成する */
export function spawnEnemies(
  count: number,
  maze: MazeData,
  rnd: () => number = Math.random,
  exclude: Set<string> = new Set(),
  biased: boolean = true,
): Vec2[] {
  const enemies: Vec2[] = [];
  const start = { x: maze.start[0], y: maze.start[1] };
  const goal = { x: maze.goal[0], y: maze.goal[1] };
  const candidates = allCells(maze.size).filter((c) => {
    const key = `${c.x},${c.y}`;
    if (exclude.has(key)) return false;
    if (c.x === start.x && c.y === start.y) return false;
    if (c.x === goal.x && c.y === goal.y) return false;
    return true;
  });

  while (enemies.length < count && candidates.length > 0) {
    const cell = biased
      ? biasedPickGoal(start, candidates, rnd)
      : candidates[Math.floor(rnd() * candidates.length)];
    const key = `${cell.x},${cell.y}`;
    enemies.push(cell);
    exclude.add(key);
    const idx = candidates.findIndex((c) => c.x === cell.x && c.y === cell.y);
    if (idx !== -1) candidates.splice(idx, 1);
  }

  return enemies;
}

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

/**
 * BFS を用いて start から goal までの最短経路を探す
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

/**
 * 壁を考慮した最短経路で距離を測り、近ければ追跡する敵 AI
 */
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

/**
 * 視界に入った場合のみ追跡する敵 AI
 */
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
