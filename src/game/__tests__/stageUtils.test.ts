import {
  randomCell,
  biasedPickGoal,
  biasedPickFrom,
  shouldChangeMap,
} from '../maze';
import type { Vec2 } from '@/src/types/maze';

describe('randomCell', () => {
  test('同じ乱数を使えば常に同じ座標になる', () => {
    const rnd = jest.fn().mockReturnValue(0.5);
    expect(randomCell(10, rnd)).toEqual({ x: 5, y: 5 });
  });
});

describe('biasedPickGoal', () => {
  const start: Vec2 = { x: 0, y: 0 };
  const cells: Vec2[] = [
    { x: 0, y: 1 }, // 重み2
    { x: 0, y: 9 }, // 重み10
  ];

  test('小さな乱数では近い方が選ばれる', () => {
    const rnd = jest.fn().mockReturnValue(0.05); // 0.05*12 = 0.6 <2
    expect(biasedPickGoal(start, cells, rnd)).toEqual(cells[0]);
  });

  test('大きな乱数では遠い方が選ばれる', () => {
    const rnd = jest.fn().mockReturnValue(0.9); // 0.9*12 = 10.8 >2
    expect(biasedPickGoal(start, cells, rnd)).toEqual(cells[1]);
  });
});

describe('biasedPickFrom', () => {
  const origin: Vec2 = { x: 5, y: 5 };
  const cells: Vec2[] = [
    { x: 6, y: 5 }, // 重み2
    { x: 9, y: 9 }, // 重み9
  ];

  test('小さな乱数では近い方が選ばれる', () => {
    const rnd = jest.fn().mockReturnValue(0.05); // 0.05*11 = 0.55 <2
    expect(biasedPickFrom(origin, cells, rnd)).toEqual(cells[0]);
  });

  test('大きな乱数では遠い方が選ばれる', () => {
    const rnd = jest.fn().mockReturnValue(0.9); // 0.9*11 = 9.9 >2
    expect(biasedPickFrom(origin, cells, rnd)).toEqual(cells[1]);
  });
});

describe('shouldChangeMap', () => {
  test('指定間隔ごとに迷路を変更する', () => {
    expect(shouldChangeMap(5, 5)).toBe(true);
    expect(shouldChangeMap(10, 5)).toBe(true);
  });

  test('それ以外のステージでは迷路を維持する', () => {
    expect(shouldChangeMap(1, 5)).toBe(false);
    expect(shouldChangeMap(4, 5)).toBe(false);
  });
});
