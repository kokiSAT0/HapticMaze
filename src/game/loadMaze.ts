// mazeAsset.ts から迷路セットを読み込む
import { mazeSet5, mazeSet10 } from './mazeAsset';
import type { MazeData } from '@/src/types/maze';

/**
 * 指定したサイズの迷路をランダムに返す
 * @param size 迷路の一辺の長さ
 */
export function loadMaze(size: number = 10): MazeData {
  // 対応する迷路セットを選択
  const set = size === 5 ? (mazeSet5 as MazeData[]) : (mazeSet10 as MazeData[]);
  const idx = Math.floor(Math.random() * set.length);
  return set[idx];
}
