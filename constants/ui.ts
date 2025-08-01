// 視覚情報を一箇所に集約するための定数群

/** テーマ別の基本色設定 */
export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#0a7ea4',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
} as const;

// ボタンサイズや色などアプリ内共通で使用する値
export const UI = {
  dpadButtonSize: 48,
  dpadSpacing: 10,
  // 画面内の各ボタン間隔をまとめて調整するための値
  screenGap: 16,
  // モーダル内要素の間隔
  modalGap: 20,
  // モーダルの内側余白
  modalPadding: 12,
  miniMapSize: 300,
  modalWidth: 250,
  // リザルトパネル専用の横幅
  // テキストが折り返されないよう適宜調整する
  resultModalWidth: 350,
  borderAnimationMax: 50,
  // 文字サイズを一箇所で管理する
  fonts: {
    default: 16,
    title: 34,
    subtitle: 20,
    linkLine: 30,
  },
  colors: {
    icon: '#555',
    buttonBg: '#000',
    buttonText: '#fff',
    modalBg: '#fff',
    overlay: 'rgba(0,0,0,0.5)',
    enemyCounterBorder: '#888',
    link: '#0a7ea4',
    mapWall: 'gray',
    mapStroke: 'white',
    bump: 'red',
    // 可視化ボタンの明度調整用カラー
    revealFree: '#fff',
    revealAd: 'rgba(255,255,255,0.5)',
  },
  feedback: {
    bumpWidth: 50,
    bumpShowTime: 300,
  },
  // -------------------
  // ホーム(タイトル)画面専用の設定
  // -------------------
  titleScreen: {
    // タイトル文字のサイズ
    titleFontSize: 32,
    // ボタンなど縦並び要素の余白
    optionGap: 20,
  },
} as const;

export type UIValues = typeof UI;
