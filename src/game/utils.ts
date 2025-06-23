import { Dir, MazeData, Vec2 } from '@/src/types/maze';

/**
 * 現在位置と方向から移動可能か判定します。
 * 常に O(1) で処理できるよう Set を利用します。
 */
export function canMove({ x, y }: Vec2, dir: Dir, maze: MazeData): boolean {
  const h = new Set(maze.v_walls.map(([a, b]) => `${a},${b}`));
  const v = new Set(maze.h_walls.map(([a, b]) => `${a},${b}`));

  switch (dir) {
    case 'Right':
      return !h.has(`${x},${y}`) && x < 9;
    case 'Left':
      return !h.has(`${x - 1},${y}`) && x > 0;
    case 'Down':
      return !v.has(`${x},${y}`) && y < 9;
    case 'Up':
      return !v.has(`${x},${y - 1}`) && y > 0;
  }
}

/**
 * 方向に応じた座標変化量を返します。
 */
export function dirOffset(dir: Dir): Vec2 {
  switch (dir) {
    case 'Up':
      return { x: 0, y: -1 };
    case 'Down':
      return { x: 0, y: 1 };
    case 'Left':
      return { x: -1, y: 0 };
    case 'Right':
      return { x: 1, y: 0 };
  }
}
