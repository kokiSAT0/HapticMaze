// reducer の move アクション用ヘルパー集

import { canMove, getHitWall, nextPosition } from '../maze';
import { updateEnemyPaths, decayHitMap, updatePlayerPath, inSight } from '../enemyAI';
import { getEnemyMover } from '../enemy';
import type { Dir } from '@/src/types/maze';
import type { State } from './core';
import { addAdjacentWalls } from './utils';
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
      const updateLife = (map: Map<string, number>, key: string) => {
        const current = map.get(key);
        // 既に登録されている寿命より長い場合のみ上書きする
        const nextLife =
          current === Infinity || state.wallLifetime === Infinity
            ? Infinity
            : Math.max(current ?? 0, state.wallLifetime);
        map.set(key, nextLife);
      };
      if (hit.kind === 'v') updateLife(hitV, hit.key);
      else updateLife(hitH, hit.key);
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
// プレイヤーが移動する前と後の座標を受け取り、
// 移動前に見えていた位置を記録できるようにする
export function updateEnemies(
  state: State,
  playerPos: { x: number; y: number },
  prevPlayerPos?: { x: number; y: number },
) {
  const newVisited: Map<string, number>[] = [];
  const movedEnemies: Enemy[] = state.enemies.map((e, i) => {
    const mover = getEnemyMover(e.behavior ?? state.enemyBehavior);
    const visited = new Map(state.enemyVisited[i]);
    // 移動前のプレイヤー位置が見えていればその座標を記録する
    // 移動後も見えていればそちらを優先する
    let current: Enemy = e;
    if (e.behavior === 'sight' || e.behavior === 'smart') {
      if (prevPlayerPos && inSight(e.pos, prevPlayerPos, state.maze)) {
        current = { ...current, target: { ...prevPlayerPos } };
      }
      if (inSight(e.pos, playerPos, state.maze)) {
        current = { ...current, target: { ...playerPos } };
      }
    }

    if (e.cooldown > 0) {
      newVisited.push(visited);
      return { ...current, cooldown: e.cooldown - 1 };
    }

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

/**
 * move アクションのまとめ役。プレイヤーの移動と敵の行動更新を行い、
 * 新しい状態オブジェクトを返す。
 */
export function handleMoveAction(state: State, dir: Dir): State {
  const player = handlePlayerMove(state, dir);
  // updateEnemies へは移動前の座標も渡す
  const enemyResult = updateEnemies(state, player.pos, state.pos);
  const stepDiff = player.steps - state.steps;
  const bumpDiff = player.bumps - state.bumps;
  // 周囲表示が有効なら現在位置の壁を記録する
  const adj = state.showAdjacentWalls
    ? addAdjacentWalls(
        player.pos,
        state.maze,
        player.hitV,
        player.hitH,
        state.playerAdjacentLife,
      )
    : { hitV: player.hitV, hitH: player.hitH };

  // 敵周囲の壁も同様に記録する
  const enemyAdj = state.showAdjacentWalls
    ? enemyResult.enemies.reduce(
        (acc, e) =>
          addAdjacentWalls(
            e.pos,
            state.maze,
            acc.hitV,
            acc.hitH,
            state.enemyAdjacentLife,
          ),
        { hitV: adj.hitV, hitH: adj.hitH },
      )
    : adj;

  return {
    ...state,
    pos: player.pos,
    steps: player.steps,
    bumps: player.bumps,
    totalSteps: state.totalSteps + stepDiff,
    totalBumps: state.totalBumps + bumpDiff,
    path: updatePlayerPathIfMoved(state, player.pos, player.steps),
    hitV: enemyAdj.hitV,
    hitH: enemyAdj.hitH,
    enemies: enemyResult.enemies,
    enemyVisited: enemyResult.enemyVisited,
    enemyPaths: enemyResult.enemyPaths,
    caught: enemyResult.caught,
  };
}


