import { useSnackbar } from '@/src/hooks/useSnackbar';
import { useCallback } from 'react';

/**
 * 例外発生時の共通処理を提供するカスタムフック。
 * メッセージを画面に表示し、詳細をコンソールへ出力します。
 */
export function useHandleError() {
  const { show } = useSnackbar();

  // useCallback でラップし、毎回新しい関数が生成されないようにする
  return useCallback(
    (message: string, error: unknown) => {
      console.error(message, error);
      show(message);
    },
    [show],
  );
}
