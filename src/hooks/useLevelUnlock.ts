import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSnackbar } from '@/src/hooks/useSnackbar';

/**
 * レベルクリア状況を管理するフック。
 * オブジェクト形式でクリア済みレベルを保持する。
 */
interface UnlockMap {
  [levelId: string]: boolean;
}

const STORAGE_KEY = 'clearedLevels';

export function useLevelUnlock() {
  const { show: showSnackbar } = useSnackbar();
  const [unlocked, setUnlocked] = useState<UnlockMap>({});

  // 初回読み込み時に保存データを取得する
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) setUnlocked(JSON.parse(json) as UnlockMap);
      } catch (e) {
        console.error('load unlock error', e);
        showSnackbar('進行状況を読み込めませんでした');
      }
    })();
  }, [showSnackbar]);

  /**
   * レベルクリアを記録して永続化する。
   */
  const markCleared = useCallback(
    async (id: string) => {
      const next = { ...unlocked, [id]: true };
      setUnlocked(next);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('save unlock error', e);
        showSnackbar('進行状況を保存できませんでした');
      }
    },
    [unlocked, showSnackbar],
  );

  /**
   * 指定レベルがクリア済みかを返すヘルパー。
   */
  const isCleared = useCallback((id: string) => !!unlocked[id], [unlocked]);

  return { isCleared, markCleared } as const;
}
