import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { wallSet, canMove, getHitWall, nextPosition } from './utils';
import { loadMaze } from './loadMaze';
import type { MazeData, Vec2, Dir } from '@/src/types/maze';

// Maze データを読み込み Set 化
const rawMaze = loadMaze();
const maze = {
  ...rawMaze,
  v_walls: wallSet(rawMaze.v_walls),
  h_walls: wallSet(rawMaze.h_walls),
} as MazeData & { v_walls: Set<string>; h_walls: Set<string> };

export interface GameState {
  pos: Vec2;
  steps: number;
  bumps: number;
  path: Vec2[];
  hitV: Set<string>;
  hitH: Set<string>;
}

const initialState: GameState = {
  pos: { x: maze.start[0], y: maze.start[1] },
  steps: 0,
  bumps: 0,
  path: [{ x: maze.start[0], y: maze.start[1] }],
  hitV: new Set(),
  hitH: new Set(),
};

type Action = { type: 'reset' } | { type: 'move'; dir: Dir };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'reset':
      return {
        ...initialState,
        hitV: new Set(),
        hitH: new Set(),
      };
    case 'move': {
      const { pos } = state;
      const next = nextPosition(pos, action.dir);
      if (!canMove(pos, action.dir, maze)) {
        const hit = getHitWall(pos, action.dir, maze);
        const hitV = new Set(state.hitV);
        const hitH = new Set(state.hitH);
        if (hit) {
          if (hit.kind === 'v') hitV.add(hit.key);
          else hitH.add(hit.key);
        }
        return { ...state, bumps: state.bumps + 1, hitV, hitH };
      }
      return {
        pos: next,
        steps: state.steps + 1,
        bumps: state.bumps,
        path: [...state.path, next],
        hitV: state.hitV,
        hitH: state.hitH,
      };
    }
  }
}

const GameContext = createContext<
  | { state: GameState; move: (dir: Dir) => boolean; reset: () => void; maze: MazeData }
  | undefined
>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  // 移動が成功したかどうかを返すように改良
  const move = (dir: Dir): boolean => {
    const success = canMove(state.pos, dir, maze);
    dispatch({ type: 'move', dir });
    return success;
  };
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
