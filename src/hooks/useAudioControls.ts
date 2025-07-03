import { useState } from 'react';
import { useBgm } from '@/src/hooks/useBgm';
import { useSE } from '@/src/hooks/useSE';

/**
 * BGM と SE の音量調整や再生をまとめて扱うフック。
 * Play 画面以外でも再利用できるよう独立させています。
 */
export function useAudioControls(soundFile: number) {
  const {
    volume: bgmVolume,
    setVolume: setBgmVolume,
    pause: pauseBgm,
    resume: resumeBgm,
  } = useBgm();
  const { volume: seVolume, setVolume: setSeVolume, play } = useSE(soundFile);

  // 効果音を再生したことを示すフラグ
  const [audioReady, setAudioReady] = useState(false);

  /** BGM 音量を 0.1 刻みで上げる */
  const incBgm = () =>
    setBgmVolume(Math.min(1, Math.round((bgmVolume + 0.1) * 10) / 10));
  /** BGM 音量を下げる */
  const decBgm = () =>
    setBgmVolume(Math.max(0, Math.round((bgmVolume - 0.1) * 10) / 10));
  /** SE 音量を上げる */
  const incSe = () =>
    setSeVolume((v) => Math.min(1, Math.round((v + 0.1) * 10) / 10));
  /** SE 音量を下げる */
  const decSe = () =>
    setSeVolume((v) => Math.max(0, Math.round((v - 0.1) * 10) / 10));

  /** 移動音を再生し audioReady を一時的に立てる */
  const playMoveSe = () => {
    play();
    setAudioReady(true);
    setTimeout(() => setAudioReady(false), 200);
  };

  return {
    bgmVolume,
    seVolume,
    incBgm,
    decBgm,
    incSe,
    decSe,
    playMoveSe,
    pauseBgm,
    resumeBgm,
    audioReady,
  } as const;
}
