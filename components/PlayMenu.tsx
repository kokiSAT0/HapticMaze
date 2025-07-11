import React from 'react';
import { Modal, Pressable, StyleSheet, Switch, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { PlainButton } from '@/components/PlainButton';
import { ThemedText } from '@/components/ThemedText';
import { UI } from '@/constants/ui';
import { useBgm } from '@/src/hooks/useBgm';
import { showInterstitial } from '@/src/ads/interstitial';
import { useHandleError } from '@/src/utils/handleError';
import { useRunRecords } from '@/src/hooks/useRunRecords';

/**
 * プレイ中に表示するメニューコンポーネント
 */
export function PlayMenu({
  visible,
  top,
  onClose,
  onReset,
  debugAll,
  setDebugAll,
  revealUsed,
  setRevealUsed,
  labelReset,
  labelResetAcc,
  labelShowAll,
  labelShowMaze,
  bgmVolume,
  seVolume,
  incBgm,
  decBgm,
  incSe,
  decSe,
  labelBgm,
  labelSe,
  accIncBgm,
  accDecBgm,
  accIncSe,
  accDecSe,
}: {
  visible: boolean;
  top: number;
  onClose: () => void;
  onReset: () => void;
  debugAll: boolean;
  setDebugAll: (v: boolean) => void;
  revealUsed: number;
  setRevealUsed: (v: number) => void;
  labelReset: string;
  labelResetAcc: string;
  labelShowAll: string;
  labelShowMaze: string;
  bgmVolume: number;
  seVolume: number;
  incBgm: () => void;
  decBgm: () => void;
  incSe: () => void;
  decSe: () => void;
  labelBgm: string;
  labelSe: string;
  accIncBgm: string;
  accDecBgm: string;
  accIncSe: string;
  accDecSe: string;
}) {
  const { incReveal } = useRunRecords();
  // BGM 制御を取得し広告表示中は音を止める
  const { pause: pauseBgm, resume: resumeBgm } = useBgm();
  const handleError = useHandleError();

  /**
   * 全表示スイッチの処理
   * ON にするときのみ広告判定を行う
   */
  const handleToggle = async (v: boolean) => {
    if (v) {
      if (revealUsed === 0) {
        setRevealUsed(1);
        setDebugAll(true);
        incReveal();
        return;
      }
      try {
        pauseBgm();
        await showInterstitial();
        setDebugAll(true);
        incReveal();
      } catch (e) {
        // 広告が出なかった場合はエラーメッセージを表示
        handleError('広告を表示できませんでした', e);
      } finally {
        resumeBgm();
      }
    } else {
      setDebugAll(false);
    }
  };
  return (
    <Modal transparent visible={visible} animationType="fade">
      {/* 背景をタップすると閉じるオーバーレイ */}
      <Pressable
        style={styles.overlay}
        onPress={onClose}
        accessibilityLabel="メニューを閉じる"
      >
        <View style={[styles.content, { top }]}>
          <PlainButton
            title={labelReset}
            onPress={onReset}
            accessibilityLabel={labelResetAcc}
          />
          <View style={styles.switchRow}>
            <ThemedText>{labelShowAll}</ThemedText>
            <Switch
              value={debugAll}
              onValueChange={handleToggle}
              thumbColor={
                revealUsed === 0 || debugAll
                  ? UI.colors.revealFree
                  : UI.colors.revealAd
              }
              accessibilityLabel={
                revealUsed === 0
                  ? labelShowMaze
                  : '広告を見るともう一度全表示できます'
              }
            />
          </View>
          <View style={styles.volumeRow}>
            <ThemedText>{labelBgm}: {Math.round(bgmVolume * 10)}</ThemedText>
            <View style={styles.volBtns}>
              <Pressable
                onPress={decBgm}
                accessibilityLabel={accDecBgm}
                style={styles.volBtn}
              >
                <MaterialIcons name="remove" size={20} color={UI.colors.icon} />
              </Pressable>
              <Pressable
                onPress={incBgm}
                accessibilityLabel={accIncBgm}
                style={styles.volBtn}
              >
                <MaterialIcons name="add" size={20} color={UI.colors.icon} />
              </Pressable>
            </View>
          </View>
          <View style={styles.volumeRow}>
            <ThemedText>{labelSe}: {Math.round(seVolume * 10)}</ThemedText>
            <View style={styles.volBtns}>
              <Pressable
                onPress={decSe}
                accessibilityLabel={accDecSe}
                style={styles.volBtn}
              >
                <MaterialIcons name="remove" size={20} color={UI.colors.icon} />
              </Pressable>
              <Pressable
                onPress={incSe}
                accessibilityLabel={accIncSe}
                style={styles.volBtn}
              >
                <MaterialIcons name="add" size={20} color={UI.colors.icon} />
              </Pressable>
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  content: {
    position: 'absolute',
    right: 10,
    backgroundColor: UI.colors.modalBg,
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  volBtns: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  volBtn: {
    padding: 4,
  },
});
