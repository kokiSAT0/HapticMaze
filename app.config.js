import "dotenv/config";
import appJson from "./app.json";

export default ({ config }) => ({
  ...config,
  ...appJson.expo,

  ios: {
    ...(appJson.expo.ios ?? {}),
    bundleIdentifier: "com.kokisato.mazesense", // ⾃由に決定（Apple Dev 上でも登録）
    supportsTablet: true,
    // 広告トラッキング許可ダイアログの文言を追加
    infoPlist: {
      ...(appJson.expo.ios?.infoPlist ?? {}),
      NSUserTrackingUsageDescription: "広告配信のために端末識別子を利用します",
      // 将来的に音声録音機能を追加する場合は以下も定義する
      // NSMicrophoneUsageDescription: "マイクを使用して音声を録音します"
    },
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
        userTrackingUsageDescription:
          "広告の最適化のためにデバイスIDを使用します",
      },
    ],
  ],
  extra: {
    ...(appJson.expo.extra ?? {}),
    eas: {
      projectId: "9b5bf180-0e1d-48e8-b2d5-a17224c8cfd2", // ← eas init が出力した ID
    },
  },
});
