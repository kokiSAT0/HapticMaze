import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface BgmContextValue {
  volume: number;
  setVolume: (v: number) => void;
  pause: () => void;
  resume: () => void;
  /** 再生する BGM を変更する */
  change: (file: number) => void;
  ready: boolean;
}

const BgmContext = createContext<BgmContextValue | undefined>(undefined);

export function BgmProvider({ children }: { children: ReactNode }) {
  const playerRef = useRef<AudioPlayer | null>(null);
  const [volume, setVolume] = useState(1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // volume は初期値だけ使用するため依存配列には含めない
    (async () => {
      await setAudioModeAsync({ playsInSilentMode: true });
      const p = createAudioPlayer(
        require("../../assets/sounds/降りしきる、白_調整.mp3")
      );
      p.loop = true;
      p.volume = volume;
      p.play();
      playerRef.current = p;
      setReady(true);
    })();
    return () => {
      playerRef.current?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (playerRef.current) playerRef.current.volume = volume;
  }, [volume]);

  const pause = () => {
    playerRef.current?.pause();
  };

  const resume = () => {
    if (playerRef.current?.paused) playerRef.current.play();
  };

  const change = (file: number) => {
    if (playerRef.current) {
      playerRef.current.remove();
    }
    const p = createAudioPlayer(file);
    p.loop = true;
    p.volume = volume;
    p.play();
    playerRef.current = p;
  };

  return (
    <BgmContext.Provider value={{ volume, setVolume, pause, resume, change, ready }}>
      {children}
    </BgmContext.Provider>
  );
}

export function useBgm() {
  const ctx = useContext(BgmContext);
  if (!ctx) throw new Error("useBgm は BgmProvider 内で利用してください");
  return ctx;
}
