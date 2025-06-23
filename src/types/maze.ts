export interface MazeData {
  id: string;
  size: 10;
  start: [number, number];
  goal: [number, number];
  v_walls: [number, number][];
  h_walls: [number, number][];
}
