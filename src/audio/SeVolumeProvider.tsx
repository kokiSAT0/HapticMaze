import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface SeVolumeContextValue {
  volume: number;
  setVolume: (v: number) => void;
}

const SeVolumeContext = createContext<SeVolumeContextValue | undefined>(undefined);

export function SeVolumeProvider({ children }: { children: ReactNode }) {
  const [volume, setVolume] = useState(1);
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
