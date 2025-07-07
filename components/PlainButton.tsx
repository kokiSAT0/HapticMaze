import React from 'react';
import { Pressable, Text, StyleSheet, type PressableProps } from 'react-native';
import { UI } from '@/constants/ui';

interface PlainButtonProps {
  title: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
  /**
   * 外から追加のスタイルを渡したいとき用
   */
  style?: PressableProps['style'];
  /** 背景色と文字色の組み合わせを変えるオプション */
  variant?: 'dark' | 'light';
}

/**
 * 背景と文字色が選べるシンプルなボタン
 * 初心者でも分かりやすいように Pressable と Text を組み合わせている
 */
export function PlainButton({
  title,
  onPress,
  accessibilityLabel,
  disabled = false,
  style,
  variant = 'dark',
}: PlainButtonProps) {
  // variant の値に応じてボタンと文字の色を切り替える
  const variantStyle =
    variant === 'light'
      ? { backgroundColor: '#fff', color: '#000' }
      : { backgroundColor: UI.colors.buttonBg, color: UI.colors.buttonText };

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      disabled={disabled}
      style={(state) => [
        styles.button,
        { backgroundColor: variantStyle.backgroundColor },
        state.pressed && styles.pressed,
        disabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <Text style={[styles.text, { color: variantStyle.color }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: UI.colors.buttonBg,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    // 最低でも 48dp の高さを確保し、共通定義から参照
    minHeight: UI.dpadButtonSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: UI.colors.buttonText,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
});
