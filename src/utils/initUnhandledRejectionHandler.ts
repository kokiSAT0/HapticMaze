export function initUnhandledRejectionHandler(showSnackbar: (msg: string) => void) {
  const original = (global as any).onunhandledrejection;
  (global as any).onunhandledrejection = (event: PromiseRejectionEvent) => {
    console.error('Unhandled Promise Rejection', event.reason);
    showSnackbar('予期せぬエラーが発生しました');
    if (typeof original === 'function') original(event);
  };
}
