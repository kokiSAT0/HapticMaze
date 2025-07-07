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
    if (!visible) return;
    // 初期化処理がすぐ終わっても最低 2 秒は表示する
    // 2000 は 2 秒をミリ秒で表した数値
    const id = setTimeout(onFinish, 2000);
    return () => clearTimeout(id);
  }, [visible, onFinish]);

  if (!visible) return null;
  return (
    <Modal transparent visible animationType="fade">
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
