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
  biasedSpawn: boolean;
  levelId?: string;
}

// State から保存用データへ変換
export function encodeState(state: State): StoredState {
  return {
    mazeRaw: state.mazeRaw,
    pos: state.pos,
    steps: state.steps,
    bumps: state.bumps,
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
    biasedSpawn: state.biasedSpawn,
    levelId: state.levelId,
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
    wallLifetimeFn: level?.wallLifetimeFn,
    biasedSpawn: data.biasedSpawn,
    levelId: data.levelId,
  };
}

// データを保存する
export async function saveGame(state: State) {
  try {
    const data = encodeState(state);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // 失敗時は無視
  }
}

// 保存データを読み込む
export async function loadGame(): Promise<State | null> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return null;
    const data = JSON.parse(json) as StoredState;
    return decodeState(data);
  } catch {
    return null;
  }
}

// 保存データを削除する
export async function clearGame() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // 失敗しても無視
  }
}
