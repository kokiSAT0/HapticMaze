import { ErrorUtils } from 'react-native';
import { logError } from './errorLogger';

/**
 * グローバルエラーハンドラを登録する関数。
 * React コンポーネント外で発生した予期せぬ例外を捕捉し、
 * ユーザーへ簡易的なメッセージを表示します。
 *
 * @param showSnackbar スナックバー表示用の関数
 */
export function initGlobalErrorHandler(showSnackbar: (msg: string) => void) {
  const defaultHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
    // 予期しないエラーをログに残す
    console.error('Unhandled Error', error);
    void logError('Unhandled Error', error);
    showSnackbar('予期せぬエラーが発生しました');
    defaultHandler(error, isFatal);
  });
}
