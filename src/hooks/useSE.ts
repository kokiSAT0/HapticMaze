import { useEffect, useRef, useState } from 'react';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

/**
 * 効果音(SE)を管理するためのフック。
 * `soundFile` には require した音声ファイルを渡します。
 */
export function useSE(soundFile: number) {
  // プレイヤーオブジェクトを保持する参照
  const playerRef = useRef<AudioPlayer | null>(null);
  // 音量を 0〜1 の範囲で管理
  const [volume, setVolume] = useState(1);

  // 初期化時に効果音を読み込む
  useEffect(() => {
    const p = createAudioPlayer(soundFile);
    p.volume = volume;
    playerRef.current = p;
    return () => {
      playerRef.current?.remove();
    };
    // soundFile は固定値として扱うため依存配列は空
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 音量変更時に実際のプレイヤーへ反映
  useEffect(() => {
    if (playerRef.current) playerRef.current.volume = volume;
  }, [volume]);

  /** 効果音を頭から再生する */
  const play = () => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(0);
    playerRef.current.play();
  };

  return { volume, setVolume, play } as const;
}
