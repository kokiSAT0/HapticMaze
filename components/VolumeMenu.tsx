import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { VolumeControl } from '@/components/VolumeControl';
import { PlainButton } from '@/components/PlainButton';
import { ThemedText } from '@/components/ThemedText';

/**
 * 音量調整用のサブメニュー
 */
export function VolumeMenu({
  visible,
  top,
  onClose,
  bgm,
  setBgm,
  se,
  setSe,
  labelTitle,
  labelBgm,
  labelSe,
  labelClose,
}: {
  visible: boolean;
  top: number;
  onClose: () => void;
  bgm: number;
  setBgm: (v: number) => void;
  se: number;
  setSe: (v: number) => void;
  labelTitle: string;
  labelBgm: string;
  labelSe: string;
  labelClose: string;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable
        style={styles.overlay}
        onPress={onClose}
        accessibilityLabel="音量設定を閉じる"
      >
        <View style={[styles.content, { top }]}>
          <ThemedText type="title">{labelTitle}</ThemedText>
          <VolumeControl label={labelBgm} value={bgm} setValue={setBgm} />
          <VolumeControl label={labelSe} value={se} setValue={setSe} />
          <PlainButton title={labelClose} onPress={onClose} accessibilityLabel={labelClose} />
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
});
