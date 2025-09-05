import AsyncStorage from '@react-native-async-storage/async-storage';
// ロケール用の型をインポート
import { type MessageKey } from '@/src/locale/LocaleContext';

export interface HighScore {
  stage: number;
  steps: number;
  bumps: number;
}

// AsyncStorage に保存する際のキーの接頭辞
const PREFIX = 'highscore:';

/**
 * 各関数で共通的に利用するオプション
 * エラー表示用に翻訳キーを渡すコールバックを受け取る
 */
export interface HighScoreOptions {
  // `MessageKey` を受け取り呼び出し元で翻訳して表示する
  showError?: (key: MessageKey) => void;
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
    // 翻訳キーを渡してエラーメッセージを表示
    opts?.showError?.('loadHighScoreFailure');
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
    // 保存に失敗した場合も翻訳キーを返す
    opts?.showError?.('saveHighScoreFailure');
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
    // 削除失敗時のエラーも翻訳キーで通知
    opts?.showError?.('clearHighScoresFailure');
  }
}
