import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PlainButton } from '@/components/PlainButton';
import { ThemedText } from '@/components/ThemedText';
import { useLocale } from '@/src/locale/LocaleContext';

/**
 * 音量を 0 〜 10 の整数値で増減させるコンポーネント
 *   label: 表示ラベル
 *   value: 現在の音量 (0〜10)
 *   setValue: 値を更新する関数
 */
export function VolumeControl({
  label,
  value,
  setValue,
}: {
  label: string;
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { t } = useLocale();
  return (
    <View style={styles.row}>
      {/* ラベル表示 */}
      <ThemedText lightColor="#fff" darkColor="#fff">{label}</ThemedText>
      {/* マイナスボタンで 1 減らす。最小 0 */}
      <PlainButton
        title="-"
        onPress={() => setValue((v) => Math.max(0, v - 1))}
        accessibilityLabel={t('decrease', { label })}
      />
      {/* 現在値表示。0〜10 の範囲で表示 */}
      <ThemedText lightColor="#fff" darkColor="#fff" style={styles.count}>
        {value}
      </ThemedText>
      {/* プラスボタンで 1 増やす。最大 10 */}
      <PlainButton
        title="+"
        onPress={() => setValue((v) => Math.min(10, v + 1))}
        accessibilityLabel={t('increase', { label })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  count: {
    borderWidth: 1,
    borderColor: '#888',
    color: '#fff',
    paddingHorizontal: 8,
    minWidth: 32,
    textAlign: 'center',
  },
});
