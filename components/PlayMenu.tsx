import React from 'react';
import { Modal, Pressable, StyleSheet, Switch, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { PlainButton } from '@/components/PlainButton';
import { ThemedText } from '@/components/ThemedText';

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
              onValueChange={setDebugAll}
              accessibilityLabel={labelShowMaze}
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
                <MaterialIcons name="remove" size={20} color="#555" />
              </Pressable>
              <Pressable
                onPress={incBgm}
                accessibilityLabel={accIncBgm}
                style={styles.volBtn}
              >
                <MaterialIcons name="add" size={20} color="#555" />
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
                <MaterialIcons name="remove" size={20} color="#555" />
              </Pressable>
              <Pressable
                onPress={incSe}
                accessibilityLabel={accIncSe}
                style={styles.volBtn}
              >
                <MaterialIcons name="add" size={20} color="#555" />
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
    backgroundColor: '#fff',
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
