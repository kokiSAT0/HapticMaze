import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { canMove } from './utils';
import { loadMaze } from './loadMaze';
import type { MazeData, Dir } from '@/src/types/maze';
import type { EnemyCounts } from '@/src/types/enemy';
import {
  reducer,
  createFirstStage,
  type GameState,
  type Action,
} from './state';

const GameContext = createContext<
  | {
      state: GameState;
      move: (dir: Dir) => boolean;
      reset: () => void;
      newGame: (
        size: number,
        counts?: EnemyCounts,
        enemyPathLength?: number,
        playerPathLength?: number,
        wallLifetime?: number,
        enemyCountsFn?: (stage: number) => EnemyCounts,
        wallLifetimeFn?: (stage: number) => number,
        biasedSpawn?: boolean,
        levelId?: string,
      ) => void;
      nextStage: () => void;
      resetRun: () => void;
      maze: MazeData;
    }
  | undefined
>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  // useReducer 第3引数を使って初期迷路を読み込む
  const [state, dispatch] = useReducer(reducer, loadMaze(10), createFirstStage);

  const move = (dir: Dir): boolean => {
    const success = canMove(state.pos, dir, state.maze);
    dispatch({ type: 'move', dir });
    return success;
  };

  const send = (action: Action) => dispatch(action);

  const reset = () => send({ type: 'reset' });
  const newGame = (
    size: number = 10,
    counts?: EnemyCounts,
    enemyPathLength?: number,
    playerPathLength?: number,
    wallLifetime?: number,
    enemyCountsFn?: (stage: number) => EnemyCounts,
    wallLifetimeFn?: (stage: number) => number,
    biasedSpawn?: boolean,
    levelId?: string,
  ) =>
    send({
      type: 'newMaze',
      maze: loadMaze(size),
      counts,
      enemyPathLength,
      playerPathLength,
      wallLifetime,
      enemyCountsFn,
      wallLifetimeFn,
      biasedSpawn,
      levelId,
    });
  const nextStage = () => send({ type: 'nextStage' });
  const resetRun = () => send({ type: 'resetRun' });

  return (
    <GameContext.Provider
      value={{ state, move, reset, newGame, maze: state.mazeRaw, nextStage, resetRun }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame は GameProvider 内で利用してください');
  return ctx;
}
