// spawnEnemies と moveEnemySight のテスト
// 初心者向けに分かりやすく記述

import {
  spawnEnemies,
  moveEnemySight,
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


describe('moveEnemySight', () => {
  test('視界に入ったプレイヤーを追跡する', () => {
    const e = { pos: pos(0, 0), visible: true, interval: 1, repeat: 1, cooldown: 0, target: null, behavior: 'sight' };
    const visited = new Map<string, number>();
    const moved = moveEnemySight(e, baseMaze, visited, pos(2, 0), () => 0);
    expect(moved.pos).toEqual(pos(1, 0));
  });

  test('一度見失っても最後に見た場所へ向かう', () => {
    const e = { pos: pos(0, 0), visible: true, interval: 1, repeat: 1, cooldown: 0, target: null, behavior: 'sight' };
    const visited = new Map<string, number>();
    const first = moveEnemySight(e, baseMaze, visited, pos(0, 2), () => 0);
    // プレイヤーを曲がった位置へ移動させて視界から外す
    const second = moveEnemySight(first, baseMaze, visited, pos(1, 2), () => 0);
    expect(second.pos).toEqual(pos(0, 1));
    // さらに追跡して最終的に (0,2) へ到達する
    const third = moveEnemySight(second, baseMaze, visited, pos(1, 2), () => 0);
    expect(third.pos).toEqual(pos(0, 2));
  });

  test('視界外では未踏マスを優先する', () => {
    const e = { pos: pos(1, 1), visible: true, interval: 1, repeat: 1, cooldown: 0, target: null, behavior: 'sight' };
    const visited = new Map<string, number>([
      ['2,1', 1],
      ['1,0', 1],
      ['1,2', 1],
    ]);
    const moved = moveEnemySight(e, baseMaze, visited, pos(9, 9), () => 0);
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
