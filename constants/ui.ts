// ボタンサイズや間隔など共通で使う寸法をまとめた定数オブジェクト
export const UI = {
  dpadButtonSize: 48,
  dpadSpacing: 10,
  miniMapSize: 300,
  modalWidth: 250,
  borderAnimationMax: 50,
} as const;
export type UIValues = typeof UI;
