import type { ErrorUtils as ErrorUtilsType } from 'react-native/Libraries/vendor/core/ErrorUtils';
import type { MessageKey } from '@/src/locale/LocaleContext';
import { logError } from './errorLogger';
import { IS_TESTFLIGHT } from './appEnv';

/**
 * グローバルエラーハンドラを登録する関数。
 * React コンポーネント外で発生した予期せぬ例外を捕捉し、
 * ユーザーへ簡易的なメッセージを表示します。
 *
 * @param showSnackbar スナックバー表示用の関数
 * @param t            翻訳関数。unexpectedError などの文言取得に使用
 */
export function initGlobalErrorHandler(
  showSnackbar: (msg: string) => void,
  t: (key: MessageKey) => string,
) {
  // React Native が提供するグローバル ErrorUtils を取得
  const ErrorUtils = global.ErrorUtils as ErrorUtilsType;
  const defaultHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
    // 予期しないエラーをログに残す
    console.error('Unhandled Error', error);
    void logError('Unhandled Error', error);
    // テストフライトでは詳細を表示してデバッグを容易にする
    const msg = IS_TESTFLIGHT ? String(error) : t('unexpectedError');
    showSnackbar(msg);
    defaultHandler(error, isFatal);
  });
}
