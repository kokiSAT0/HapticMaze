import { randomCell, allCells, biasedPickGoal, shouldChangeMap } from '../utils';
import { loadMaze } from '../loadMaze';
import type { MazeData } from '@/src/types/maze';
import type { EnemyCounts } from '@/src/types/enemy';
import { initState, State } from './core';

// ランダムなスタートとゴールを含む MazeData を作成するヘルパー
export function createFirstStage(
  base: MazeData,
  counts: EnemyCounts = { random: 0, slow: 0, sight: 0, fast: 0 },
  enemyPathLength: number = 4,
  playerPathLength: number = Infinity,
  wallLifetime: number = Infinity,
  enemyCountsFn?: (stage: number) => EnemyCounts,
  wallLifetimeFn?: (stage: number) => number,
  biasedSpawn: boolean = true,
  levelId?: string,
): State {
  const visited = new Set<string>();
  const start = randomCell(base.size);
  const candidates = allCells(base.size).filter(
    (c) => c.x !== start.x || c.y !== start.y,
  );
  const goal = biasedPickGoal(start, candidates);
  const maze: MazeData = {
    ...base,
    start: [start.x, start.y],
    goal: [goal.x, goal.y],
  };
  // ゴール到達数が盤面サイズと一致すれば最終ステージ
  const finalStage = visited.size + 1 === base.size * base.size;
  const stageCounts = enemyCountsFn ? enemyCountsFn(1) : counts;
  return initState(
    maze,
    1,
    visited,
    finalStage,
    undefined,
    undefined,
    stageCounts,
    enemyPathLength,
    playerPathLength,
    wallLifetime,
    enemyCountsFn,
    wallLifetimeFn,
    biasedSpawn,
    levelId,
  );
}

// 前ステージのゴールを次ステージのスタートに設定し、未使用マスから新たなゴールを選ぶ
export function nextStageState(state: State): State {
  const size = state.mazeRaw.size;
  const changeMap = shouldChangeMap(state.stage);
  const base = changeMap ? loadMaze(size) : state.mazeRaw;
  const start = { x: state.mazeRaw.goal[0], y: state.mazeRaw.goal[1] };
  const visited = new Set(state.visitedGoals);
  visited.add(`${start.x},${start.y}`);
  const cells = allCells(size).filter((c) => {
    const key = `${c.x},${c.y}`;
    if (c.x === start.x && c.y === start.y) return false;
    return !visited.has(key);
  });
  if (cells.length === 0) {
    return { ...state, finalStage: true };
  }
  const goal = biasedPickGoal(start, cells);
  const maze: MazeData = {
    ...base,
    start: [start.x, start.y],
    goal: [goal.x, goal.y],
  };
  const finalStage = visited.size + 1 === size * size;
  const hitV = changeMap ? new Map<string, number>() : new Map(state.hitV);
  const hitH = changeMap ? new Map<string, number>() : new Map(state.hitH);
  const nextWallLife = state.wallLifetimeFn?.(state.stage + 1) ?? state.wallLifetime;
  return initState(
    maze,
    state.stage + 1,
    visited,
    finalStage,
    hitV,
    hitH,
    state.enemyCountsFn ? state.enemyCountsFn(state.stage + 1) : state.enemyCounts,
    state.enemyPathLength,
    state.playerPathLength,
    nextWallLife,
    state.enemyCountsFn,
    state.wallLifetimeFn,
    state.biasedSpawn,
    state.levelId,
  );
}

// ゲームオーバー時に最初からやり直す処理
export function restartRun(state: State): State {
  return createFirstStage(
    state.mazeRaw,
    state.enemyCountsFn ? state.enemyCountsFn(1) : state.enemyCounts,
    state.enemyPathLength,
    state.playerPathLength,
    state.wallLifetime,
    state.enemyCountsFn,
    state.wallLifetimeFn,
    state.biasedSpawn,
    state.levelId,
  );
}
