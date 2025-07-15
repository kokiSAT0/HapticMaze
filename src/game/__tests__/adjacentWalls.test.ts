import { addAdjacentWalls } from '../state/utils';
import { wallSet } from '../maze';
import type { MazeSets } from '../state/core';

const maze: MazeSets = {
  id: 'test',
  size: 5,
  start: [0, 0],
  goal: [4, 4],
  v_walls: wallSet([]),
  h_walls: wallSet([]),
};

describe('addAdjacentWalls', () => {
  test('指定寿命で周囲壁を追加する', () => {
    const res = addAdjacentWalls({ x: 0, y: 0 }, maze, new Map(), new Map(), 2);
    expect(res.hitV.get('-1,0')).toBe(2);
    expect(res.hitH.get('0,-1')).toBe(2);
  });

  test('既存より短い寿命では上書きしない', () => {
    const res = addAdjacentWalls(
      { x: 0, y: 4 },
      maze,
      new Map([['0,4', 5]]),
      new Map(),
      2,
    );
    expect(res.hitV.get('0,4')).toBe(5);
  });
});
