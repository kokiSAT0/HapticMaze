import { handleMoveAction } from './moveHandlers';
import type { Dir, MazeData } from '@/src/types/maze';
import type { NewGameOptions } from '@/src/types/game';
import { initState, State } from './core';
import { createFirstStage, nextStageState, restartRun } from './stage';
import { createEnemies } from './enemy';

// Reducer で使うアクション型
export type Action =
  | { type: 'reset' }
  | { type: 'move'; dir: Dir }
  | { type: 'load'; state: State }
  | ({ type: 'newMaze'; maze: MazeData } & NewGameOptions)
  | { type: 'nextStage' }
  | { type: 'resetRun' }
  | { type: 'respawnEnemies'; playerPos: { x: number; y: number } };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'reset':
      return initState(
        state.mazeRaw,
        state.stage,
        new Set(state.visitedGoals),
        state.finalStage,
        {
          counts: state.enemyCounts,
          enemyPathLength: state.enemyPathLength,
          playerPathLength: state.playerPathLength,
          wallLifetime: state.wallLifetime,
          enemyCountsFn: state.enemyCountsFn,
          wallLifetimeFn: state.wallLifetimeFn,
          showAdjacentWalls: state.showAdjacentWalls,
          showAdjacentWallsFn: state.showAdjacentWallsFn,
          biasedSpawn: state.biasedSpawn,
          biasedGoal: state.biasedGoal,
          levelId: state.levelId,
          stagePerMap: state.stagePerMap,
          respawnMax: state.respawnMax,
        },
        undefined,
        undefined,
        state.respawnStock,
        state.totalSteps,
        state.totalBumps,
      );
    case 'newMaze':
      return createFirstStage(action.maze, {
        counts: action.counts ?? state.enemyCounts,
        enemyPathLength: action.enemyPathLength ?? state.enemyPathLength,
        playerPathLength: action.playerPathLength ?? state.playerPathLength,
        wallLifetime: action.wallLifetime ?? state.wallLifetime,
        enemyCountsFn: action.enemyCountsFn,
        wallLifetimeFn: action.wallLifetimeFn,
        biasedSpawn: action.biasedSpawn ?? state.biasedSpawn,
        levelId: action.levelId,
        stagePerMap: action.stagePerMap ?? state.stagePerMap,
        respawnMax: action.respawnMax ?? state.respawnMax,
        biasedGoal: action.biasedGoal ?? state.biasedGoal,
        // レベル設定に無い場合は周囲表示フラグをリセットする
        // undefined だと前回の値を引き継いでしまうため false を入れて初期化
        showAdjacentWalls: action.showAdjacentWalls ?? false,
        showAdjacentWallsFn: action.showAdjacentWallsFn,
      });
    case 'nextStage':
      return nextStageState(state);
    case 'resetRun':
      return restartRun(state);
    case 'respawnEnemies': {
      const enemies = createEnemies(
        state.enemyCounts,
        state.mazeRaw,
        state.biasedSpawn,
        action.playerPos,
      );
      return {
        ...state,
        enemies,
        enemyVisited: enemies.map((e) => new Map([[`${e.pos.x},${e.pos.y}`, 1]])),
        enemyPaths: enemies.map((e) => [{ ...e.pos }]),
        respawnStock: Math.max(state.respawnStock - 1, 0),
      };
    }
    case 'move': {
      return handleMoveAction(state, action.dir);
    }
    case 'load':
      return action.state;
  }
}

export type { GameState, State } from './core';
