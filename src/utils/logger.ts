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
