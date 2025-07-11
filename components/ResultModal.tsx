import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { PlainButton } from "@/components/PlainButton";
import { useLocale } from "@/src/locale/LocaleContext";
import { UI } from "@/constants/ui";
import type { HighScore } from "@/src/game/highScore";

/** ゲーム画面に直接表示するリザルトパネル */
export function ResultModal({
  visible,
  top,
  title,
  steps,
  bumps,
  stageText,
  highScore,
  newRecord,
  onOk,
  okLabel,
  accLabel,
  disabled,
}: {
  visible: boolean;
  top: number;
  title: string;
  steps: string;
  bumps: string;
  stageText: string;
  highScore: HighScore | null;
  newRecord: boolean;
  onOk: () => void | Promise<void>;
  okLabel: string;
  accLabel: string;
  disabled?: boolean;
}) {
  const { t } = useLocale();
  if (!visible) return null;

  return (
    <ThemedView
      style={[styles.content, { top }]}
      accessible
      accessibilityLabel="結果表示パネル"
    >
      <ThemedText type="title" style={styles.text}>{title}</ThemedText>
      <ThemedText style={styles.text}>{steps}</ThemedText>
      <ThemedText style={styles.text}>{bumps}</ThemedText>
      <ThemedText style={styles.text}>{stageText}</ThemedText>
      {highScore && (
        <ThemedText style={styles.text}>
          {t("best", {
            stage: highScore.stage,
            steps: highScore.steps,
            bumps: highScore.bumps,
          })}
        </ThemedText>
      )}
      {newRecord && <ThemedText style={styles.text}>{t("newRecord")}</ThemedText>}
      <PlainButton
        title={okLabel}
        onPress={onOk}
        accessibilityLabel={accLabel}
        disabled={disabled}
        variant="light"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: {
    position: 'absolute',
    backgroundColor: '#000',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    gap: UI.dpadSpacing,
    // 結果画面の横幅。狭すぎると文字が折り返されるため調整可
    width: UI.resultModalWidth,
    alignSelf: 'center',
  },
  text: {
    color: '#fff',
  },
});
