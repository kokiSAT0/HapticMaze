// spawnEnemies と moveEnemySmart のテスト
// 初心者向けに分かりやすく記述

import {
  spawnEnemies,
  moveEnemySmart,
  moveEnemySense,
  wallSet,
  updateEnemyPaths,
} from '../utils';
import { selectEnemyBehavior } from '../enemy';
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

// 敵とプレイヤーの間に壁がある迷路
const wallMaze: MazeData & { v_walls: Set<string>; h_walls: Set<string> } = {
  ...baseMaze,
  v_walls: wallSet([[0, 0]]), // (0,0)-(1,0) の間に壁
  h_walls: wallSet([]),
};

describe('moveEnemySmart', () => {
  test('プレイヤーが近いときは接近する', () => {
    const e = { pos: pos(0, 0), visible: true, interval: 1, repeat: 1, cooldown: 0, target: null, behavior: 'smart' };
    const visited = new Set<string>();
    const moved = moveEnemySmart(e, baseMaze, visited, pos(2, 0), () => 0);
    expect(moved.pos).toEqual(pos(1, 0));
  });

  test('壁を避けてでも距離2以内なら接近する', () => {
    const e = { pos: pos(0, 0), visible: true, interval: 1, repeat: 1, cooldown: 0, target: null, behavior: 'smart' };
    const visited = new Set<string>();
    // プレイヤーは (1,1)。直線では近いが壁により回り道で2歩
    const moved = moveEnemySmart(e, wallMaze, visited, pos(1, 1), () => 0);
    expect(moved.pos).toEqual(pos(0, 1));
  });

  test('壁で遠回りになる場合は接近しない', () => {
    const e = { pos: pos(0, 0), visible: true, interval: 1, repeat: 1, cooldown: 0, target: null, behavior: 'smart' };
    const visited = new Set<string>();
    // プレイヤーは (1,0) だが壁のせいで最短距離は3歩
    const moved = moveEnemySmart(e, wallMaze, visited, pos(1, 0), () => 0);
    expect(moved.pos).not.toEqual(pos(0, 1));
  });

  test('未踏マスを優先して進む', () => {
    const e = { pos: pos(1, 1), visible: true, interval: 1, repeat: 1, cooldown: 0, target: null, behavior: 'smart' };
    const visited = new Set<string>(['2,1', '1,0', '1,2']);
    const moved = moveEnemySmart(e, baseMaze, visited, pos(9, 9), () => 0);
    expect(moved.pos).toEqual(pos(0, 1));
  });
});

describe('moveEnemySense', () => {
  test('感知範囲内ならプレイヤーへ近づく', () => {
    const e = { pos: pos(0, 0), visible: true, interval: 1, repeat: 1, cooldown: 0, behavior: 'sense' };
    const visited = new Set<string>();
    const moved = moveEnemySense(e, baseMaze, visited, pos(2, 1), () => 0, 3);
    expect(moved.pos).toEqual(pos(0, 1));
  });

  test('範囲外では未踏マスを優先', () => {
    const e = { pos: pos(1, 1), visible: true, interval: 1, repeat: 1, cooldown: 0, behavior: 'sense' };
    const visited = new Set<string>(['2,1', '1,0', '1,2']);
    const moved = moveEnemySense(e, baseMaze, visited, pos(9, 9), () => 0, 3);
    expect(moved.pos).toEqual(pos(0, 1));
  });
});

describe('spawnEnemies', () => {
  test('スタートとゴールには配置されない', () => {
    // rnd が常に 0 を返すと候補配列の先頭が選ばれる
    const enemies = spawnEnemies(1, baseMaze, () => 0);
    expect(enemies[0]).toEqual(pos(0, 1));
    expect(enemies[0]).not.toEqual(pos(0, 0));
    expect(enemies[0]).not.toEqual(pos(9, 9));
  });
});

describe('updateEnemyPaths', () => {
  test('常に最新4点だけを保持する', () => {
    const paths = [[pos(0, 0), pos(1, 0), pos(2, 0), pos(3, 0)]];
    const enemies = [pos(4, 0)];
    const updated = updateEnemyPaths(paths, enemies, 4);
    expect(updated[0]).toEqual([pos(1, 0), pos(2, 0), pos(3, 0), pos(4, 0)]);
  });
});

describe('selectEnemyBehavior', () => {
  test('5マスでは追跡しない enemy を選ぶ', () => {
    expect(selectEnemyBehavior(5, false)).toBe('random');
  });

  test('10マスでは追跡する enemy を選ぶ', () => {
    expect(selectEnemyBehavior(10, false)).toBe('smart');
  });

  test('最終ステージはサイズに関わらず追跡する', () => {
    expect(selectEnemyBehavior(5, true)).toBe('smart');
  });
});
