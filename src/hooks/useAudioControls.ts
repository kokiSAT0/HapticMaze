import { useState } from 'react';
import { useBgm } from '@/src/hooks/useBgm';
import { useSE } from '@/src/hooks/useSE';

/**
 * BGM と SE の音量調整や再生をまとめて扱うフック。
 * Play 画面以外でも再利用できるよう独立させています。
 */
export function useAudioControls(moveFile: number, bumpFile: number) {
  const {
    volume: bgmVolume,
    setVolume: setBgmVolume,
    pause: pauseBgm,
    resume: resumeBgm,
    change: changeBgm,
    ready: bgmReady,
  } = useBgm();
  const { volume: seVolume, setVolume: setSeVolume, play: playMove } =
    useSE(moveFile);
  const { play: playBump } = useSE(bumpFile);

  // 効果音を再生したことを示すフラグ
  const [audioReady, setAudioReady] = useState(false);

  /** BGM 音量を 0.1 刻みで上げる */
  const incBgm = () =>
    setBgmVolume(Math.min(1, Math.round((bgmVolume + 0.1) * 10) / 10));
  /** BGM 音量を下げる */
  const decBgm = () =>
    setBgmVolume(Math.max(0, Math.round((bgmVolume - 0.1) * 10) / 10));
  /** SE 音量を上げ、変更後の音量で効果音を鳴らす */
  const incSe = () => {
    const newVol = Math.min(1, Math.round((seVolume + 0.1) * 10) / 10);
    setSeVolume(newVol);
    playMove(newVol);
  };
  /** SE 音量を下げ、変更後の音量で効果音を鳴らす */
  const decSe = () => {
    const newVol = Math.max(0, Math.round((seVolume - 0.1) * 10) / 10);
    setSeVolume(newVol);
    playMove(newVol);
  };

  /** 移動音を再生し audioReady を一時的に立てる */
  const playMoveSe = () => {
    playMove();
    setAudioReady(true);
    setTimeout(() => setAudioReady(false), 200);
  };

  /** 壁衝突音を再生する */
  const playBumpSe = () => {
    playBump();
  };

  return {
    bgmVolume,
    seVolume,
    incBgm,
    decBgm,
    incSe,
    decSe,
    playMoveSe,
    playBumpSe,
    pauseBgm,
    resumeBgm,
    changeBgm,
    bgmReady,
    audioReady,
  } as const;
}
