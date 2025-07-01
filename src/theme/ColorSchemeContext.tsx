import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ColorScheme = 'dark' | 'light';

// 設定を保存するためのキー
const STORAGE_KEY = 'colorScheme';

interface ColorSchemeContextValue {
  scheme: ColorScheme;
  toggleScheme: () => Promise<void>;
  setScheme: (s: ColorScheme) => Promise<void>;
}

const ColorSchemeContext = createContext<ColorSchemeContextValue | undefined>(undefined);

// カラースキームの状態を提供するコンポーネント
export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const [scheme, setSchemeState] = useState<ColorScheme>('dark');

  // 起動時に保存済みの設定を読み込む
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        setSchemeState(stored);
      }
    })();
  }, []);

  const setScheme = async (s: ColorScheme) => {
    setSchemeState(s);
    await AsyncStorage.setItem(STORAGE_KEY, s);
  };

  const toggleScheme = async () => {
    await setScheme(scheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ColorSchemeContext.Provider value={{ scheme, toggleScheme, setScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  );
}

// Context から状態を取得するカスタムフック
export function useAppColorScheme() {
  const ctx = useContext(ColorSchemeContext);
  if (!ctx) throw new Error('useAppColorScheme は ColorSchemeProvider 内で利用してください');
  return ctx;
}
