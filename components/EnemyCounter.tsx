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
  min = 0,
  max = 10,
  allowInfinity = false,
}: {
  label: string;
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
  min?: number;
  max?: number;
  allowInfinity?: boolean;
}) {
  const display = allowInfinity && value === Infinity ? '∞' : value;
  return (
    <View style={styles.row}>
      {/* ラベル表示 */}
      <ThemedText lightColor="#fff" darkColor="#fff">{label}</ThemedText>
      {/* マイナスボタンで1減らす。最小0 */}
      <Button
        title="-"
        onPress={() =>
          setValue((v) => {
            if (allowInfinity && v === Infinity) return max;
            return Math.max(min, v - 1);
          })
        }
        accessibilityLabel={`${label}を減らす`}
      />
      {/* 現在値表示 */}
      <ThemedText lightColor="#fff" darkColor="#fff" style={styles.count}>
        {display}
      </ThemedText>
      {/* プラスボタンで1増やす */}
      <Button
        title="+"
        onPress={() =>
          setValue((v) => {
            const next = v === Infinity ? Infinity : v + 1;
            if (allowInfinity && next > max) return Infinity;
            return Math.min(max, next);
          })
        }
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
