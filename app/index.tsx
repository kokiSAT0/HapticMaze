import React from "react";
import { Modal, StyleSheet, View } from "react-native";
import { PlainButton } from "@/components/PlainButton";
import { useRouter } from "expo-router";
import { useGame } from "@/src/game/useGame";
import { loadGame, clearGame } from "@/src/game/saveGame";
import { useSnackbar } from "@/src/hooks/useSnackbar";
import {
  useLocale,
  type Lang,
  type MessageKey,
} from "@/src/locale/LocaleContext";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { LEVELS } from "@/constants/levels";
import { useAudioControls } from "@/src/hooks/useAudioControls";

export default function TitleScreen() {
  const router = useRouter();
  const { newGame, loadState } = useGame();
  const { t, firstLaunch, changeLang } = useLocale();
  const { show: showSnackbar } = useSnackbar();

  const [showLang, setShowLang] = React.useState(false);
  const [hasSave, setHasSave] = React.useState(false);

  // BGM/SE を制御
  const audio = useAudioControls(
    require("../assets/sounds/歩く音200ms_調整.mp3"),
    require("../assets/sounds/弓と矢_調整.mp3")
  );

  // タイトル画面表示時に基本BGMへ切り替える
  React.useEffect(() => {
    if (audio.bgmReady) {
      audio.changeBgm(require("../assets/sounds/降りしきる、白_調整.mp3"));
    }
    // audio インスタンスは固定のため依存なし
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio.bgmReady]);

  // 初回起動時：言語選択モーダル
  React.useEffect(() => {
    if (firstLaunch) setShowLang(true);
  }, [firstLaunch]);

  // セーブデータ有無を確認
  React.useEffect(() => {
    (async () => {
      const data = await loadGame({ showError: showSnackbar });
      setHasSave(!!data);
    })();
  }, [showSnackbar]);


  const select = (lang: Lang) => {
    changeLang(lang);
    setShowLang(false);
  };

  // 実際の遷移完了を待つため async 関数に変更
  const startLevel = async (id: string) => {
    const level = LEVELS.find((l) => l.id === id);
    if (!level) return;
    // ゲーム開始直前にログを出してどのレベルを選んだか記録する
    console.log('[TitleScreen] startLevel', id);
    if (id === 'hard') {
      audio.changeBgm(require('../assets/sounds/日没廃校_調整.mp3'));
    } else {
      audio.changeBgm(require('../assets/sounds/降りしきる、白_調整.mp3'));
    }
    newGame(
      level.size,
      level.enemies,
      level.enemyPathLength,
      level.playerPathLength,
      level.wallLifetime,
      level.enemyCountsFn,
      level.wallLifetimeFn,
      level.biasedSpawn,
      level.biasedGoal,
      level.id,
      level.stagePerMap,
      level.respawnMax
    );
    // 画面遷移開始をログ
    console.log('[TitleScreen] navigate begin');
    await router.replace("/play");
    // 遷移完了も記録する
    console.log('[TitleScreen] navigate end', id);
  };

  const startLevelFromStart = (id: string) => {
    // 開始をログ出力
    console.log('[TitleScreen] startLevelFromStart begin', id);
    if (hasSave) {
      // 進行中データがある場合は確認ページへ遷移
      router.push(`/reset?level=${id}`);
    } else {
      confirmStart(id);
    }
    // 処理完了をログ出力
    console.log('[TitleScreen] startLevelFromStart end', id);
  };

  const confirmStart = async (id: string) => {
    // 開始をログ出力
    console.log('[TitleScreen] confirmStart begin', id);
    await clearGame({ showError: showSnackbar });
    setHasSave(false);
    await startLevel(id);
    // 処理完了をログ出力
    console.log('[TitleScreen] confirmStart end', id);
  };

  const resumeGame = async () => {
    // 開始をログ出力
    console.log('[TitleScreen] resumeGame begin');
    const data = await loadGame({ showError: showSnackbar });
    if (!data) {
      console.log('[TitleScreen] resumeGame no data');
      return;
    }
    loadState(data);
    router.replace("/play");
    // 処理完了をログ出力
    console.log('[TitleScreen] resumeGame end');
  };

  return (
    <ThemedView lightColor="#000" darkColor="#000" style={styles.container}>
      <ThemedText type="title" lightColor="#fff" darkColor="#fff">
        Maze Sense
      </ThemedText>

      <PlainButton
        title={t("practiceMode")}
        onPress={() => router.push("/practice")}
        accessibilityLabel={t("openPractice")}
      />

      {hasSave && (
        <PlainButton
          title={t("continue")}
          onPress={resumeGame}
          accessibilityLabel={t("continue")}
        />
      )}

      {LEVELS.map((lv) => (
        <PlainButton
          key={lv.id}
          title={t("startFromBegin", { name: t(lv.id as MessageKey) })}
          onPress={() => startLevelFromStart(lv.id)}
          accessibilityLabel={t("startFromBegin", { name: t(lv.id as MessageKey) })}
        />
      ))}

      <PlainButton
        title={t("highScores")}
        onPress={() => router.push("/scores")}
        accessibilityLabel={t("openHighScores")}
      />

      <PlainButton
        title={t("options")}
        onPress={() => router.push("/options")}
        accessibilityLabel={t("openOptions")}
      />

      {/* ───── 言語選択モーダル ───── */}
      <Modal transparent visible={showLang} animationType="fade">
        <View style={styles.modalWrapper} accessible accessibilityLabel="言語選択オーバーレイ">
          <ThemedView style={styles.modalContent}>
            <ThemedText type="title" lightColor="#fff" darkColor="#fff">
              {t("selectLang")}
            </ThemedText>
            <PlainButton title={t("japanese")} onPress={() => select("ja")} accessibilityLabel={t("japanese")} />
            <PlainButton title={t("english")} onPress={() => select("en")} accessibilityLabel={t("english")} />
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
    backgroundColor: "#000",
  },
  modalContent: {
    gap: 16,
    padding: 24,
    backgroundColor: "#000",
  },
  volumeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  volumeLabelArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4, // ラベルと数値の間隔
  },
  volumeNumber: {
    width: 24, // 0〜10 を右寄せで固定表示
    textAlign: "right",
    marginLeft: 0,
  },
  volBtns: {
    flexDirection: "row",
    gap: 2,
    alignItems: "center",
  },
  volBtn: {
    padding: 4,
  },
});

