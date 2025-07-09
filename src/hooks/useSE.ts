import { useEffect, useRef } from 'react';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { useSeVolume } from '@/src/audio/SeVolumeProvider';
import { useHandleError } from '@/src/utils/handleError';

/**
 * 効果音(SE)を管理するためのフック。
 * `soundFile` には require した音声ファイルを渡します。
 */
export function useSE(soundFile: number) {
  // プレイヤーオブジェクトを保持する参照
  const playerRef = useRef<AudioPlayer | null>(null);
  // グローバルな SE 音量を取得
  const { volume, setVolume } = useSeVolume();
  // ユーザーへメッセージを表示するための関数
  const handleError = useHandleError();

  // 初期化時に効果音を読み込む
  useEffect(() => {
    try {
      // 音声ファイルからプレイヤーを作成
      const p = createAudioPlayer(soundFile);
      p.volume = volume;
      playerRef.current = p;
    } catch (e) {
      // プレイヤー生成に失敗したらユーザーへ通知
      handleError("BGM の再生に失敗しました", e);
    }
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

  /**
   * 効果音を頭から再生する
   * @param vol 再生時に一時的に適用する音量。指定しない場合は現在の音量を利用
   */
  const play = (vol?: number) => {
    if (!playerRef.current) return;
    try {
      if (vol !== undefined) playerRef.current.volume = vol;
      playerRef.current.seekTo(0);
      playerRef.current.play();
    } catch (e) {
      // 再生に失敗した場合のエラーハンドリング
      handleError("BGM の再生に失敗しました", e);
    }
  };

  return { volume, setVolume, play } as const;
}
