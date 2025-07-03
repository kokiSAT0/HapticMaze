// reducer の move アクション用ヘルパー集

import { canMove, getHitWall, nextPosition } from '../maze';
import { updateEnemyPaths, decayHitMap, updatePlayerPath, inSight } from '../enemyAI';
import { getEnemyMover } from '../enemy';
import type { Dir } from '@/src/types/maze';
import type { State } from './core';
import type { Enemy } from '@/src/types/enemy';

/**
 * プレイヤーの移動処理を行う関数。
 * 進めない場合は壁衝突として記録する。
 */
export function handlePlayerMove(state: State, dir: Dir) {
  const next = nextPosition(state.pos, dir);
  let pos = state.pos;
  let steps = state.steps;
  let bumps = state.bumps;
  let hitV = decayHitMap(state.hitV);
  let hitH = decayHitMap(state.hitH);

  if (!canMove(state.pos, dir, state.maze)) {
    const hit = getHitWall(state.pos, dir, state.maze);
    hitV = new Map(hitV);
    hitH = new Map(hitH);
    if (hit) {
      if (hit.kind === 'v') hitV.set(hit.key, state.wallLifetime);
      else hitH.set(hit.key, state.wallLifetime);
    }
    bumps += 1;
  } else {
    pos = next;
    steps += 1;
  }

  return { pos, steps, bumps, hitV, hitH } as const;
}

/**
 * 全ての敵を1ターン進め、捕まったかどうか判定する。
 */
export function updateEnemies(state: State, playerPos: { x: number; y: number }) {
  const newVisited: Map<string, number>[] = [];
  const movedEnemies: Enemy[] = state.enemies.map((e, i) => {
    const mover = getEnemyMover(e.behavior ?? state.enemyBehavior);
    const visited = new Map(state.enemyVisited[i]);
    if (e.cooldown > 0) {
      let targetEnemy = e;
      if (e.behavior === 'sight' || e.behavior === 'smart') {
        // 視界チェックのみ行い、ターゲット更新
        if (inSight(e.pos, playerPos, state.maze)) {
          targetEnemy = { ...e, target: { ...playerPos } };
        }
      }
      newVisited.push(visited);
      return { ...targetEnemy, cooldown: e.cooldown - 1 };
    }
    let current = e;
    for (let r = 0; r < e.repeat; r++) {
      current = mover(current, state.maze, visited, playerPos);
      const key = `${current.pos.x},${current.pos.y}`;
      visited.set(key, (visited.get(key) ?? 0) + 1);
    }
    newVisited.push(visited);
    return { ...e, ...current, cooldown: e.interval - 1 };
  });

  const newPaths = updateEnemyPaths(
    state.enemyPaths,
    movedEnemies.map((e) => e.pos),
    state.enemyPathLength,
  );

  const caught = movedEnemies.some((e, i) => {
    const prev = state.enemies[i].pos;
    const cross =
      prev.x === playerPos.x &&
      prev.y === playerPos.y &&
      e.pos.x === state.pos.x &&
      e.pos.y === state.pos.y;
    const same = e.pos.x === playerPos.x && e.pos.y === playerPos.y;
    return same || cross;
  });

  return {
    enemies: movedEnemies,
    enemyVisited: newVisited,
    enemyPaths: newPaths,
    caught,
  } as const;
}

/**
 * プレイヤーの軌跡を必要に応じて更新する。
 */
export function updatePlayerPathIfMoved(state: State, newPos: { x: number; y: number }, steps: number) {
  return steps !== state.steps
    ? updatePlayerPath(state.path, newPos, state.playerPathLength)
    : state.path;
}

