import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Dir } from '@/src/types/maze';
import { UI } from '@/constants/ui';
import { useLocale } from '@/src/locale/LocaleContext';

// DPad はここに集約

/**
 * DPad コンポーネント
 * 方向入力を受け取り、useGame の move 関数へ渡す役割を持ちます。
 * Dir 型は 'Up' | 'Down' | 'Left' | 'Right' の四種類を表します。
 */
export function DPad({
  onPress,
  disabled = false, // true のときタップを受け付けない
}: {
  onPress: (dir: Dir) => void;
  disabled?: boolean;
}) {
  const { t } = useLocale();
  return (
    <View style={styles.container}>
      {/* 一段目: 上ボタンを中央に配置 */}
      <View style={styles.row}>
        <View style={styles.spacer} />
        <Pressable
          disabled={disabled}
          onPress={() => onPress('Up')}
          style={[styles.btn, disabled && styles.disabledBtn]}
          // 上方向への移動ボタン
          accessibilityLabel={t('moveUp')}
        >
          {/* \u25B2: 三角形の記号を表示 */}
          <Text style={[styles.txt, disabled && styles.disabledTxt]}>▲</Text>
        </Pressable>
        <View style={styles.spacer} />
      </View>
      {/* 二段目: 左右ボタン */}
      <View style={styles.row}>
        <Pressable
          disabled={disabled}
          onPress={() => onPress('Left')}
          style={[styles.btn, disabled && styles.disabledBtn]}
          // 左方向への移動ボタン
          accessibilityLabel={t('moveLeft')}
        >
          <Text style={[styles.txt, disabled && styles.disabledTxt]}>◀</Text>
        </Pressable>
        <View style={styles.spacer} />
        <Pressable
          disabled={disabled}
          onPress={() => onPress('Right')}
          style={[styles.btn, disabled && styles.disabledBtn]}
          // 右方向への移動ボタン
          accessibilityLabel={t('moveRight')}
        >
          <Text style={[styles.txt, disabled && styles.disabledTxt]}>▶</Text>
        </Pressable>
      </View>
      {/* 三段目: 下ボタンを中央に配置 */}
      <View style={styles.row}>
        <View style={styles.spacer} />
        <Pressable
          disabled={disabled}
          onPress={() => onPress('Down')}
          style={[styles.btn, disabled && styles.disabledBtn]}
          // 下方向への移動ボタン
          accessibilityLabel={t('moveDown')}
        >
          <Text style={[styles.txt, disabled && styles.disabledTxt]}>▼</Text>
        </Pressable>
        <View style={styles.spacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    // DPad 内ボタンの隙間を共通定義から取得
    gap: UI.dpadSpacing,
  },
  row: {
    flexDirection: 'row',
    gap: UI.dpadSpacing,
    justifyContent: 'center',
  },
  // ボタンを十字の形に配置するための空白
  spacer: {
    width: 40,
  },
  // 押下範囲のスタイル。幅・高さを定数から参照し指が届きやすくする
  btn: {
    width: UI.dpadButtonSize,
    height: UI.dpadButtonSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ボタン内の文字色を白に設定
  txt: {
    color: 'white',
    fontSize: 24,
  },
  // disabled が true のときに適用するスタイル
  disabledBtn: {
    opacity: 0.5,
  },
  disabledTxt: {
    color: '#666',
  },
});
