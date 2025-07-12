import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useSnackbar } from '@/src/hooks/useSnackbar';
import { canMove } from './maze';
import { loadMaze } from './loadMaze';
import { saveGame } from './saveGame';
import type { MazeData, Dir } from '@/src/types/maze';
import type { NewGameOptions } from '@/src/types/game';
import {
  reducer,
  createFirstStage,
  type GameState,
  type Action,
  type State,
} from './state';

// 環境変数 EXPO_PUBLIC_START_AT_FINAL_STAGE が 'true' のとき
// ゲーム開始時に最終ステージまで一気に進める
const START_FINAL = process.env.EXPO_PUBLIC_START_AT_FINAL_STAGE === 'true';

const GameContext = createContext<
  | {
      state: GameState;
      move: (dir: Dir) => boolean;
      reset: () => void;
      newGame: (options?: NewGameOptions) => void;
      nextStage: () => void;
      resetRun: () => void;
      respawnEnemies: () => void;
      loadState: (s: State) => void;
      maze: MazeData;
    }
  | undefined
>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const { show: showSnackbar } = useSnackbar();
  // useReducer 第3引数を使って初期迷路を読み込む
  const [state, dispatch] = useReducer(reducer, loadMaze(10), createFirstStage);
  // 初回の useEffect 実行をスキップするためのフラグ
  const first = useRef(true);

  const move = useCallback(
    (dir: Dir): boolean => {
      const success = canMove(state.pos, dir, state.maze);
      dispatch({ type: 'move', dir });
      return success;
    },
    [state.pos, state.maze]
  );

  const send = useCallback((action: Action) => dispatch(action), [dispatch]);

  const reset = useCallback(() => send({ type: 'reset' }), [send]);
  const newGame = useCallback(
    (options: NewGameOptions = {}) => {
      const {
        size = 10,
        counts,
        enemyPathLength,
        playerPathLength,
        wallLifetime,
        enemyCountsFn,
        wallLifetimeFn,
        showAdjacentWalls,
        showAdjacentWallsFn,
        biasedSpawn,
        biasedGoal,
        levelId,
        stagePerMap,
        respawnMax,
      } = options;
      send({
        type: 'newMaze',
        maze: loadMaze(size),
        counts,
        enemyPathLength,
        playerPathLength,
        wallLifetime,
        enemyCountsFn,
        wallLifetimeFn,
        showAdjacentWalls,
        showAdjacentWallsFn,
        biasedSpawn,
        biasedGoal,
        levelId,
        stagePerMap,
        respawnMax,
      });
      // フラグが有効なら最終ステージまで進める
      if (START_FINAL) {
        const total = size * size;
        for (let i = 1; i < total; i++) {
          send({ type: 'nextStage' });
        }
      }
    },
    [send]
  );
  const nextStage = useCallback(() => send({ type: 'nextStage' }), [send]);
  const resetRun = useCallback(() => send({ type: 'resetRun' }), [send]);
  const respawnEnemies = useCallback(
    () => send({ type: 'respawnEnemies', playerPos: state.pos }),
    [send, state.pos]
  );
  const loadState = useCallback((s: State) => send({ type: 'load', state: s }), [send]);

  // 状態が変化するたび自動保存するが、初回だけはスキップする
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // ステージ 1 で手数が 0 のときはセーブ不要なので保存処理をしない
    if (
      state.stage === 1 &&
      state.steps === 0 &&
      state.totalSteps === 0
    ) {
      return;
    }
    saveGame(state, { showError: showSnackbar });
  }, [state, showSnackbar]);

  const value = useMemo(
    () => ({
      state,
      move,
      reset,
      newGame,
      maze: state.mazeRaw,
      nextStage,
      resetRun,
      respawnEnemies,
      loadState,
    }),
    [state, move, reset, newGame, nextStage, resetRun, respawnEnemies, loadState]
  );

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame は GameProvider 内で利用してください');
  return ctx;
}
