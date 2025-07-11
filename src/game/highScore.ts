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
export interface HighScoreOptions {
  showError?: (msg: string) => void;
}

export async function loadHighScore(
  levelId: string,
  opts?: HighScoreOptions,
): Promise<HighScore | null> {
  try {
    const json = await AsyncStorage.getItem(PREFIX + levelId);
    return json ? (JSON.parse(json) as HighScore) : null;
  } catch (e) {
    console.error('loadHighScore error', e);
    opts?.showError?.('ハイスコアを読み込めませんでした');
    return null;
  }
}

/**
 * ハイスコアを保存する非同期関数。
 */
export async function saveHighScore(
  levelId: string,
  score: HighScore,
  opts?: HighScoreOptions,
): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + levelId, JSON.stringify(score));
  } catch (e) {
    console.error('saveHighScore error', e);
    opts?.showError?.('ハイスコアを保存できませんでした');
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

/**
 * 全レベルのハイスコアを削除する補助関数。
 * LEVELS から取得した ID を使いまとめて削除する。
 */
export async function clearAllHighScores(
  levelIds: string[],
  opts?: HighScoreOptions,
): Promise<void> {
  try {
    const keys = levelIds.map((id) => PREFIX + id);
    await AsyncStorage.multiRemove(keys);
  } catch (e) {
    console.error('clearAllHighScores error', e);
    opts?.showError?.('ハイスコアを削除できませんでした');
  }
}
