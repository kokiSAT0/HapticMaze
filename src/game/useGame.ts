import React, { createContext, useContext, useReducer, PropsWithChildren } from 'react';

interface Vec2 { x: number; y: number; }

interface GameState {
  pos: Vec2;
  steps: number;
  bumps: number;
  path: Vec2[];
}

const initialState: GameState = {
  pos: { x: 0, y: 0 },
  steps: 0,
  bumps: 0,
  path: [{ x: 0, y: 0 }],
};

type Action = { type: 'reset' };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'reset':
      return initialState;
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => {} });

export function GameProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return React.createElement(
    GameContext.Provider,
    { value: { state, dispatch } },
    children,
  );
}

export function useGame() {
  return useContext(GameContext);
}
