import "dotenv/config";
import appJson from "./app.json";

export default ({ config }) => ({
  ...config,
  ...appJson.expo,
  runtimeVersion: "1.0.0",
  ios: {
    ...(appJson.expo.ios ?? {}),
    bundleIdentifier: "com.kokisato.mazesense", // ⾃由に決定（Apple Dev 上でも登録）
    supportsTablet: true,
    // NSUserTrackingUsageDescription は app.json で定義し
    // locales ディレクトリの JSON で多言語化する
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
    "expo-iap",
    "expo-tracking-transparency",
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
        androidAppId: process.env.EXPO_PUBLIC_ANDROID_ADMOB_APP_ID,
        iosAppId: process.env.EXPO_PUBLIC_IOS_ADMOB_APP_ID,
        delayAppMeasurementInit: true,
        // ATT ダイアログの文言は app.json の locales で管理する
      },
    ],
  ],
  extra: {
    ...(appJson.expo.extra ?? {}),
    eas: {
      projectId: "d3cd7e59-b872-4f9c-8a23-5df8c4ae4583", // ← eas init が出力した ID
    },
  },
});
