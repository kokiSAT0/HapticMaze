import { StyleSheet } from 'react-native';

// PlayScreen 専用スタイルをまとめたファイル
// StyleSheet.create で生成したオブジェクトをそのまま export する
export const playStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  menuBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4,
  },
  // ホームボタン用スタイル。左上に固定表示
  homeBtn: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 4,
  },
  // 迷路リセットボタン。メニューボタンの左隣に配置
  resetBtn: {
    position: 'absolute',
    top: 10,
    right: 44,
    padding: 4,
  },
  // ミニマップを画面上 1/3 より40px上の位置に中央揃えで配置
  miniMapWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  // DPad を画面下 1/3 の位置に中央揃えで配置
  dpadWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  // 枠線 (グラデーション) の各辺共通スタイル
  edge: {
    position: 'absolute',
  },
  topEdge: {
    top: 0,
    left: 0,
    right: 0,
  },
  bottomEdge: {
    bottom: 0,
    left: 0,
    right: 0,
  },
  leftEdge: {
    left: 0,
    top: 0,
    bottom: 0,
  },
  rightEdge: {
    right: 0,
    top: 0,
    bottom: 0,
  },
});
