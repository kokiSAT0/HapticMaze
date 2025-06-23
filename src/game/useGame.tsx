import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import type { Vec2 } from '@/src/types/maze';

/**
 * GameState はプレイヤーの位置や手数を管理するデータ構造です。
 * 初心者向けに補足すると、オブジェクト型の一種であり
 * ゲーム進行に必要な数値をまとめて保持します。
 */
export interface GameState {
  pos: Vec2;
  steps: number;
  bumps: number;
  path: Vec2[];
}

/** 初期状態を定義します */
export const initialState: GameState = {
  pos: { x: 0, y: 0 },
  steps: 0,
  bumps: 0,
  path: [{ x: 0, y: 0 }],
};

/**
 * Reducer で扱うアクションの種類です。
 * type プロパティで処理を分岐します。
 */
export type GameAction =
  | { type: 'reset' }
  | { type: 'move'; next: Vec2; bumped: boolean };

/**
 * useReducer へ渡す純粋関数。状態とアクションから次の状態を返します。
 */
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'reset':
      return { ...initialState };
    case 'move':
      return {
        pos: action.next,
        steps: state.steps + (action.bumped ? 0 : 1),
        bumps: state.bumps + (action.bumped ? 1 : 0),
        path: [...state.path, action.next],
      };
    default:
      return state;
  }
}

/** useReducer をラップしたカスタムフック */
export function useGameReducer() {
  return useReducer(gameReducer, initialState);
}

export const GameContext = createContext<
  | { state: GameState; dispatch: Dispatch<GameAction> }
  | undefined
>(undefined);

/** Context Provider。ゲーム画面全体を囲む形で使用します */
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useGameReducer();
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

/** Context から状態と dispatch を取得するためのヘルパー */
export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame は GameProvider 内で利用してください');
  return ctx;
}
