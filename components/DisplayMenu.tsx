import React from 'react';
import { Modal, Pressable, StyleSheet, Switch, View } from 'react-native';
import { PlainButton } from '@/components/PlainButton';
import { ThemedText } from '@/components/ThemedText';
import type { ColorScheme } from '@/src/theme/ColorSchemeContext';

/**
 * 画面表示に関する設定を行うサブメニュー
 */
export function DisplayMenu({
  visible,
  top,
  onClose,
  scheme,
  toggleScheme,
  labelLight,
  labelClose,
}: {
  visible: boolean;
  top: number;
  onClose: () => void;
  scheme: ColorScheme;
  toggleScheme: () => void;
  labelLight: string;
  labelClose: string;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable
        style={styles.overlay}
        onPress={onClose}
        accessibilityLabel="表示設定を閉じる"
      >
        <View style={[styles.content, { top }]}>
          <View style={styles.switchRow}>
            <ThemedText>{labelLight}</ThemedText>
            <Switch
              value={scheme === 'light'}
              onValueChange={toggleScheme}
              accessibilityLabel={labelLight}
            />
          </View>
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
