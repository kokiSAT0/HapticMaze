import type { ErrorUtils as ErrorUtilsType } from 'react-native/Libraries/vendor/core/ErrorUtils';
import { logError } from './errorLogger';
import { IS_TESTFLIGHT } from './appEnv';

/**
 * グローバルエラーハンドラを登録する関数。
 * React コンポーネント外で発生した予期せぬ例外を捕捉し、
 * ユーザーへ簡易的なメッセージを表示します。
 *
 * @param showSnackbar スナックバー表示用の関数
 */
export function initGlobalErrorHandler(showSnackbar: (msg: string) => void) {
  // React Native が提供するグローバル ErrorUtils を取得
  const ErrorUtils = global.ErrorUtils as ErrorUtilsType;
  const defaultHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
    // 予期しないエラーをログに残す
    console.error('Unhandled Error', error);
    void logError('Unhandled Error', error);
    // テストフライトでは詳細を表示してデバッグを容易にする
    const msg = IS_TESTFLIGHT ? String(error) : '予期せぬエラーが発生しました';
    showSnackbar(msg);
    defaultHandler(error, isFatal);
  });
}
