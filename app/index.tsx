import React from "react";
import { Modal, StyleSheet, View, ScrollView } from "react-native";
import { PlainButton } from "@/components/PlainButton";
import { useRouter } from "expo-router";
// expo-iap からエラーコード定数を取得
import { ErrorCode } from "expo-iap";
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
import { useLevelUnlock } from "@/src/hooks/useLevelUnlock";
import { UI } from "@/constants/ui";
import { devLog } from "@/src/utils/logger";
import { useResultState } from "@/src/hooks/useResultState";
import { useRunRecords } from "@/src/hooks/useRunRecords";
import { useHandleError } from "@/src/utils/handleError";
// 広告削除課金機能
import { useRemoveAds } from "@/src/iap/removeAds";

// EXPO_PUBLIC_UNLOCK_ALL_LEVELS が 'true' のとき
// クリア状況に関わらず全難易度を選択可能にする
const UNLOCK_ALL_LEVELS = process.env.EXPO_PUBLIC_UNLOCK_ALL_LEVELS === "true";

export default function TitleScreen() {
  const router = useRouter();
  const { newGame, loadState } = useGame();
  const { t, firstLaunch, changeLang } = useLocale();
  const { show: showSnackbar } = useSnackbar();
  const { isCleared } = useLevelUnlock();
  // 可視化フラグのリセット用フックを取得
  const { setDebugAll } = useResultState();
  // ステージ記録を管理するフック
  const { reset } = useRunRecords();
  // エラー処理共通化のためのハンドラ
  const handleError = useHandleError();

  const [showLang, setShowLang] = React.useState(false);
  const [hasSave, setHasSave] = React.useState(false);

  // 広告削除購入処理を提供するフック
  // 広告削除購入済みフラグと購入処理
  const { adsRemoved, purchase } = useRemoveAds();

  // 広告削除を購入する処理
  const handlePurchase = async () => {
    try {
      await purchase();
      showSnackbar(t("removeAds"));
    } catch (e) {
      // ユーザーが購入処理を途中でキャンセルした場合はエラー扱いしない
      if ((e as { code?: string }).code === ErrorCode.E_USER_CANCELLED) {
        showSnackbar(t("purchaseCancelled"));
        return;
      }
      // それ以外は共通エラーハンドラへ
      handleError("購入に失敗しました", e);
    }
  };

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
    devLog("[TitleScreen] startLevel", id);
    if (id === "hard") {
      audio.changeBgm(require("../assets/sounds/日没廃校_調整.mp3"));
    } else {
      audio.changeBgm(require("../assets/sounds/降りしきる、白_調整.mp3"));
    }
    // 前回の可視化状態とステージ記録を初期化する
    setDebugAll(false);
    reset();
    newGame({
      size: level.size,
      counts: level.enemies,
      enemyPathLength: level.enemyPathLength,
      playerPathLength: level.playerPathLength,
      wallLifetime: level.wallLifetime,
      enemyCountsFn: level.enemyCountsFn,
      wallLifetimeFn: level.wallLifetimeFn,
      showAdjacentWalls: level.showAdjacentWalls,
      showAdjacentWallsFn: level.showAdjacentWallsFn,
      playerAdjacentLife: level.playerAdjacentLife,
      enemyAdjacentLife: level.enemyAdjacentLife,
      biasedSpawn: level.biasedSpawn,
      biasedGoal: level.biasedGoal,
      levelId: level.id,
      stagePerMap: level.stagePerMap,
      respawnMax: level.respawnMax,
    });
    // 画面遷移開始をログ
    devLog("[TitleScreen] navigate begin");
    await router.replace("/play");
    // 遷移完了も記録する
    devLog("[TitleScreen] navigate end", id);
  };

  const startLevelFromStart = (id: string) => {
    // 開始をログ出力
    devLog("[TitleScreen] startLevelFromStart begin", id);
    if (hasSave) {
      // 進行中データがある場合は確認ページへ遷移
      router.push(`/reset?level=${id}`);
    } else {
      confirmStart(id);
    }
    // 処理完了をログ出力
    devLog("[TitleScreen] startLevelFromStart end", id);
  };

  const confirmStart = async (id: string) => {
    // 開始をログ出力
    devLog("[TitleScreen] confirmStart begin", id);
    await clearGame({ showError: showSnackbar });
    setHasSave(false);
    await startLevel(id);
    // 処理完了をログ出力
    devLog("[TitleScreen] confirmStart end", id);
  };

  // 各レベルが選択可能かを判定する関数
  const getLockReason = (id: string): string | null => {
    // フラグが有効なら常に null を返して全レベル解放
    if (UNLOCK_ALL_LEVELS) return null;
    if (id === "normal" && !isCleared("easy")) return t("needClearEasy");
    if (id === "hard" && !isCleared("normal")) return t("needClearNormal");
    return null;
  };

  const resumeGame = async () => {
    // 開始をログ出力
    devLog("[TitleScreen] resumeGame begin");
    const data = await loadGame({ showError: showSnackbar });
    if (!data) {
      devLog("[TitleScreen] resumeGame no data");
      return;
    }
    loadState(data);
    router.replace("/play");
    // 処理完了をログ出力
    devLog("[TitleScreen] resumeGame end");
  };

  return (
    <ThemedView lightColor="#000" darkColor="#000" style={{ flex: 1 }}>
      {/* 小さい画面でも内容をスクロールして閲覧できるように */}
      <ScrollView contentContainerStyle={styles.container}>
        {/* タイトルの文字サイズを定数から調整できるように */}
        <ThemedText
          type="title"
          lightColor="#fff"
          darkColor="#fff"
          style={styles.title}
        >
          Maze Sense
        </ThemedText>

        {/* <PlainButton
        title={t("practiceMode")}
        onPress={() => router.push("/practice")}
        accessibilityLabel={t("openPractice")}
      /> */}

        {hasSave && (
          <PlainButton
            title={t("continue")}
            onPress={resumeGame}
            accessibilityLabel={t("continue")}
          />
        )}

        {LEVELS.map((lv) => {
          const reason = getLockReason(lv.id);
          return (
            <PlainButton
              key={lv.id}
              title={t("startFromBegin", { name: t(lv.id as MessageKey) })}
              onPress={() => {
                if (reason) {
                  showSnackbar(reason);
                } else {
                  startLevelFromStart(lv.id);
                }
              }}
              disabled={!!reason}
              accessibilityLabel={t("startFromBegin", {
                name: t(lv.id as MessageKey),
              })}
            />
          );
        })}

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

        {/* エラーログ一覧へ遷移するボタン */}
        {/* <PlainButton
          title="エラーログ"
          onPress={() => router.push("/error-logs")}
          accessibilityLabel="エラーログ"
        /> */}

        {/* 一番下にルール説明ページへのリンクを追加 */}
        <PlainButton
          title={t("howToPlay")}
          onPress={() => router.push("/rules")}
          accessibilityLabel={t("openHowToPlay")}
        />
        {/* ホーム画面にも広告削除オプションを表示 */}
        {/* 購入済みならボタンを非表示にする */}
        {!adsRemoved && (
          <PlainButton
            title={t("removeAds")}
            onPress={handlePurchase}
            accessibilityLabel={t("removeAds")}
          />
        )}

        {/* デバッグ用に表示していた広告IDは本番では不要なため削除 */}
      </ScrollView>

      {/* ───── 言語選択モーダル ───── */}
      <Modal transparent visible={showLang} animationType="fade">
        <View
          style={styles.modalWrapper}
          accessible
          accessibilityLabel="言語選択オーバーレイ"
        >
          <ThemedView style={styles.modalContent}>
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    // 選択肢間の余白をホーム画面用定数から参照
    gap: UI.titleScreen.optionGap,
    paddingVertical: UI.screenGap,
  },
  // タイトル文字のサイズを変更しやすくするためのスタイル
  title: {
    fontSize: UI.titleScreen.titleFontSize,
    lineHeight: UI.titleScreen.titleFontSize,
  },
  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  modalContent: {
    gap: UI.modalGap,
    padding: UI.modalPadding,
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
