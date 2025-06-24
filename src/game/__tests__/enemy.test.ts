// spawnEnemies と moveEnemyRandom のテスト
// 初心者向けに分かりやすく記述

import { spawnEnemies, moveEnemyRandom, wallSet } from '../utils';
import type { MazeData, Vec2 } from '@/src/types/maze';

// 基本となる迷路データ（壁なし）
const baseMaze: MazeData & { v_walls: Set<string>; h_walls: Set<string> } = {
  id: 'test',
  size: 10,
  start: [0, 0],
  goal: [9, 9],
  v_walls: wallSet([]),
  h_walls: wallSet([]),
};

const pos = (x: number, y: number): Vec2 => ({ x, y });

describe('moveEnemyRandom', () => {
  test('進める方向が一つだけなら必ずそこへ移動する', () => {
    const maze = {
      ...baseMaze,
      // 下方向のみ開けている状態を作る
      v_walls: wallSet([]),
      h_walls: wallSet([]),
    };
    const e = pos(0, 0);
    const moved = moveEnemyRandom(e, maze, () => 0);
    expect(moved).toEqual(pos(0, 1));
  });

  test('乱数によって方向が決まる', () => {
    const e = pos(0, 0);
    const moved = moveEnemyRandom(e, baseMaze, () => 0.6); // Right を選ぶ
    expect(moved).toEqual(pos(1, 0));
  });
});

describe('spawnEnemies', () => {
  test('スタートとゴールには配置されない', () => {
    const rnd = jest
      .fn()
      // 最初はスタート座標を返す → 無視される
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      // 次に有効な座標 (1,2)
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.2);
    const enemies = spawnEnemies(1, baseMaze, rnd);
    expect(enemies[0]).toEqual(pos(1, 2));
  });
});
