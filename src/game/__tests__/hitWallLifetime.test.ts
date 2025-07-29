import { handlePlayerMove } from '../state/moveHandlers';
import { prepMaze } from '../state/core';
import type { MazeData } from '@/src/types/maze';

const maze: MazeData = {
  id: 'test',
  size: 5,
  start: [0, 0],
  goal: [4, 4],
  v_walls: [],
  h_walls: [],
};

const baseState = {
  maze: prepMaze(maze),
  pos: { x: 0, y: 0 },
  steps: 0,
  bumps: 0,
  hitV: new Map<string, number>(),
  hitH: new Map<string, number>(),
  wallLifetime: 10,
} as any;

describe('handlePlayerMove の壁寿命更新', () => {
  test('既存寿命が長いときは維持される', () => {
    const state = {
      ...baseState,
      hitV: new Map([['-1,0', 40]]),
    } as any;
    const res = handlePlayerMove(state, 'Left');
    expect(res.hitV.get('-1,0')).toBe(40);
  });

  test('短い寿命は上書きされる', () => {
    const state = {
      ...baseState,
      hitV: new Map([['-1,0', 5]]),
    } as any;
    const res = handlePlayerMove(state, 'Left');
    expect(res.hitV.get('-1,0')).toBe(10);
  });
});
