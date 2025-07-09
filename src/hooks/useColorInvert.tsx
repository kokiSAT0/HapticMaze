import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHandleError } from '@/src/utils/handleError';

interface ColorInvertContextValue {
  invert: boolean;
  toggle: () => void;
}

const STORAGE_KEY = 'invertColor';
const ColorInvertContext = createContext<ColorInvertContextValue | undefined>(undefined);

export function ColorInvertProvider({ children }: { children: ReactNode }) {
  const [invert, setInvert] = useState(false);
  const handleError = useHandleError();

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'true') setInvert(true);
      } catch (e) {
        handleError('反転設定の読み込みに失敗しました', e);
      }
    })();
  }, [handleError]);

  const toggle = async () => {
    const next = !invert;
    setInvert(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, String(next));
    } catch (e) {
      handleError('反転設定を保存できませんでした', e);
    }
  };

  return (
    <ColorInvertContext.Provider value={{ invert, toggle }}>
      {children}
    </ColorInvertContext.Provider>
  );
}

export function useColorInvert() {
  const ctx = useContext(ColorInvertContext);
  if (!ctx) throw new Error('useColorInvert は ColorInvertProvider 内で利用してください');
  return ctx;
}
