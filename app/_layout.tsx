import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import mobileAds from 'react-native-google-mobile-ads';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ColorSchemeProvider } from '@/src/theme/ColorSchemeContext';
import { GameProvider } from '@/src/game/useGame';
import { LocaleProvider } from '@/src/locale/LocaleContext';

export default function RootLayout() {
  return (
    <ColorSchemeProvider>
      <InnerLayout />
    </ColorSchemeProvider>
  );
}

function InnerLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Google Mobile Ads SDK を初期化する。広告が表示されない問題を防ぐため
  useEffect(() => {
    mobileAds().initialize();
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
    </ThemeProvider>
  );
}
