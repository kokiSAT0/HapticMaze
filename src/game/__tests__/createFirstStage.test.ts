import { createFirstStage } from '../state/stage';
import type { MazeData } from '@/src/types/maze';

describe('createFirstStage', () => {
  test('新規ゲーム開始時のリスポーン回数は3になる', () => {
    const maze: MazeData = {
      id: 'test',
      size: 10,
      start: [0, 0],
      goal: [9, 9],
      v_walls: [],
      h_walls: [],
    };
    const state = createFirstStage(maze);
    expect(state.respawnStock).toBe(3);
  });
});
