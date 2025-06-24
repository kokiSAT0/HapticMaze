import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { wallSet, canMove, getHitWall, nextPosition } from './utils';
import { loadMaze } from './loadMaze';
import type { MazeData, Vec2, Dir } from '@/src/types/maze';

// rawMaze: JSON そのままのデータ
type MazeSets = MazeData & { v_walls: Set<string>; h_walls: Set<string> };

// MazeData から壁情報を Set 化して検索を高速にする
function prepMaze(m: MazeData): MazeSets {
  return {
    ...m,
    v_walls: wallSet(m.v_walls),
    h_walls: wallSet(m.h_walls),
  };
}

// ゲーム状態を表す型
export interface GameState {
  pos: Vec2;
  steps: number;
  bumps: number;
  path: Vec2[];
  hitV: Set<string>;
  hitH: Set<string>;
}

// Provider が保持する全体の状態
interface State extends GameState {
  mazeRaw: MazeData;
  maze: MazeSets;
}

// MazeData から初期状態を作成
function initState(m: MazeData): State {
  const maze = prepMaze(m);
  return {
    mazeRaw: m,
    maze,
    pos: { x: m.start[0], y: m.start[1] },
    steps: 0,
    bumps: 0,
    path: [{ x: m.start[0], y: m.start[1] }],
    hitV: new Set(),
    hitH: new Set(),
  };
}

// Reducer で使うアクション型
type Action =
  | { type: 'reset' }
  | { type: 'move'; dir: Dir }
  | { type: 'newMaze'; maze: MazeData };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'reset':
      // 同じ迷路で初期化
      return initState(state.mazeRaw);
    case 'newMaze':
      // 新しい迷路で初期化
      return initState(action.maze);
    case 'move': {
      const { pos, maze } = state;
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
        ...state,
        pos: next,
        steps: state.steps + 1,
        path: [...state.path, next],
      };
    }
  }
}

const GameContext = createContext<
  | {
      state: GameState;
      move: (dir: Dir) => boolean;
      reset: () => void;
      newGame: () => void;
      maze: MazeData;
    }
  | undefined
>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  // useReducer 第3引数を使って初期迷路を読み込む
  const [state, dispatch] = useReducer(reducer, loadMaze(), initState);

  // 移動処理: 壁に当たったかを返す
  const move = (dir: Dir): boolean => {
    const success = canMove(state.pos, dir, state.maze);
    dispatch({ type: 'move', dir });
    return success;
  };

  const reset = () => dispatch({ type: 'reset' });
  const newGame = () => dispatch({ type: 'newMaze', maze: loadMaze() });

  return (
    <GameContext.Provider value={{ state, move, reset, newGame, maze: state.mazeRaw }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame は GameProvider 内で利用してください');
  return ctx;
}
