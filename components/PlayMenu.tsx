import React from 'react';
import { Modal, Pressable, StyleSheet, Switch, View } from 'react-native';
import { PlainButton } from '@/components/PlainButton';
import { ThemedText } from '@/components/ThemedText';
import { useLocale } from '@/src/locale/LocaleContext';

interface PlayMenuProps {
  visible: boolean;
  debugAll: boolean;
  onChangeDebug: (v: boolean) => void;
  onReset: () => void;
  onClose: () => void;
  topOffset: number;
}

// サブメニューを表示するコンポーネント
export function PlayMenu({
  visible,
  debugAll,
  onChangeDebug,
  onReset,
  onClose,
  topOffset,
}: PlayMenuProps) {
  const { t } = useLocale();
  return (
    <Modal transparent visible={visible} animationType="fade">
      {/* 画面全体を押すと閉じるオーバーレイ */}
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.content, { top: topOffset }]}>
          <PlainButton
            title={t('resetMaze')}
            onPress={onReset}
            accessibilityLabel={t('resetMazeLabel')}
          />
          {/* デバッグ表示切り替えスイッチ */}
          <View style={styles.switchRow}>
            <ThemedText>{t('showAll')}</ThemedText>
            <Switch
              value={debugAll}
              onValueChange={onChangeDebug}
              accessibilityLabel={t('showMazeAll')}
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

