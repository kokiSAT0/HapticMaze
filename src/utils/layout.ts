import { PixelRatio } from 'react-native';

/**
 * 与えられたセンチメートル値を dp に変換する関数。
 * dp は 'density-independent pixel' の略で、
 * 画面密度に依存せず同じ物理サイズを保つ単位です。
 * 1 inch = 2.54cm、1dp = 1/160 inch を利用して計算します。
 */
export function cmToDp(cm: number): number {
  return PixelRatio.roundToNearestPixel((cm / 2.54) * 160);
}
