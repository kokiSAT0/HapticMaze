import { loadMaze, resetMazePools } from '../loadMaze';
import { mazeSet5, mazeSet10 } from '../mazeAsset';

beforeEach(() => {
  // プールを初期化して毎回同じ条件でテストする
  resetMazePools();
});

describe('loadMaze', () => {
  test('全て使い切るまでは同じ迷路を返さない', () => {
    const ids = new Set<string>();
    for (let i = 0; i < mazeSet5.length; i++) {
      const maze = loadMaze(5);
      expect(ids.has(maze.id)).toBe(false);
      ids.add(maze.id);
    }
  });

  test('使い切った後はプールが復元される', () => {
    for (let i = 0; i < mazeSet10.length; i++) {
      loadMaze(10);
    }
    // ここで全て消費済みだが呼び出し可能
    const maze = loadMaze(10);
    expect(maze).toBeDefined();
  });
});
