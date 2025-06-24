import mazeSet1 from '@/assets/mazes/maze_11_T30_L16_20250624-161917.json';
import type { MazeData } from '@/src/types/maze';

/**
 * assets/mazes 配下に置かれた JSON から迷路データを読み込む
 * JSON には複数の迷路が配列で入っているため、ここでランダムに一つ選ぶ
 */
export function loadMaze(): MazeData {
  // 対象 JSON を配列として読み込み、1 次元配列にまとめる
  const mazes: MazeData[] = [...(mazeSet1 as MazeData[])];
  // 迷路の数から乱数でインデックスを決定
  const idx = Math.floor(Math.random() * mazes.length);
  return mazes[idx];
}

