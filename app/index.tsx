import { Button, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useGame } from '../src/game/useGame';

export default function TitleScreen() {
  const { dispatch } = useGame();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Haptic Maze</Text>
      <Button
        title="Start"
        accessibilityLabel="ゲーム開始"
        onPress={() => {
          dispatch({ type: 'reset' });
          router.replace('/play');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
