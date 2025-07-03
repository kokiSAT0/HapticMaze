import { handleMoveAction } from './moveHandlers';
import type { Dir, MazeData } from '@/src/types/maze';
import type { EnemyCounts } from '@/src/types/enemy';
import { initState, State } from './core';
import { createFirstStage, nextStageState, restartRun } from './stage';

// Reducer で使うアクション型
export type Action =
  | { type: 'reset' }
  | { type: 'move'; dir: Dir }
  | {
      type: 'newMaze';
      maze: MazeData;
      counts?: EnemyCounts;
      enemyPathLength?: number;
      playerPathLength?: number;
      wallLifetime?: number;
      enemyCountsFn?: (stage: number) => EnemyCounts;
      wallLifetimeFn?: (stage: number) => number;
      biasedSpawn?: boolean;
      levelId?: string;
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
      return createFirstStage(
        action.maze,
        action.counts ?? state.enemyCounts,
        action.enemyPathLength ?? state.enemyPathLength,
        action.playerPathLength ?? state.playerPathLength,
        action.wallLifetime ?? state.wallLifetime,
        action.enemyCountsFn,
        action.wallLifetimeFn,
        action.biasedSpawn ?? state.biasedSpawn,
        action.levelId,
      );
    case 'nextStage':
      return nextStageState(state);
    case 'resetRun':
      return restartRun(state);
    case 'move': {
      return handleMoveAction(state, action.dir);
    }
  }
}

export type { GameState, State } from './core';
