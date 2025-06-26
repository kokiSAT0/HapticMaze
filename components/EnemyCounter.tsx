import React from 'react';
import { Button, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';

/**
 * 敵の数を増減させる共通コンポーネント
 * label: ラベル文字列
 * value: 現在の数値
 * setValue: 値を更新する関数
 */
export function EnemyCounter({
  label,
  value,
  setValue,
}: {
  label: string;
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <View style={styles.row}>
      {/* ラベル表示 */}
      <ThemedText lightColor="#fff" darkColor="#fff">{label}</ThemedText>
      {/* マイナスボタンで1減らす。最小0 */}
      <Button
        title="-"
        onPress={() => setValue((v) => Math.max(0, v - 1))}
        accessibilityLabel={`${label}を減らす`}
      />
      {/* 現在値表示 */}
      <ThemedText lightColor="#fff" darkColor="#fff" style={styles.count}>
        {value}
      </ThemedText>
      {/* プラスボタンで1増やす */}
      <Button
        title="+"
        onPress={() => setValue((v) => v + 1)}
        accessibilityLabel={`${label}を増やす`}
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
