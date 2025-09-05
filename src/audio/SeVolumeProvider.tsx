import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHandleError } from '@/src/utils/handleError';
import { useLocale } from '@/src/locale/LocaleContext';

interface SeVolumeContextValue {
  volume: number;
  setVolume: (v: number) => void;
}

const SeVolumeContext = createContext<SeVolumeContextValue | undefined>(undefined);
// 音量保存用のキー
const STORAGE_KEY = 'seVolume';

export function SeVolumeProvider({ children }: { children: ReactNode }) {
  // デフォルト音量は 5(0.5) に設定
  const [volume, setVolume] = useState(0.5);
  const handleError = useHandleError();
  // 翻訳関数 t を取得
  const { t } = useLocale();

  // 初期表示時に保存済みの音量を読み込む
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored !== null) setVolume(Number(stored));
      } catch (e) {
        // SE 音量の読み込みに失敗した場合は翻訳メッセージを表示
        handleError(t('loadSeVolumeFailure'), e);
      }
    })();
  }, [handleError, t]);

  // 音量変更時は値を保存する
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, String(volume));
      } catch (e) {
        // SE 音量の保存に失敗した場合は翻訳メッセージを表示
        handleError(t('saveSeVolumeFailure'), e);
      }
    })();
  }, [volume, handleError, t]);

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
