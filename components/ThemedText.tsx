import { StyleSheet, Text, type TextProps } from 'react-native';
import { UI } from '@/constants/ui';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: UI.fonts.default,
    // 行間はデフォルトサイズの 1.5 倍に設定
    lineHeight: UI.fonts.default * 1.5,
  },
  defaultSemiBold: {
    fontSize: UI.fonts.default,
    lineHeight: UI.fonts.default * 1.5,
    fontWeight: '600',
  },
  title: {
    fontSize: UI.fonts.title,
    fontWeight: 'bold',
    lineHeight: UI.fonts.title,
  },
  subtitle: {
    fontSize: UI.fonts.subtitle,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: UI.fonts.linkLine,
    fontSize: UI.fonts.default,
    color: '#0a7ea4',
  },
});
