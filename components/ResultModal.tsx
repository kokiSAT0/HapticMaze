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
      style={[styles.content, { marginTop: top }]}
      accessible
      accessibilityLabel="結果表示パネル"
    >
      <ThemedText type="title">{title}</ThemedText>
      <ThemedText>{steps}</ThemedText>
      <ThemedText>{bumps}</ThemedText>
      <ThemedText>{stageText}</ThemedText>
      {highScore && (
        <ThemedText>
          {t("best", {
            stage: highScore.stage,
            steps: highScore.steps,
            bumps: highScore.bumps,
          })}
        </ThemedText>
      )}
      {newRecord && <ThemedText>{t("newRecord")}</ThemedText>}
      <PlainButton
        title={okLabel}
        onPress={onOk}
        accessibilityLabel={accLabel}
        disabled={disabled}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: UI.colors.modalBg,
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    gap: UI.dpadSpacing,
    width: UI.modalWidth,
  },
});
