import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHandleError } from '@/src/utils/handleError';

interface SeVolumeContextValue {
  volume: number;
  setVolume: (v: number) => void;
}

const SeVolumeContext = createContext<SeVolumeContextValue | undefined>(undefined);
// 音量保存用のキー
const STORAGE_KEY = 'seVolume';

export function SeVolumeProvider({ children }: { children: ReactNode }) {
  const [volume, setVolume] = useState(1);
  const handleError = useHandleError();

  // 初期表示時に保存済みの音量を読み込む
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored !== null) setVolume(Number(stored));
      } catch (e) {
        handleError('SE 音量を読み込めませんでした', e);
      }
    })();
  }, [handleError]);

  // 音量変更時は値を保存する
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, String(volume));
      } catch (e) {
        handleError('SE 音量を保存できませんでした', e);
      }
    })();
  }, [volume, handleError]);

  return (
    <SeVolumeContext.Provider value={{ volume, setVolume }}>
      {children}
    </SeVolumeContext.Provider>
  );
}

export function useSeVolume() {
  const ctx = useContext(SeVolumeContext);
  if (!ctx) throw new Error('useSeVolume は SeVolumeProvider 内で利用してください');
  return ctx;
}
