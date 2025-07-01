import { useCallback } from 'react';
import { Alert, Platform, ToastAndroid } from 'react-native';

/**
 * 簡易スナックバー表示用フック
 * Android では Toast を、その他では Alert を利用する
 */
export function useSnackbar() {
  const show = useCallback((message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('', message);
    }
  }, []);

  return { show } as const;
}
