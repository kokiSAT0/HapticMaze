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
  extra: {
    ...(appJson.expo.extra ?? {}),
    eas: {
      projectId: "d3cd7e59-b872-4f9c-8a23-5df8c4ae4583", // ← eas init が出力した ID
    },
  },
});
