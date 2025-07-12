/**
 * プレイヤーの周囲に存在する壁を記録するヘルパー。
 * 座標と迷路情報を受け取り、見つかった壁を無限寿命(永続)で
 * hitV と hitH に追加して返す。
 *
 * Map は元の状態を変更しないよう新しいインスタンスを作成する点に注意。
 */
import type { MazeSets } from './core';

export function addAdjacentWalls(
  pos: { x: number; y: number },
  maze: MazeSets,
  hitV: Map<string, number>,
  hitH: Map<string, number>,
): { hitV: Map<string, number>; hitH: Map<string, number> } {
  const { x, y } = pos;
  const last = maze.size - 1;
  const nextV = new Map(hitV);
  const nextH = new Map(hitH);

  if (x <= 0 || maze.v_walls.has(`${x - 1},${y}`)) nextV.set(`${x - 1},${y}`, Infinity);
  if (x >= last || maze.v_walls.has(`${x},${y}`)) nextV.set(`${x},${y}`, Infinity);
  if (y <= 0 || maze.h_walls.has(`${x},${y - 1}`)) nextH.set(`${x},${y - 1}`, Infinity);
  if (y >= last || maze.h_walls.has(`${x},${y}`)) nextH.set(`${x},${y}`, Infinity);

  return { hitV: nextV, hitH: nextH };
}
