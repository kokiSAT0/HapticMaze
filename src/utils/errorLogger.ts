import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 保存するエラーログの型
 */
export interface ErrorLog {
  /** 発生時刻 (ミリ秒) */
  time: number;
  /** ユーザー向けメッセージ */
  message: string;
  /** 詳細エラー文字列 */
  error: string;
}

const LOG_KEY = 'errorLogs';
const MAX_LOGS = 50;

/**
 * エラーログを追記する関数
 */
// runOnJS から呼び出せるよう関数式で定義
export const logError = async (message: string, error: unknown) => {
  try {
    const json = await AsyncStorage.getItem(LOG_KEY);
    const logs: ErrorLog[] = json ? JSON.parse(json) : [];
    logs.push({ time: Date.now(), message, error: String(error) });
    if (logs.length > MAX_LOGS) logs.splice(0, logs.length - MAX_LOGS);
    await AsyncStorage.setItem(LOG_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('logError error', e);
  }
};

/**
 * 全エラーログを取得する
 */
export async function getErrorLogs(): Promise<ErrorLog[]> {
  try {
    const json = await AsyncStorage.getItem(LOG_KEY);
    return json ? (JSON.parse(json) as ErrorLog[]) : [];
  } catch (e) {
    console.error('getErrorLogs error', e);
    return [];
  }
}

/**
 * エラーログを削除する
 */
export async function clearErrorLogs() {
  try {
    await AsyncStorage.removeItem(LOG_KEY);
  } catch (e) {
    console.error('clearErrorLogs error', e);
  }
}
