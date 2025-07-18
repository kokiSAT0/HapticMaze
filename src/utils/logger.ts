/**
 * 開発中のみコンソールへ出力するログ関数
 * __DEV__ は React Native が提供する定数で
 * 開発ビルドのとき true になります
 */
export function devLog(...params: unknown[]) {
  if (__DEV__) {
    console.log(...params);
  }
}

/**
 * 広告関連の詳細ログを出力するための関数
 * EXPO_PUBLIC_DEBUG_ADS が 'true' のときと開発ビルドでのみ表示される
 */
const DEBUG_ADS = process.env.EXPO_PUBLIC_DEBUG_ADS === 'true';

export function adLog(...params: unknown[]) {
  if (__DEV__ || DEBUG_ADS) {
    console.log(...params);
  }
}
