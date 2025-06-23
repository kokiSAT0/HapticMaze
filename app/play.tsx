import { useLayoutEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from 'expo-router';

import { HeaderMenu } from '@/components/HeaderMenu';

export default function PlayScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerRight: () => <HeaderMenu /> });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text>Maze Playing...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
