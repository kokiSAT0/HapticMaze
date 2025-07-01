import React from 'react';
import { Modal, Pressable, StyleSheet, Switch, View } from 'react-native';
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
});
