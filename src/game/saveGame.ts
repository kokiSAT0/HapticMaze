import AsyncStorage from '@react-native-async-storage/async-storage';
import { prepMaze } from './state/core';
import type { State } from './state';
import { LEVELS } from '@/constants/levels';

// 保存に使用するキー
const STORAGE_KEY = 'suspendData';

// JSON 化して保存するための型
export interface StoredState {
  mazeRaw: State['mazeRaw'];
  pos: State['pos'];
  steps: number;
  bumps: number;
  totalSteps?: number;
  totalBumps?: number;
  path: State['path'];
  hitV: [string, number | null][];
  hitH: [string, number | null][];
  enemies: State['enemies'];
  enemyVisited: [string, number][][];
  enemyPaths: State['enemyPaths'];
  caught: boolean;
  stage: number;
  visitedGoals: string[];
  finalStage: boolean;
  enemyBehavior: State['enemyBehavior'];
  enemyCounts: State['enemyCounts'];
  enemyPathLength: number | null;
  playerPathLength: number | null;
  wallLifetime: number | null;
  showAdjacentWalls: boolean;
  biasedSpawn: boolean;
  biasedGoal: boolean;
  levelId?: string;
  respawnStock: number;
  respawnMax: number;
  stagePerMap: number;
  /**
   * プレイヤー周囲壁の寿命。Infinity は null として保存
   * v1.2 以前のセーブデータでは存在しないことがある
   */
  playerAdjacentLife?: number | null;
  /**
   * 敵周囲壁の寿命。Infinity は null として保存
   * v1.2 以前のセーブデータでは存在しないことがある
   */
  enemyAdjacentLife?: number | null;
}

// State から保存用データへ変換
export function encodeState(state: State): StoredState {
  return {
    mazeRaw: state.mazeRaw,
    pos: state.pos,
    steps: state.steps,
    bumps: state.bumps,
    totalSteps: state.totalSteps,
    totalBumps: state.totalBumps,
    path: state.path,
    hitV: Array.from(state.hitV.entries()),
    hitH: Array.from(state.hitH.entries()),
    enemies: state.enemies,
    enemyVisited: state.enemyVisited.map((m) => Array.from(m.entries())),
    enemyPaths: state.enemyPaths,
    caught: state.caught,
    stage: state.stage,
    visitedGoals: Array.from(state.visitedGoals.values()),
    finalStage: state.finalStage,
    enemyBehavior: state.enemyBehavior,
    enemyCounts: state.enemyCounts,
    enemyPathLength: state.enemyPathLength,
    playerPathLength: state.playerPathLength,
    wallLifetime: state.wallLifetime,
    showAdjacentWalls: state.showAdjacentWalls,
    biasedSpawn: state.biasedSpawn,
    biasedGoal: state.biasedGoal,
    levelId: state.levelId,
    respawnStock: state.respawnStock,
    respawnMax: state.respawnMax,
    stagePerMap: state.stagePerMap,
    // Infinity は JSON.stringify 時に null になるため明示的に変換しない
    playerAdjacentLife: state.playerAdjacentLife,
    enemyAdjacentLife: state.enemyAdjacentLife,
  };
}

// 保存データから State を復元する
export function decodeState(data: StoredState): State {
  const level = LEVELS.find((l) => l.id === data.levelId);
  return {
    mazeRaw: data.mazeRaw,
    maze: prepMaze(data.mazeRaw),
    pos: data.pos,
    steps: data.steps,
    bumps: data.bumps,
    totalSteps: data.totalSteps ?? 0,
    totalBumps: data.totalBumps ?? 0,
    path: data.path,
    hitV: new Map(
      data.hitV.map(([k, v]) => [k, v === null ? Infinity : v]),
    ),
    hitH: new Map(
      data.hitH.map(([k, v]) => [k, v === null ? Infinity : v]),
    ),
    enemies: data.enemies,
    enemyVisited: data.enemyVisited.map((arr) => new Map(arr)),
    enemyPaths: data.enemyPaths,
    caught: data.caught,
    stage: data.stage,
    visitedGoals: new Set(data.visitedGoals),
    finalStage: data.finalStage,
    enemyBehavior: data.enemyBehavior,
    enemyCounts: data.enemyCounts,
    enemyCountsFn: level?.enemyCountsFn,
    enemyPathLength:
      data.enemyPathLength === null ? Infinity : data.enemyPathLength,
    playerPathLength:
      data.playerPathLength === null ? Infinity : data.playerPathLength,
    wallLifetime: data.wallLifetime === null ? Infinity : data.wallLifetime,
    showAdjacentWalls: data.showAdjacentWalls,
    wallLifetimeFn: level?.wallLifetimeFn,
    showAdjacentWallsFn: level?.showAdjacentWallsFn,
    biasedSpawn: data.biasedSpawn,
    biasedGoal: level?.biasedGoal ?? true,
    levelId: data.levelId,
    respawnStock: data.respawnStock,
    respawnMax: level?.respawnMax ?? data.respawnMax,
    stagePerMap: level?.stagePerMap ?? 3,
    // 値が null または undefined の場合は Infinity と解釈する
    playerAdjacentLife:
      data.playerAdjacentLife === null || data.playerAdjacentLife === undefined
        ? Infinity
        : data.playerAdjacentLife,
    enemyAdjacentLife:
      data.enemyAdjacentLife === null || data.enemyAdjacentLife === undefined
        ? Infinity
        : data.enemyAdjacentLife,
  };
}

// データを保存する
export interface SaveLoadOptions {
  showError?: (msg: string) => void;
}

export async function saveGame(state: State, opts?: SaveLoadOptions) {
  try {
    const data = encodeState(state);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('saveGame error', e);
    opts?.showError?.('セーブデータを保存できませんでした');
  }
}

// 保存データを読み込む
export async function loadGame(opts?: SaveLoadOptions): Promise<State | null> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return null;
    const data = JSON.parse(json) as StoredState;
    return decodeState(data);
  } catch (e) {
    console.error('loadGame error', e);
    opts?.showError?.('セーブデータの読み込みに失敗しました');
    return null;
  }
}

// 保存データを削除する
export async function clearGame(opts?: SaveLoadOptions) {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('clearGame error', e);
    opts?.showError?.('セーブデータを削除できませんでした');
  }
}
