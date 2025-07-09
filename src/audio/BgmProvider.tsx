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
import { useHandleError } from "@/src/utils/handleError";

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
  // 現在再生中の BGM ファイル番号を保持
  const currentFileRef = useRef<number | null>(null);
  const [volume, setVolume] = useState(1);
  const [ready, setReady] = useState(false);
  const handleError = useHandleError();

  // 一定時間待つためのユーティリティ
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  /**
   * 音量を段階的に変化させるヘルパー関数
   * @param player 対象プレイヤー
   * @param from   開始音量
   * @param to     終了音量
   * @param dur    フェードにかけるミリ秒
   */
  const fadeVolume = async (
    player: AudioPlayer,
    from: number,
    to: number,
    dur: number
  ) => {
    const steps = 10;
    const step = dur / steps;
    for (let i = 1; i <= steps; i++) {
      player.volume = from + ((to - from) * i) / steps;
      await wait(step);
    }
  };

  useEffect(() => {
    // マウント時は音声モードの設定だけを行い、BGM は再生しない
    (async () => {
      try {
        await setAudioModeAsync({ playsInSilentMode: true });
      } catch (e) {
        // 設定に失敗した場合はユーザーへ通知し詳細をログ出力
        handleError("オーディオ設定に失敗しました", e);
      } finally {
        setReady(true);
      }
    })();
    return () => {
      playerRef.current?.remove();
    };
  }, [handleError]);

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
      handleError("BGM の再生に失敗しました", e);
    }
  };

  const change = (file: number) => {
    const run = async () => {
      try {
        // 同じファイルなら再読み込みせずそのまま
        if (playerRef.current && currentFileRef.current === file) {
          if (playerRef.current.paused) playerRef.current.play();
          return;
        }

        if (playerRef.current) {
          // フェードアウト後に BGM を切り替える
          const orig = playerRef.current.volume;
          await fadeVolume(playerRef.current, orig, 0, 500);
          playerRef.current.replace(file);
          playerRef.current.loop = true;
          playerRef.current.volume = 0;
          playerRef.current.play();
          await fadeVolume(playerRef.current, 0, volume, 500);
        } else {
          // 初回のみプレイヤーを生成
          const p = createAudioPlayer(file);
          p.loop = true;
          p.volume = volume;
          p.play();
          playerRef.current = p;
        }
        currentFileRef.current = file;
      } catch (e) {
        // プレイヤー作成や再生でエラーが起きた場合の処理
        handleError("BGM の再生に失敗しました", e);
      }
    };

    run();
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
