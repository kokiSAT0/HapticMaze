// utils.ts の canMove と getHitWall をテストする
// プログラミング初心者向けにコメント付き

import { canMove, getHitWall, wallSet } from '../maze';
import type { MazeData, Vec2 } from '@/src/types/maze';

type TestMaze = MazeData & { v_walls: Set<string>; h_walls: Set<string> };

// 迷路サイズは型の都合で常に 10 とするが、今回は数マスしか使わない
const baseMaze: Omit<MazeData, 'v_walls' | 'h_walls'> = {
  id: 'test',
  size: 10,
  start: [0, 0],
  goal: [9, 9],
};

// 縦壁 [0,0] と横壁 [0,1] を配置したシンプルな迷路
const maze: TestMaze = {
  ...baseMaze,
  v_walls: wallSet([[0, 0]]),
  h_walls: wallSet([[0, 1]]),
};

// 座標オブジェクトを作る簡単なヘルパー
const pos = (x: number, y: number): Vec2 => ({ x, y });

describe('canMove', () => {
  test('壁がない方向へは移動できる', () => {
    expect(canMove(pos(0, 0), 'Down', maze)).toBe(true);
  });

  test('壁がある方向へは移動できない', () => {
    expect(canMove(pos(0, 0), 'Right', maze)).toBe(false);
  });

  test('迷路の端では移動できない', () => {
    expect(canMove(pos(0, 9), 'Down', maze)).toBe(false);
  });
});

describe('getHitWall', () => {
  test('通常移動では null が返る', () => {
    expect(getHitWall(pos(0, 0), 'Down', maze)).toBeNull();
  });

  test('壁に衝突した位置を返す', () => {
    expect(getHitWall(pos(0, 0), 'Right', maze)).toEqual({ kind: 'v', key: '0,0' });
  });

  test('境界に衝突した位置を返す', () => {
    expect(getHitWall(pos(0, 0), 'Left', maze)).toEqual({ kind: 'v', key: '-1,0' });
  });
});
