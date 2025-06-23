import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { wallSet, canMove } from './utils';
import { loadMaze } from './loadMaze';
import type { MazeData, Vec2, Dir } from '@/src/types/maze';

// Maze データを読み込み Set 化
const rawMaze = loadMaze();
const maze: MazeData & { v_walls: Set<string>; h_walls: Set<string> } = {
  ...rawMaze,
  v_walls: wallSet(rawMaze.v_walls),
  h_walls: wallSet(rawMaze.h_walls),
};

export interface GameState {
  pos: Vec2;
  steps: number;
  bumps: number;
  path: Vec2[];
}

const initialState: GameState = {
  pos: { x: maze.start[0], y: maze.start[1] },
  steps: 0,
  bumps: 0,
  path: [{ x: maze.start[0], y: maze.start[1] }],
};

type Action = { type: 'reset' } | { type: 'move'; dir: Dir };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'reset':
      return { ...initialState };
    case 'move': {
      const { pos } = state;
      const next: Vec2 = { x: pos.x, y: pos.y };
      if (action.dir === 'Up') next.y -= 1;
      if (action.dir === 'Down') next.y += 1;
      if (action.dir === 'Left') next.x -= 1;
      if (action.dir === 'Right') next.x += 1;
      if (!canMove(pos, action.dir, maze)) {
        return { ...state, bumps: state.bumps + 1 };
      }
      return {
        pos: next,
        steps: state.steps + 1,
        bumps: state.bumps,
        path: [...state.path, next],
      };
    }
  }
}

const GameContext = createContext<
  | { state: GameState; move: (dir: Dir) => void; reset: () => void; maze: MazeData }
  | undefined
>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const move = (dir: Dir) => dispatch({ type: 'move', dir });
  const reset = () => dispatch({ type: 'reset' });
  return (
    <GameContext.Provider value={{ state, move, reset, maze: rawMaze }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame は GameProvider 内で利用してください');
  return ctx;
}
