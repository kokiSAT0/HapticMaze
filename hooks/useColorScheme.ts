import { useAppColorScheme } from '@/src/theme/ColorSchemeContext';

// アプリ独自のカラースキームを取得するフック
export function useColorScheme() {
  const { scheme } = useAppColorScheme();
  return scheme;
}
