import React from 'react';
import { Button, StyleSheet, View } from 'react-native';

// Vec2 や方角の型定義をまとめたファイルから Dir をインポート
import type { Dir } from '@/src/types/maze';

/**
 * DPadProps インターフェース
 * onMove にはボタンを押したとき呼ばれる関数を渡します。
 */
export interface DPadProps {
  onMove: (dir: Dir) => void; // dir は移動方向を表す文字列
}

/**
 * DPad コンポーネント
 * 上下左右ボタンを縦に 2 行並べたシンプルな UI です。
 */
export function DPad({ onMove }: DPadProps) {
  return (
    <View style={styles.container}>
      {/* 上ボタン。accessibilityLabel で読み上げ用の説明を指定 */}
      <View style={styles.row}>
        <Button
          title="▲"
          color="white"
          onPress={() => onMove('Up')}
          accessibilityLabel="上へ移動"
        />
      </View>
      {/* 左・下・右ボタンを横並びに配置 */}
      <View style={styles.row}>
        <Button
          title="◀"
          color="white"
          onPress={() => onMove('Left')}
          accessibilityLabel="左へ移動"
        />
        <Button
          title="▼"
          color="white"
          onPress={() => onMove('Down')}
          accessibilityLabel="下へ移動"
        />
        <Button
          title="▶"
          color="white"
          onPress={() => onMove('Right')}
          accessibilityLabel="右へ移動"
        />
      </View>
    </View>
  );
}

// StyleSheet.create でスタイルを定義
const styles = StyleSheet.create({
  container: {
    alignItems: 'center', // 中央寄せ
    gap: 10, // ボタン同士の隙間
  },
  row: {
    flexDirection: 'row', // 子要素を横並びにする設定
    gap: 10,
  },
});
