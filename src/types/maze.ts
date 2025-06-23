export interface MazeData {
  id: string;
  size: 10;
  start: [number, number];
  goal: [number, number];
  v_walls: [number, number][];
  h_walls: [number, number][];
}

export interface Vec2 {
  x: number;
  y: number;
}

export type Dir = 'Up' | 'Down' | 'Left' | 'Right';
