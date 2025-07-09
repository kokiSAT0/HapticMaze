import { useSnackbar } from '@/src/hooks/useSnackbar';

/**
 * 例外発生時の共通処理を提供するカスタムフック。
 * メッセージを画面に表示し、詳細をコンソールへ出力します。
 */
export function useHandleError() {
  const { show } = useSnackbar();

  return (message: string, error: unknown) => {
    console.error(message, error);
    show(message);
  };
}
