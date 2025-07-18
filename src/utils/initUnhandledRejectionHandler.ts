import { logError } from './errorLogger';
import { IS_TESTFLIGHT } from './appEnv';

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
    // TestFlight では詳細も通知する
    const msg = IS_TESTFLIGHT
      ? String(event.reason)
      : '予期せぬエラーが発生しました';
    showSnackbar(msg);
    if (typeof original === 'function') {
      original(event);
    }
  };

  g.onunhandledrejection = handler;
}
