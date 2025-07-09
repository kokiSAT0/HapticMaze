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
import { useSnackbar } from "@/src/hooks/useSnackbar";

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
  const { show: showSnackbar } = useSnackbar();

  useEffect(() => {
    // マウント時は音声モードの設定だけを行い、BGM は再生しない
    (async () => {
      try {
        await setAudioModeAsync({ playsInSilentMode: true });
      } catch (e) {
        // 設定に失敗した場合はユーザーへ通知し詳細をログ出力
        showSnackbar("オーディオ設定に失敗しました");
        console.error("setAudioModeAsync error", e);
      } finally {
        setReady(true);
      }
    })();
    return () => {
      playerRef.current?.remove();
    };
  }, [showSnackbar]);

  useEffect(() => {
    if (playerRef.current) playerRef.current.volume = volume;
  }, [volume]);

  const pause = () => {
    playerRef.current?.pause();
  };

  const resume = () => {
    try {
      // paused が true のときのみ再生を再開
      if (playerRef.current?.paused) playerRef.current.play();
    } catch (e) {
      // 再生に失敗した場合はユーザーへ知らせてログに残す
      showSnackbar("BGM の再生に失敗しました");
      console.error("BGM resume error", e);
    }
  };

  const change = (file: number) => {
    try {
      // 既にプレイヤーが存在する場合はソースだけを入れ替えることで
      // 新しいプレイヤーが増えないようにする
      if (playerRef.current) {
        playerRef.current.replace(file);
        playerRef.current.loop = true;
        playerRef.current.volume = volume;
        playerRef.current.play();
        return;
      }
      // 初回のみプレイヤーを生成
      const p = createAudioPlayer(file);
      p.loop = true;
      p.volume = volume;
      p.play();
      playerRef.current = p;
    } catch (e) {
      // プレイヤー作成や再生でエラーが起きた場合の処理
      showSnackbar("BGM の再生に失敗しました");
      console.error("BGM change error", e);
    }
  };

  return (
    <BgmContext.Provider
      value={{ volume, setVolume, pause, resume, change, ready }}
    >
      {children}
    </BgmContext.Provider>
  );
}

export function useBgm() {
  const ctx = useContext(BgmContext);
  if (!ctx) throw new Error("useBgm は BgmProvider 内で利用してください");
  return ctx;
}
