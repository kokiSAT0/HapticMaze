import React, { useEffect } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";

/**
 * ステージ番号を表示するオーバーレイコンポーネント
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
  useEffect(() => {
    // 表示状態やステージ番号が変わるたびにログを出す
    console.log(
      `[StageBanner] visible=${visible}, stage=${stage}`
    );
    if (!visible) return;
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

  if (!visible) return null;
  return (
    <Modal
      transparent
      visible
      animationType="fade"
      presentationStyle="overFullScreen"
    >
      <View
        style={styles.wrapper}
        accessible
        accessibilityLabel={`Stage ${stage}`}
      >
        <ThemedText type="title" style={styles.text}>
          Stage {stage}
        </ThemedText>
      </View>
    </Modal>
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
