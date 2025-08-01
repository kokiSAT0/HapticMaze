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

  test('無効なサイズはエラーを出して 10 を返す', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const showError = jest.fn();

    const maze = loadMaze(7, { showError });

    expect(spy).toHaveBeenCalled();
    expect(showError).toHaveBeenCalledWith('迷路サイズは 5 または 10 を指定してください');
    expect(maze.size).toBe(10);

    spy.mockRestore();
  });
});
