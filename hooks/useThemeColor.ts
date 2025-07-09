/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/ui';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useColorInvert } from '@/src/hooks/useColorInvert';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const { invert } = useColorInvert();
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  const baseColor = colorFromProps ?? Colors[theme][colorName];
  return invert ? invertColor(baseColor) : baseColor;
}

function invertColor(color: string) {
  const c = color.toLowerCase();
  if (c === '#fff' || c === '#ffffff' || c === 'white') return '#000';
  if (c === '#000' || c === '#000000' || c === 'black') return '#fff';
  return color;
}
