import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HighScore {
  stage: number;
  steps: number;
  bumps: number;
}

const PREFIX = 'highscore:';

/**
 * ハイスコアを取得する非同期関数。
 * データが無い場合は null を返す。
 */
export async function loadHighScore(levelId: string): Promise<HighScore | null> {
  try {
    const json = await AsyncStorage.getItem(PREFIX + levelId);
    return json ? (JSON.parse(json) as HighScore) : null;
  } catch {
    // エラー時は null を返す
    return null;
  }
}

/**
 * ハイスコアを保存する非同期関数。
 */
export async function saveHighScore(levelId: string, score: HighScore): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + levelId, JSON.stringify(score));
  } catch {
    // 保存に失敗しても無視する
  }
}

/**
 * 新しいスコアが既存より良いかを判定するヘルパー。
 */
export function isBetterScore(oldScore: HighScore | null, newScore: HighScore): boolean {
  if (!oldScore) return true;
  if (newScore.stage > oldScore.stage) return true;
  if (newScore.stage < oldScore.stage) return false;
  if (newScore.steps < oldScore.steps) return true;
  if (newScore.steps > oldScore.steps) return false;
  return newScore.bumps < oldScore.bumps;
}
