import { useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { showInterstitial } from '@/src/ads/interstitial';
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
  });

  // ステージ総数。迷路は正方形なので size×size となる
  const totalStages = maze.size * maze.size;

  const handleError = useHandleError();

  // 敵のみをリスポーンする処理
  const handleRespawn = async () => {
    if (state.respawnStock <= 0) {
      try {
        audio.pauseBgm();
        await showInterstitial();
      } catch (e) {
        handleError('広告を表示できませんでした', e);
      } finally {
        audio.resumeBgm();
      }
    }
    respawnEnemies();
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
  } as const;
}
