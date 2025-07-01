export interface MazeData {
  id: string;
  // 迷路の一辺の長さ。以前は 10 固定だったが複数サイズに対応するため number とする
  size: number;
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

// よく使う進行方向を配列でまとめた定数です
// as const を付けると、要素が文字列リテラル型として扱われます
export const DIRECTIONS = ['Up', 'Down', 'Left', 'Right'] as const;

