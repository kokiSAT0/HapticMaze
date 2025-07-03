import React from "react";
import { Modal, StyleSheet, View } from "react-native";
import { PlainButton } from "@/components/PlainButton";
import { useRouter } from "expo-router";
import { useGame } from "@/src/game/useGame";
import { loadGame, clearGame } from "@/src/game/saveGame";
import {
  useLocale,
  type Lang,
  type MessageKey,
} from "@/src/locale/LocaleContext";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { LEVELS } from "@/constants/levels";

export default function TitleScreen() {
  const router = useRouter();
  // GameProvider から新しい迷路を読み込む関数を取得
  const { newGame, loadState } = useGame();
  // 言語関連のフックを取得
  const { t, firstLaunch, changeLang } = useLocale();
  const [showLang, setShowLang] = React.useState(false);
  const [hasSave, setHasSave] = React.useState(false);
  const [confirmReset, setConfirmReset] = React.useState(false);
  const [pendingLevel, setPendingLevel] = React.useState<string | null>(null);

  // 初回起動時は言語選択モーダルを表示する
  React.useEffect(() => {
    if (firstLaunch) setShowLang(true);
  }, [firstLaunch]);

  React.useEffect(() => {
    (async () => {
      const data = await loadGame();
      setHasSave(!!data);
    })();
  }, []);

  const select = (lang: Lang) => {
    changeLang(lang);
    setShowLang(false);
  };

  // 定義済みレベルの設定を使ってゲームを開始する
  const startLevel = (id: string) => {
    const level = LEVELS.find((l) => l.id === id);
    if (!level) return;
    newGame(
      level.size,
      level.enemies,
      level.enemyPathLength,
      level.playerPathLength,
      level.wallLifetime,
      level.enemyCountsFn,
      level.wallLifetimeFn,
      level.biasedSpawn,
      level.id
    );
    router.replace("/play");
  };

  // 中断データがある場合に確認してから開始する
  const startLevelFromStart = (id: string) => {
    if (hasSave) {
      setPendingLevel(id);
      setConfirmReset(true);
    } else {
      confirmStart(id);
    }
  };

  const confirmStart = async (id: string) => {
    await clearGame();
    setHasSave(false);
    startLevel(id);
  };

  const resumeGame = async () => {
    const data = await loadGame();
    if (!data) return;
    loadState(data);
    router.replace('/play');
  };
  return (
    <ThemedView
      /* 背景色を黒に固定。light/dark ともに同じ色を指定する */
      lightColor="#000"
      darkColor="#000"
      style={styles.container}
    >
      {/* アプリタイトル。文字色を白にして視認性を高める */}
      <ThemedText type="title" lightColor="#fff" darkColor="#fff">
        Maze Sense
      </ThemedText>
      {/* 練習モードへの遷移 */}
      <PlainButton
        title={t("practiceMode")}
        onPress={() => router.push("/practice")}
        accessibilityLabel={t("openPractice")}
      />
      {/* 中断データがあれば続きからを表示 */}
      {hasSave && (
        <PlainButton
          title={t('continue')}
          onPress={resumeGame}
          accessibilityLabel={t('continue')}
        />
      )}
      {/* プリセットレベルの開始ボタン */}
      {LEVELS.map((lv) => (
        <PlainButton
          key={lv.id}
          title={t('startFromBegin', { name: t(lv.id as MessageKey) })}
          onPress={() => startLevelFromStart(lv.id)}
          accessibilityLabel={t('startFromBegin', { name: t(lv.id as MessageKey) })}
        />
      ))}
      {/* ハイスコア画面への遷移ボタン */}
      <PlainButton
        title={t("highScores")}
        onPress={() => router.push("/scores")}
        accessibilityLabel={t("openHighScores")}
      />
      {/* 言語切り替え用ボタン */}
      <PlainButton
        title={t("changeLang")}
        onPress={() => setShowLang(true)}
        accessibilityLabel={t("changeLang")}
      />
      {/* 言語選択モーダル */}
      <Modal transparent visible={showLang} animationType="fade">
        <View
          style={styles.modalWrapper}
          accessible
          accessibilityLabel="言語選択オーバーレイ"
        >
          <ThemedView style={styles.modalContent}>
            {/* モーダル内では背景が黒なので、文字色を白に固定して読みやすくする */}
            <ThemedText type="title" lightColor="#fff" darkColor="#fff">
              {t("selectLang")}
            </ThemedText>
            <PlainButton
              title={t("japanese")}
              onPress={() => select("ja")}
              accessibilityLabel={t("japanese")}
            />
            <PlainButton
              title={t("english")}
              onPress={() => select("en")}
              accessibilityLabel={t("english")}
            />
          </ThemedView>
        </View>
      </Modal>
      {/* 中断データ削除確認モーダル */}
      <Modal transparent visible={confirmReset} animationType="fade">
        <View
          style={styles.modalWrapper}
          accessible
          accessibilityLabel="リセット確認オーバーレイ"
        >
          <ThemedView style={styles.modalContent}>
            <ThemedText type="title" lightColor="#fff" darkColor="#fff">
              {t('confirmReset')}
            </ThemedText>
            <PlainButton
              title={t('yes')}
              onPress={() => {
                if (pendingLevel) confirmStart(pendingLevel);
                setConfirmReset(false);
              }}
              accessibilityLabel={t('yes')}
            />
            <PlainButton
              title={t('cancel')}
              onPress={() => setConfirmReset(false)}
              accessibilityLabel={t('cancel')}
            />
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // 背景を不透明にして背後が透けないようにする
    backgroundColor: "#000",
  },
  modalContent: {
    gap: 16,
    padding: 24,
    backgroundColor: "#000",
  },
});
