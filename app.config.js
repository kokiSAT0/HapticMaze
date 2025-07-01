import "dotenv/config";
import appJson from "./app.json";

export default ({ config }) => ({
  ...appJson.expo,
  ...config,

  ios: {
    ...(appJson.expo.ios ?? {}),
    bundleIdentifier: "com.kokisato.mazesense", // ⾃由に決定（Apple Dev 上でも登録）
    supportsTablet: true,
  },
  android: {
    ...(appJson.expo.android ?? {}),
    package: "com.kokisato.mazesense", // 重複しない reverse-DNS 形式
    edgeToEdgeEnabled: true,
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#000000",
    },
  },

  plugins: [
    ...(appJson.expo.plugins || []),
    [
      "expo-build-properties",
      {
        android: { minSdkVersion: 24 },
        ios: {
          deploymentTarget: "15.1",
        },
      },
    ],
    [
      "react-native-google-mobile-ads",
      {
        androidAppId: process.env.ANDROID_ADMOB_APP_ID,
        iosAppId: process.env.IOS_ADMOB_APP_ID,
      },
    ],
  ],
});
