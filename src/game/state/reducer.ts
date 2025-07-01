import { canMove, getHitWall, nextPosition, updateEnemyPaths, updatePlayerPath, decayHitMap, inSight } from '../utils';
import { getEnemyMover } from '../enemy';
import type { Dir, MazeData } from '@/src/types/maze';
import { initState, State } from './core';
import { createFirstStage, nextStageState, restartRun, type NewGameOptions } from './stage';

// Reducer で使うアクション型
export type Action =
  | { type: 'reset' }
  | { type: 'move'; dir: Dir }
  | {
      type: 'newMaze';
      maze: MazeData;
      options: NewGameOptions;
    }
  | { type: 'nextStage' }
  | { type: 'resetRun' };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'reset':
      return initState(
        state.mazeRaw,
        state.stage,
        new Set(state.visitedGoals),
        state.finalStage,
        undefined,
        undefined,
        state.enemyCounts,
        state.enemyPathLength,
        state.playerPathLength,
        state.wallLifetime,
        state.enemyCountsFn,
        state.wallLifetimeFn,
        state.biasedSpawn,
        state.levelId,
      );
    case 'newMaze':
      return createFirstStage(action.maze, {
        size: action.options.size,
        counts: action.options.counts ?? state.enemyCounts,
        enemyPathLength: action.options.enemyPathLength ?? state.enemyPathLength,
        playerPathLength: action.options.playerPathLength ?? state.playerPathLength,
        wallLifetime: action.options.wallLifetime ?? state.wallLifetime,
        enemyCountsFn: action.options.enemyCountsFn,
        wallLifetimeFn: action.options.wallLifetimeFn,
        biasedSpawn: action.options.biasedSpawn ?? state.biasedSpawn,
        levelId: action.options.levelId,
      });
    case 'nextStage':
      return nextStageState(state);
    case 'resetRun':
      return restartRun(state);
    case 'move': {
      const { pos, maze, enemies } = state;
      const next = nextPosition(pos, action.dir);
      let newPos = pos;
      let steps = state.steps;
      let hitV = decayHitMap(state.hitV);
      let hitH = decayHitMap(state.hitH);
      let bumps = state.bumps;
      if (!canMove(pos, action.dir, maze)) {
        const hit = getHitWall(pos, action.dir, maze);
        hitV = new Map(hitV);
        hitH = new Map(hitH);
        if (hit) {
          if (hit.kind === 'v') hitV.set(hit.key, state.wallLifetime);
          else hitH.set(hit.key, state.wallLifetime);
        }
        bumps += 1;
      } else {
        newPos = next;
        steps += 1;
      }

      const newVisited: Map<string, number>[] = [];
      const movedEnemies = enemies.map((e, i) => {
        const mover = getEnemyMover(e.behavior ?? state.enemyBehavior);
        const visited = new Map(state.enemyVisited[i]);
        if (e.cooldown > 0) {
          let targetEnemy = e;
          if (e.behavior === 'sight' || e.behavior === 'smart') {
            // 視認のみ行って target を更新する
            if (inSight(e.pos, newPos, maze)) {
              targetEnemy = { ...e, target: { ...newPos } };
            }
          }
          newVisited.push(visited);
          return { ...targetEnemy, cooldown: e.cooldown - 1 };
        }
        let current = e;
        for (let r = 0; r < e.repeat; r++) {
          current = mover(current, maze, visited, newPos);
          const key = `${current.pos.x},${current.pos.y}`;
          visited.set(key, (visited.get(key) ?? 0) + 1);
        }
        newVisited.push(visited);
        return {
          ...e,
          ...current,
          cooldown: e.interval - 1,
        };
      });

      const newPaths = updateEnemyPaths(
        state.enemyPaths,
        movedEnemies.map((e) => e.pos),
        state.enemyPathLength,
      );

      const caught = movedEnemies.some((e, i) => {
        const prev = enemies[i].pos;
        const cross =
          prev.x === newPos.x &&
          prev.y === newPos.y &&
          e.pos.x === pos.x &&
          e.pos.y === pos.y;
        const same = e.pos.x === newPos.x && e.pos.y === newPos.y;
        return same || cross;
      });

      return {
        ...state,
        pos: newPos,
        steps,
        bumps,
        path:
          steps !== state.steps
            ? updatePlayerPath(state.path, newPos, state.playerPathLength)
            : state.path,
        hitV,
        hitH,
        enemies: movedEnemies,
        enemyVisited: newVisited,
        enemyPaths: newPaths,
        caught,
      };
    }
  }
}

export type { GameState, State } from './core';
