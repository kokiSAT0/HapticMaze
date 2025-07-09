import React from 'react';
import { StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { PlainButton } from '@/components/PlainButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LEVELS } from '@/constants/levels';
import { clearGame, loadGame } from '@/src/game/saveGame';
import { useSnackbar } from '@/src/hooks/useSnackbar';
import { useGame } from '@/src/game/useGame';
import { useLocale, type MessageKey } from '@/src/locale/LocaleContext';
import { useBgm } from '@/src/hooks/useBgm';

export default function ResetConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const levelId = typeof params.level === 'string' ? params.level : undefined;
  const { newGame } = useGame();
  const { t } = useLocale();
  const { change, bgmReady } = useBgm();
  const { show: showSnackbar } = useSnackbar();
  // 中断データの難易度とステージを保持する
  const [suspendInfo, setSuspendInfo] = React.useState<{
    levelId?: string;
    stage: number;
  } | null>(null);
  // BGM変更が間に合わなかった場合に備えて一時的に保持
  const [pendingBgm, setPendingBgm] = React.useState<number>();

  // コンポーネント表示時に保存データを読み込む
  React.useEffect(() => {
    (async () => {
      const data = await loadGame({ showError: showSnackbar });
      if (data) {
        setSuspendInfo({ levelId: data.levelId, stage: data.stage });
      }
    })();
    // showSnackbar は変化しない想定のため依存から除外
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // bgmReady が true になったタイミングで再度 change() を実行
  React.useEffect(() => {
    if (bgmReady && pendingBgm) {
      change(pendingBgm);
      setPendingBgm(undefined);
    }
  }, [bgmReady, pendingBgm, change]);

  const start = async () => {
    if (!levelId) {
      router.replace('/');
      return;
    }
    const level = LEVELS.find((lv) => lv.id === levelId);
    if (!level) {
      router.replace('/');
      return;
    }
    await clearGame({ showError: showSnackbar });
    const bgmFile =
      levelId === 'hard'
        ? require('../assets/sounds/日没廃校_調整.mp3')
        : require('../assets/sounds/降りしきる、白_調整.mp3');
    // bgmReady が false の場合は pendingBgm に保持し、準備完了後に再生
    if (bgmReady) {
      change(bgmFile);
    } else {
      setPendingBgm(bgmFile);
    }
    newGame(
      level.size,
      level.enemies,
      level.enemyPathLength,
      level.playerPathLength,
      level.wallLifetime,
      level.enemyCountsFn,
      level.wallLifetimeFn,
      level.biasedSpawn,
      level.id,
      level.stagePerMap,
    );
    router.replace('/play');
  };

  return (
    <ThemedView lightColor="#000" darkColor="#000" style={styles.container}>
      <ThemedText type="title" lightColor="#fff" darkColor="#fff">
        {t('confirmReset')}
      </ThemedText>
      {suspendInfo && (
        <ThemedText type="defaultSemiBold" lightColor="#fff" darkColor="#fff">
          {t('suspendInfo', {
            level: suspendInfo.levelId
              ? t(suspendInfo.levelId as MessageKey)
              : '?',
            stage: suspendInfo.stage,
          })}
        </ThemedText>
      )}
      <PlainButton title={t('yes')} onPress={start} accessibilityLabel={t('yes')} />
      <PlainButton
        title={t('backToTitle')}
        onPress={() => router.replace('/')}
        accessibilityLabel={t('backToTitle')}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
});
