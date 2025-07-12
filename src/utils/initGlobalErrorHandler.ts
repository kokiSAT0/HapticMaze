import { ErrorUtils } from 'react-native';

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
    console.error('Unhandled Error', error);
    showSnackbar('予期せぬエラーが発生しました');
    defaultHandler(error, isFatal);
  });
}
