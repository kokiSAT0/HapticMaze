import { useReducer } from 'react';
import mazeData from '@/assets/mazes/maze001.json';

export interface MazeData {
  id: string;
  size: number;
  start: [number, number];
  goal: [number, number];
  v_walls: [number, number][];
  h_walls: [number, number][];
}

export type Direction = 'up' | 'down' | 'left' | 'right';

interface GameState {
  player: [number, number];
  steps: number;
  bumps: number;
  path: [number, number][]; // 移動履歴。MiniMap 用に保存しておく
  maze: MazeData;
}

type GameAction =
  | { type: 'reset' }
  | { type: 'move'; direction: Direction };

const maze: MazeData = mazeData as MazeData;

const initialState: GameState = {
  player: maze.start,
  steps: 0,
  bumps: 0,
  path: [maze.start],
  maze,
};

function hasWall(
  mz: MazeData,
  from: [number, number],
  to: [number, number]
): boolean {
  if (to[0] < 0 || to[0] >= mz.size || to[1] < 0 || to[1] >= mz.size) {
    return true;
  }
  if (from[0] !== to[0]) {
    const x = Math.min(from[0], to[0]);
    const y = from[1];
    return mz.v_walls.some(([wx, wy]) => wx === x && wy === y);
  }
  if (from[1] !== to[1]) {
    const x = from[0];
    const y = Math.min(from[1], to[1]);
    return mz.h_walls.some(([wx, wy]) => wx === x && wy === y);
  }
  return false;
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'reset':
      return { ...state, player: state.maze.start, steps: 0, bumps: 0, path: [state.maze.start] };
    case 'move': {
      let next: [number, number] = state.player;
      if (action.direction === 'up') next = [state.player[0], state.player[1] - 1];
      if (action.direction === 'down') next = [state.player[0], state.player[1] + 1];
      if (action.direction === 'left') next = [state.player[0] - 1, state.player[1]];
      if (action.direction === 'right') next = [state.player[0] + 1, state.player[1]];
      if (hasWall(state.maze, state.player, next)) {
        return { ...state, bumps: state.bumps + 1 };
      }
      return {
        ...state,
        player: next,
        steps: state.steps + 1,
        path: [...state.path, next],
      };
    }
    default:
      return state;
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const move = (direction: Direction) => dispatch({ type: 'move', direction });
  const reset = () => dispatch({ type: 'reset' });

  return { state, move, reset };
}
