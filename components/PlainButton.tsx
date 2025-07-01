import React from 'react';
import { Pressable, Text, StyleSheet, type PressableProps } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

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
  const scheme = useColorScheme();
  const bgStyle = scheme === 'light' ? styles.lightButton : styles.button;
  const textStyle = scheme === 'light' ? styles.lightText : styles.text;
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      disabled={disabled}
      style={(state) => [
        bgStyle,
        state.pressed && styles.pressed,
        disabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <Text style={textStyle}>{title}</Text>
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
  lightButton: {
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  lightText: {
    color: '#000',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
});
