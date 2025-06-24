import { createContext, useContext, useReducer, type ReactNode } from 'react';
import {
  wallSet,
  canMove,
  getHitWall,
  nextPosition,
  spawnEnemies,
  moveEnemyRandom,
} from './utils';
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
  enemies: Vec2[];
  /** 敵に捕まったとき true になる */
  caught: boolean;
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
    enemies: spawnEnemies(1, maze),
    caught: false,
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
      const { pos, maze, enemies } = state;
      const next = nextPosition(pos, action.dir);
      let newPos = pos;
      let steps = state.steps;
      let hitV = state.hitV;
      let hitH = state.hitH;
      let bumps = state.bumps;
      if (!canMove(pos, action.dir, maze)) {
        const hit = getHitWall(pos, action.dir, maze);
        hitV = new Set(state.hitV);
        hitH = new Set(state.hitH);
        if (hit) {
          if (hit.kind === 'v') hitV.add(hit.key);
          else hitH.add(hit.key);
        }
        bumps += 1;
      } else {
        newPos = next;
        steps += 1;
      }

      const movedEnemies = enemies.map((e) => moveEnemyRandom(e, maze));
      const caught = movedEnemies.some((e) => e.x === newPos.x && e.y === newPos.y);

      const newState: State = {
        ...state,
        pos: newPos,
        steps,
        bumps,
        path: steps !== state.steps ? [...state.path, newPos] : state.path,
        hitV,
        hitH,
        enemies: movedEnemies,
        caught,
      };
      return newState;
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
