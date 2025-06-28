import React from 'react';
import { Pressable, Text, StyleSheet, type PressableProps } from 'react-native';

interface PlainButtonProps {
  title: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
  /**
   * 外から追加のスタイルを渡したいとき用
   */
  style?: PressableProps['style'];
}

/**
 * 黒背景・白文字のシンプルなボタン
 * 初心者でも分かりやすいように Pressable と Text を組み合わせている
 */
export function PlainButton({
  title,
  onPress,
  accessibilityLabel,
  disabled = false,
  style,
}: PlainButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      disabled={disabled}
      style={(state) => [
        styles.button,
        state.pressed && styles.pressed,
        disabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#000',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    // 最低でも 48dp の高さを確保し、指で押しやすくする
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
});
