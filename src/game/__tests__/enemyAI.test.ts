import { wallSet } from '../maze';
import { moveEnemySight, moveEnemySmart } from '../enemyAI';
import type { MazeData, Vec2 } from '@/src/types/maze';

// 迷路データの簡易版。壁は設置しない
const baseMaze: MazeData & { v_walls: Set<string>; h_walls: Set<string> } = {
  id: 'test',
  size: 10,
  start: [0, 0],
  goal: [9, 9],
  v_walls: wallSet([]),
  h_walls: wallSet([]),
};

// 座標オブジェクトを手早く作るヘルパー
const pos = (x: number, y: number): Vec2 => ({ x, y });

describe('moveEnemySight', () => {
  test('範囲内ならプレイヤーを追跡する', () => {
    const enemy = {
      pos: pos(0, 0),
      visible: true,
      interval: 1,
      repeat: 1,
      cooldown: 0,
      target: null,
      behavior: 'sight' as const,
    };
    const visited = new Map<string, number>();

    // range を 2 とし、(0,2) のプレイヤーは範囲内
    const moved = moveEnemySight(enemy, baseMaze, visited, pos(0, 2), () => 0, 2);
    expect(moved.pos).toEqual(pos(0, 1));
  });

  test('範囲外では未踏マスを優先する', () => {
    const enemy = {
      pos: pos(0, 0),
      visible: true,
      interval: 1,
      repeat: 1,
      cooldown: 0,
      target: null,
      behavior: 'sight' as const,
    };
    // 右側を未踏、下側を既踏とする
    const visited = new Map<string, number>([
      ['1,0', 0],
      ['0,1', 1],
    ]);

    // range を 1 にするとプレイヤーは見えない
    const moved = moveEnemySight(enemy, baseMaze, visited, pos(0, 2), () => 0, 1);
    // 未踏マスである右へ進むことを確認
    expect(moved.pos).toEqual(pos(1, 0));
  });
});

describe('moveEnemySmart', () => {
  test('近距離ならプレイヤーを追跡する', () => {
    const enemy = {
      pos: pos(0, 0),
      visible: true,
      interval: 1,
      repeat: 1,
      cooldown: 0,
      behavior: 'smart' as const,
    };
    const visited = new Map<string, number>();

    // 2マス先のプレイヤーを追う
    const moved = moveEnemySmart(enemy, baseMaze, visited, pos(2, 0), () => 0);
    expect(moved.pos).toEqual(pos(1, 0));
  });

  test('遠距離では未踏マスを優先する', () => {
    const enemy = {
      pos: pos(0, 0),
      visible: true,
      interval: 1,
      repeat: 1,
      cooldown: 0,
      behavior: 'smart' as const,
    };
    const visited = new Map<string, number>([
      ['1,0', 0],
      ['0,1', 1],
    ]);

    // 3マス先なので追跡せず、未踏マスである右へ進む
    const moved = moveEnemySmart(enemy, baseMaze, visited, pos(3, 0), () => 0);
    expect(moved.pos).toEqual(pos(1, 0));
  });
});
