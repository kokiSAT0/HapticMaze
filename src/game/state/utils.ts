/**
 * プレイヤーの周囲に存在する壁を記録するヘルパー。
 * 座標と迷路情報を受け取り、見つかった壁を指定ターン分
 * hitV と hitH に追加して返す。
 * 既に登録済みの壁寿命より長い値を指定した場合は
 * その値で上書きする。
 *
 * Map は元の状態を変更しないよう新しいインスタンスを作成する点に注意。
 */
import type { MazeSets } from './core';

export function addAdjacentWalls(
  pos: { x: number; y: number },
  maze: MazeSets,
  hitV: Map<string, number>,
  hitH: Map<string, number>,
  life: number = Infinity,
): { hitV: Map<string, number>; hitH: Map<string, number> } {
  const { x, y } = pos;
  const last = maze.size - 1;
  const nextV = new Map(hitV);
  const nextH = new Map(hitH);

  const add = (map: Map<string, number>, key: string) => {
    const current = map.get(key);
    const nextLife = life === Infinity || current === Infinity ? Infinity : Math.max(current ?? 0, life);
    map.set(key, nextLife);
  };

  if (x <= 0 || maze.v_walls.has(`${x - 1},${y}`)) add(nextV, `${x - 1},${y}`);
  if (x >= last || maze.v_walls.has(`${x},${y}`)) add(nextV, `${x},${y}`);
  if (y <= 0 || maze.h_walls.has(`${x},${y - 1}`)) add(nextH, `${x},${y - 1}`);
  if (y >= last || maze.h_walls.has(`${x},${y}`)) add(nextH, `${x},${y}`);

  return { hitV: nextV, hitH: nextH };
}
