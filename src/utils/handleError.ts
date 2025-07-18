import { useSnackbar } from '@/src/hooks/useSnackbar';
import { useCallback } from 'react';
import { logError } from './errorLogger';
import { IS_TESTFLIGHT } from './appEnv';

// 環境変数 EXPO_PUBLIC_DEBUG_ERROR が 'true' のとき詳細を表示
const DEBUG_ERROR = process.env.EXPO_PUBLIC_DEBUG_ERROR === 'true';

/**
 * 例外発生時の共通処理を提供するカスタムフック。
 * メッセージを画面に表示し、詳細をコンソールへ出力します。
 */
export function useHandleError() {
  const { show } = useSnackbar();

  // useCallback でラップし、毎回新しい関数が生成されないようにする
  return useCallback(
    (message: string, error: unknown) => {
      // console.error で詳細を確認できるようにする
      console.error(message, error);
      // エラーログを保存して後から調査できるようにする
      void logError(message, error);
      // TestFlight もしくは DEBUG_ERROR のときは詳細エラーを含める
      const msg = IS_TESTFLIGHT || DEBUG_ERROR ? `${message}: ${String(error)}` : message;
      show(msg);
    },
    [show],
  );
}
