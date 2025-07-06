import { spawnEnemies } from '../enemyAI';
import type { MazeData } from '@/src/types/maze';
import type { Enemy, EnemyCounts } from '@/src/types/enemy';

// EnemyCounts から Enemy 配列を生成するヘルパー
export function createEnemies(
  counts: EnemyCounts,
  maze: MazeData,
  biasedSpawn: boolean,
  biasFrom?: { x: number; y: number },
): Enemy[] {
  const enemies: Enemy[] = [];
  const exclude = new Set<string>();
  spawnEnemies(counts.random, maze, Math.random, exclude, biasedSpawn, biasFrom).forEach(
    (p) => {
      enemies.push({
        pos: p,
        // ミニマップで見えるようデフォルトで true
        visible: true,
        interval: 1,
        repeat: 1,
        cooldown: 0,
        target: null,
        behavior: 'random',
        kind: 'random',
      });
    },
  );
  spawnEnemies(counts.slow, maze, Math.random, exclude, biasedSpawn, biasFrom).forEach((p) => {
    enemies.push({
      pos: p,
      visible: true,
      interval: 2,
      repeat: 1,
      // interval が 2 のため初期クールダウンを 1 にする
      cooldown: 1,
      target: null,
      behavior: 'sight',
      kind: 'slow',
    });
  });
  spawnEnemies(counts.sight, maze, Math.random, exclude, biasedSpawn, biasFrom).forEach((p) => {
    enemies.push({
      pos: p,
      visible: true,
      interval: 1,
      repeat: 1,
      cooldown: 0,
      target: null,
      behavior: 'sight',
      kind: 'sight',
    });
  });
  spawnEnemies(counts.fast ?? 0, maze, Math.random, exclude, biasedSpawn, biasFrom).forEach((p) => {
    enemies.push({
      pos: p,
      visible: true,
      interval: 1,
      repeat: 2,
      cooldown: 0,
      target: null,
      behavior: 'smart',
      kind: 'fast',
    });
  });
  return enemies;
}
