import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";

// 環境変数 EXPO_PUBLIC_DISABLE_STAGE_BANNER が 'true' のとき
// ステージバナーを表示せず即座に onFinish を呼び出す
const DISABLE_STAGE_BANNER =
  process.env.EXPO_PUBLIC_DISABLE_STAGE_BANNER === "true";

/**
 * ステージ番号を表示する全画面のビュー
 * visible が true の間だけ表示し、2 秒後に onFinish を呼び出す
 */
export function StageBanner({
  visible,
  stage,
  onFinish,
}: {
  visible: boolean;
  stage: number;
  onFinish: () => void;
}) {
  // ステージバナーを無効化している場合、表示要求があれば即終了する
  useEffect(() => {
    if (DISABLE_STAGE_BANNER && visible) {
      onFinish();
    }
  }, [visible, onFinish]);

  useEffect(() => {
    // 表示状態やステージ番号が変わるたびにログを出す
    console.log(
      `[StageBanner] visible=${visible}, stage=${stage}`
    );
    if (!visible || DISABLE_STAGE_BANNER) return;
    // 初期化処理がすぐ終わっても最低 2 秒は表示する
    // 2000 は 2 秒をミリ秒で表した数値
    const id = setTimeout(() => {
      console.log(`[StageBanner] onFinish stage=${stage}`);
      onFinish();
    }, 2000);
    return () => {
      console.log(`[StageBanner] cleanup stage=${stage}`);
      clearTimeout(id);
    };
  }, [visible, stage, onFinish]);

  if (!visible || DISABLE_STAGE_BANNER) return null;
  return (
    <View
      style={styles.wrapper}
      accessible
      accessibilityLabel={`Stage ${stage}`}
    >
      <ThemedText type="title" style={styles.text}>
        Stage {stage}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
  },
});
