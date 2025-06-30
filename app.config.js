import 'dotenv/config';
import appJson from './app.json';

export default ({ config }) => ({
  ...appJson.expo,
  ...config,
  plugins: [
    ...(appJson.expo.plugins || []),
    [
      'expo-build-properties',
      { android: { minSdkVersion: 24 } },
    ],
    [
      'react-native-google-mobile-ads',
      {
        android_app_id: process.env.ANDROID_ADMOB_APP_ID,
        ios_app_id: process.env.IOS_ADMOB_APP_ID,
      },
    ],
  ],
});
