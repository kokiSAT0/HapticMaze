import {
  randomCell,
  allCells,
  biasedPickGoal,
  shouldChangeMap,
} from '../maze';
import { loadMaze } from '../loadMaze';
import type { MazeData } from '@/src/types/maze';
import type { NewGameOptions } from '@/src/types/game';
import { initState, State } from './core';

// ランダムなスタートとゴールを含む MazeData を作成するヘルパー
export function createFirstStage(
  base: MazeData,
  options: NewGameOptions = {},
): State {
  const {
    counts = { random: 0, slow: 0, sight: 0, fast: 0 },
    enemyPathLength = 4,
    playerPathLength = Infinity,
    wallLifetime = Infinity,
    enemyCountsFn,
    wallLifetimeFn,
    biasedSpawn = true,
    levelId,
    stagePerMap = 3,
    respawnMax = 3,
    biasedGoal = true,
    showAdjacentWalls = false,
    showAdjacentWallsFn,
    playerAdjacentLife,
    enemyAdjacentLife,
  } = options;
  const visited = new Set<string>();
  const start = randomCell(base.size);
  const candidates = allCells(base.size).filter(
    (c) => c.x !== start.x || c.y !== start.y,
  );
  const goal = biasedGoal
    ? biasedPickGoal(start, candidates)
    : candidates[Math.floor(Math.random() * candidates.length)];
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
    {
      counts: stageCounts,
      enemyPathLength,
      playerPathLength,
      wallLifetime,
      enemyCountsFn,
      wallLifetimeFn,
      showAdjacentWalls: showAdjacentWallsFn ? showAdjacentWallsFn(1) : showAdjacentWalls,
      showAdjacentWallsFn,
      biasedSpawn,
      biasedGoal,
      levelId,
      stagePerMap,
      respawnMax,
      playerAdjacentLife,
      enemyAdjacentLife,
    },
    undefined,
    undefined,
    respawnMax,
    0,
    0,
  );
}

// 前ステージのゴールを次ステージのスタートに設定し、未使用マスから新たなゴールを選ぶ
export function nextStageState(state: State): State {
  const size = state.mazeRaw.size;
  const changeMap = shouldChangeMap(state.stage, state.stagePerMap);
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
  const goal = state.biasedGoal
    ? biasedPickGoal(start, cells)
    : cells[Math.floor(Math.random() * cells.length)];
  const maze: MazeData = {
    ...base,
    start: [start.x, start.y],
    goal: [goal.x, goal.y],
  };
  const finalStage = visited.size + 1 === size * size;
  const hitV = changeMap ? new Map<string, number>() : new Map(state.hitV);
  const hitH = changeMap ? new Map<string, number>() : new Map(state.hitH);
  const nextWallLife = state.wallLifetimeFn?.(state.stage + 1) ?? state.wallLifetime;
  const stock = Math.min(state.respawnStock + 1, state.respawnMax);
  return initState(
    maze,
    state.stage + 1,
    visited,
    finalStage,
    {
      counts: state.enemyCountsFn ? state.enemyCountsFn(state.stage + 1) : state.enemyCounts,
      enemyPathLength: state.enemyPathLength,
      playerPathLength: state.playerPathLength,
      wallLifetime: nextWallLife,
      enemyCountsFn: state.enemyCountsFn,
      wallLifetimeFn: state.wallLifetimeFn,
      showAdjacentWalls: state.showAdjacentWallsFn
        ? state.showAdjacentWallsFn(state.stage + 1)
        : state.showAdjacentWalls,
      showAdjacentWallsFn: state.showAdjacentWallsFn,
      biasedSpawn: state.biasedSpawn,
      biasedGoal: state.biasedGoal,
      levelId: state.levelId,
      stagePerMap: state.stagePerMap,
      respawnMax: state.respawnMax,
      playerAdjacentLife: state.playerAdjacentLife,
      enemyAdjacentLife: state.enemyAdjacentLife,
    },
    hitV,
    hitH,
    stock,
    state.totalSteps,
    state.totalBumps,
  );
}

// ゲームオーバー時に最初からやり直す処理
export function restartRun(state: State): State {
  return createFirstStage(state.mazeRaw, {
    counts: state.enemyCountsFn ? state.enemyCountsFn(1) : state.enemyCounts,
    enemyPathLength: state.enemyPathLength,
    playerPathLength: state.playerPathLength,
    wallLifetime: state.wallLifetime,
    enemyCountsFn: state.enemyCountsFn,
    wallLifetimeFn: state.wallLifetimeFn,
    biasedSpawn: state.biasedSpawn,
    levelId: state.levelId,
    stagePerMap: state.stagePerMap,
    respawnMax: state.respawnMax,
    biasedGoal: state.biasedGoal,
    showAdjacentWalls: state.showAdjacentWalls,
    showAdjacentWallsFn: state.showAdjacentWallsFn,
    playerAdjacentLife: state.playerAdjacentLife,
    enemyAdjacentLife: state.enemyAdjacentLife,
  });
}
