import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { canMove } from './utils';
import { loadMaze } from './loadMaze';
import type { MazeData, Dir } from '@/src/types/maze';
import {
  reducer,
  createFirstStage,
  type GameState,
  type Action,
  type NewGameOptions,
} from './state';

const GameContext = createContext<
  | {
      state: GameState;
      move: (dir: Dir) => boolean;
      reset: () => void;
      newGame: (options: NewGameOptions) => void;
      nextStage: () => void;
      resetRun: () => void;
      maze: MazeData;
    }
  | undefined
>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  // useReducer 第3引数を使って初期迷路を読み込む
  const [state, dispatch] = useReducer(
    reducer,
    loadMaze(10),
    (m) => createFirstStage(m, { size: 10 }),
  );

  const move = (dir: Dir): boolean => {
    const success = canMove(state.pos, dir, state.maze);
    dispatch({ type: 'move', dir });
    return success;
  };

  const send = (action: Action) => dispatch(action);

  const reset = () => send({ type: 'reset' });
  const newGame = (options: NewGameOptions) =>
    send({ type: 'newMaze', maze: loadMaze(options.size), options });
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
