import { useWindowDimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
// React の useState フックを追加
import { useState } from 'react';
// 広告関連の関数とフラグをまとめて読み込む
import { showInterstitial, DISABLE_ADS } from '@/src/ads/interstitial';
// 広告削除購入済みか判定するユーティリティ
import { useRemoveAds } from '@/src/iap/removeAds';
import { useHandleError } from '@/src/utils/handleError';

import { useGame } from '@/src/game/useGame';
import { useSnackbar } from '@/src/hooks/useSnackbar';
import { useAudioControls } from '@/src/hooks/useAudioControls';
import { useResultActions } from '@/src/hooks/useResultActions';
import { useMoveHandler } from '@/src/hooks/useMoveHandler';

/**
 * Play 画面全体のロジックをまとめるフック
 * それぞれの機能は専用フックに分割して読み込む
 */
export function usePlayLogic() {
  const router = useRouter();
  const { state, move, maze, nextStage, resetRun, respawnEnemies } = useGame();
  const { width } = useWindowDimensions();
  const { show: showSnackbar } = useSnackbar();
  // 広告削除状態を取得
  const { adsRemoved } = useRemoveAds();

  // BGM・SE 操作は専用フックに委譲
  const audio = useAudioControls(
    require('../../assets/sounds/歩く音200ms_調整.mp3'),
    require('../../assets/sounds/弓と矢_調整.mp3')
  );

  // リザルト表示やメニュー操作の管理
  const result = useResultActions({
    state,
    maze,
    nextStage,
    resetRun,
    router,
    showSnackbar,
    pauseBgm: audio.pauseBgm,
    resumeBgm: audio.resumeBgm,
  });

  // DPad 移動に関する演出・ロック制御
  const moveCtrl = useMoveHandler({
    statePos: state.pos,
    maze,
    move,
    playMoveSe: audio.playMoveSe,
    playBumpSe: audio.playBumpSe,
    width,
    showError: showSnackbar,
  });

  // ステージ総数。迷路は正方形なので size×size となる
  const totalStages = maze.size * maze.size;

  const handleError = useHandleError();
  // 広告表示中はボタンをロックするためのフラグ
  const [respawnLocked, setRespawnLocked] = useState(false);

  // 敵のみをリスポーンする処理
  const handleRespawn = async () => {
    // ロック中は処理しない
    if (respawnLocked) return;
    setRespawnLocked(true);
    try {
      if (state.respawnStock <= 0) {
        // 広告表示がある場合のみ BGM を止める
        const needMute = !DISABLE_ADS && !adsRemoved && Platform.OS !== 'web';
        try {
          if (needMute) audio.pauseBgm();
          await showInterstitial();
        } catch (e) {
          handleError('広告を表示できませんでした', e);
        } finally {
          if (needMute) audio.resumeBgm();
        }
      }
      respawnEnemies();
    } finally {
      setRespawnLocked(false);
    }
  };

  return {
    state,
    maze,
    totalStages,
    ...result,
    bgmVolume: audio.bgmVolume,
    seVolume: audio.seVolume,
    incBgm: audio.incBgm,
    decBgm: audio.decBgm,
    incSe: audio.incSe,
    decSe: audio.decSe,
    audioReady: audio.audioReady,
    ...moveCtrl,
    handleRespawn,
    respawnLocked,
  } as const;
}
