import { logError } from './errorLogger';

/**
 * Promise の未処理拒否を捕捉するハンドラを登録します。
 *
 * @param showSnackbar ユーザーへ通知するための関数
 */
export function initUnhandledRejectionHandler(showSnackbar: (msg: string) => void) {
  // onunhandledrejection を持つグローバルオブジェクトとして型付け
  const g: typeof globalThis & {
    onunhandledrejection?: (event: PromiseRejectionEvent) => void;
  } = global;

  const original: typeof g.onunhandledrejection = g.onunhandledrejection;
  const handler: (event: PromiseRejectionEvent) => void = (event) => {
    // 未処理の Promise 拒否を記録しておく
    console.error('Unhandled Promise Rejection', event.reason);
    void logError('Unhandled Promise Rejection', event.reason);
    showSnackbar('予期せぬエラーが発生しました');
    if (typeof original === 'function') {
      original(event);
    }
  };

  g.onunhandledrejection = handler;
}
