import React, { ReactNode, createContext, useContext, useReducer } from 'react';
import { maze } from '@/src/game/mazeData';
import { canMove, dirOffset } from '@/src/game/utils';
import { Dir, MazeData, Vec2 } from '@/src/types/maze';

interface GameState {
  pos: Vec2;
  steps: number;
  bumps: number;
  path: Vec2[];
}

type GameAction = { type: 'move'; dir: Dir } | { type: 'reset' };

const initialPos: Vec2 = { x: maze.start[0], y: maze.start[1] };

const initialState: GameState = {
  pos: initialPos,
  steps: 0,
  bumps: 0,
  path: [initialPos],
};

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'move': {
      if (canMove(state.pos, action.dir, maze as MazeData)) {
        const offset = dirOffset(action.dir);
        const newPos = { x: state.pos.x + offset.x, y: state.pos.y + offset.y };
        return {
          ...state,
          pos: newPos,
          steps: state.steps + 1,
          path: [...state.path, newPos],
        };
      }
      return { ...state, bumps: state.bumps + 1 };
    }
    case 'reset':
      return { ...initialState };
  }
}

interface GameContextValue {
  state: GameState;
  move: (dir: Dir) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const move = (dir: Dir) => dispatch({ type: 'move', dir });

  return React.createElement(
    GameContext.Provider,
    { value: { state, move } },
    children,
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('GameProvider が上位に必要です');
  return ctx;
}
