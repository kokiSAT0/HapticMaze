// 迷路関連の汎用処理をまとめたモジュール

import type { MazeData, Vec2, Dir } from '@/src/types/maze';

/**
 * 壁配列から高速検索用の Set を作成する
 */
export function wallSet(walls: [number, number][]): Set<string> {
  return new Set(walls.map(([x, y]) => `${x},${y}`));
}

/**
 * 現在位置から指定方向へ移動できるかを判定
 */
export function canMove({ x, y }: Vec2, dir: Dir, maze: MazeData): boolean {
  const h = maze.v_walls as unknown as Set<string>;
  const v = maze.h_walls as unknown as Set<string>;
  const last = maze.size - 1;
  switch (dir) {
    case 'Right':
      return !h.has(`${x},${y}`) && x < last;
    case 'Left':
      return !h.has(`${x - 1},${y}`) && x > 0;
    case 'Down':
      return !v.has(`${x},${y}`) && y < last;
    case 'Up':
      return !v.has(`${x},${y - 1}`) && y > 0;
  }
}

/**
 * 座標と方向から次の座標を計算する簡易ヘルパー
 */
export function nextPosition(pos: Vec2, dir: Dir): Vec2 {
  const next = { ...pos };
  switch (dir) {
    case 'Up':
      next.y -= 1;
      break;
    case 'Down':
      next.y += 1;
      break;
    case 'Left':
      next.x -= 1;
      break;
    case 'Right':
      next.x += 1;
      break;
  }
  return next;
}

/**
 * 衝突した壁の座標を取得する。
 * 壁が無ければ null
 */
export function getHitWall(
  { x, y }: Vec2,
  dir: Dir,
  maze: MazeData,
): { kind: 'v' | 'h'; key: string } | null {
  const h = maze.v_walls as unknown as Set<string>;
  const v = maze.h_walls as unknown as Set<string>;
  const last = maze.size - 1;
  switch (dir) {
    case 'Right':
      if (h.has(`${x},${y}`)) return { kind: 'v', key: `${x},${y}` };
      if (x >= last) return { kind: 'v', key: `${last},${y}` };
      break;
    case 'Left':
      if (h.has(`${x - 1},${y}`)) return { kind: 'v', key: `${x - 1},${y}` };
      if (x <= 0) return { kind: 'v', key: `-1,${y}` };
      break;
    case 'Down':
      if (v.has(`${x},${y}`)) return { kind: 'h', key: `${x},${y}` };
      if (y >= last) return { kind: 'h', key: `${x},${last}` };
      break;
    case 'Up':
      if (v.has(`${x},${y - 1}`)) return { kind: 'h', key: `${x},${y - 1}` };
      if (y <= 0) return { kind: 'h', key: `${x},-1` };
      break;
  }
  return null;
}

/**
 * 盤面サイズからランダムなマス座標を返す
 */
export function randomCell(size: number, rnd: () => number = Math.random): Vec2 {
  return {
    x: Math.floor(rnd() * size),
    y: Math.floor(rnd() * size),
  };
}

/**
 * スタート位置から離れたマスほど選ばれやすい形で1マス取得する
 */
export function biasedPickGoal(
  start: Vec2,
  cells: Vec2[],
  rnd: () => number = Math.random,
): Vec2 {
  const weights = cells.map(
    (c) => Math.abs(c.x - start.x) + Math.abs(c.y - start.y) + 1,
  );
  const sum = weights.reduce((a, b) => a + b, 0);
  let r = rnd() * sum;
  for (let i = 0; i < cells.length; i++) {
    r -= weights[i];
    if (r <= 0) return cells[i];
  }
  return cells[cells.length - 1];
}

/**
 * サイズから全てのマス座標を列挙する
 */
export function allCells(size: number): Vec2[] {
  const cells: Vec2[] = [];
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      cells.push({ x, y });
    }
  }
  return cells;
}

/** 新しい迷路を読み込むまでのステージ間隔 */
export const STAGE_PER_MAP = 3;

/**
 * ステージ番号から迷路を変更すべきか判定
 */
export function shouldChangeMap(stage: number): boolean {
  return stage % STAGE_PER_MAP === 0;
}
