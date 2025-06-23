import { View, Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Dir } from '@/src/types/maze';

interface DPadProps {
  onMove: (dir: Dir) => void;
  size?: number; // ボタン1辺の大きさ
}

/**
 * 画面下部に表示する十字キーコンポーネント。
 * 押下すると onMove が呼ばれ、ゲーム状態が更新されます。
 */
export function DPad({ onMove, size = 56 }: DPadProps) {
  const theme = useColorScheme() ?? 'light';
  const color = theme === 'light' ? Colors.light.text : Colors.dark.text;

  const buttonStyle = {
    width: size,
    height: size,
  };

  const handlePress = (dir: Dir) => () => onMove(dir);

  return (
    <View style={[styles.container, { width: size * 3, height: size * 3 }]}>
      <Pressable
        accessibilityLabel="上に移動"
        style={[styles.button, buttonStyle, styles.up]}
        onPress={handlePress('Up')}
      >
        <IconSymbol
          name="chevron.right"
          size={28}
          color={color}
          style={{ transform: [{ rotate: '-90deg' }] }}
        />
      </Pressable>
      <Pressable
        accessibilityLabel="下に移動"
        style={[styles.button, buttonStyle, styles.down]}
        onPress={handlePress('Down')}
      >
        <IconSymbol
          name="chevron.right"
          size={28}
          color={color}
          style={{ transform: [{ rotate: '90deg' }] }}
        />
      </Pressable>
      <Pressable
        accessibilityLabel="左に移動"
        style={[styles.button, buttonStyle, styles.left]}
        onPress={handlePress('Left')}
      >
        <IconSymbol
          name="chevron.right"
          size={28}
          color={color}
          style={{ transform: [{ rotate: '180deg' }] }}
        />
      </Pressable>
      <Pressable
        accessibilityLabel="右に移動"
        style={[styles.button, buttonStyle, styles.right]}
        onPress={handlePress('Right')}
      >
        <IconSymbol name="chevron.right" size={28} color={color} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    position: 'absolute',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  up: { top: 0, left: '33.33%' },
  down: { bottom: 0, left: '33.33%' },
  left: { left: 0, top: '33.33%' },
  right: { right: 0, top: '33.33%' },
});
