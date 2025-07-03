import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import mobileAds from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { GameProvider } from '@/src/game/useGame';
import { LocaleProvider } from '@/src/locale/LocaleContext';
import { BgmProvider } from '@/src/audio/BgmProvider';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Google Mobile Ads SDK を初期化する。web 環境では広告 SDK が利用できないため判定する
  useEffect(() => {
    if (Platform.OS !== 'web') {
      // OS は Android/iOS のいずれか。ここで初期化しないと広告が表示されないことがある
      mobileAds().initialize();
    }
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <BgmProvider>
        <LocaleProvider>
          <GameProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="practice" options={{ headerShown: false }} />
              <Stack.Screen name="scores" options={{ headerShown: false }} />
              <Stack.Screen name="play" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </GameProvider>
        </LocaleProvider>
        <StatusBar style="auto" />
      </BgmProvider>
    </ThemeProvider>
  );
}
