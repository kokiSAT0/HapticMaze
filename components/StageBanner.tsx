import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { devLog } from "@/src/utils/logger";

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
  // onFinish が複数回実行されないようフラグを保持する
  const calledRef = React.useRef(false);

  // ステージバナーを無効化している場合、表示要求があれば即終了する
  useEffect(() => {
    if (DISABLE_STAGE_BANNER && visible && !calledRef.current) {
      calledRef.current = true;
      onFinish();
    }
  }, [visible, onFinish]);

  useEffect(() => {
    // 表示状態やステージ番号が変わるたびにログを出す
    devLog(`[StageBanner] visible=${visible}, stage=${stage}`);
    if (!visible || DISABLE_STAGE_BANNER) return;
    // 新しい表示が始まったのでフラグをリセット
    calledRef.current = false;
    // 初期化処理がすぐ終わっても最低 2 秒は表示する
    const id = setTimeout(() => {
      devLog(`[StageBanner] onFinish stage=${stage}`);
      if (!calledRef.current) {
        calledRef.current = true;
        onFinish();
      }
    }, 2000);
    return () => {
      devLog(`[StageBanner] cleanup stage=${stage}`);
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
