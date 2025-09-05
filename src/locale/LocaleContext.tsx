import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useHandleError } from "@/src/utils/handleError";

export type Lang = "ja" | "en";

// 言語設定を保存する際のキー
const STORAGE_KEY = "lang";

// 画面で表示する文言の定義
// ja を原文として定義し、この型を基準に他言語をチェックする
const ja = {
    practiceMode: "練習モード",
    openPractice: "練習モードを開く",
    tutorial: "Tutorial",
    easy: "Easy ★☆☆",
    normal: "Normal ★★☆",
    hard: "Hard ★★★",
    startLevel: "{{name}}を開始",
    enemyRandom: "等速・ランダム",
    enemySlow: "鈍足・視認",
    enemySight: "等速・視認",
    enemyPathLen: "敵軌跡長",
    playerPathLen: "自分軌跡長",
    wallDuration: "壁表示",
    startMazeSize: "{{size}}マス迷路を開始",
    increase: "{{label}}を増やす",
    decrease: "{{label}}を減らす",
    bgmVolume: "BGM音量",
    seVolume: "SE音量",
    resetMaze: "迷路リセット",
    resetMazeLabel: "迷路を最初から",
    showAll: "全てを可視化",
    showMazeAll: "迷路を全て表示",
    hideMazeAll: "迷路の表示を解除",
    gameClear: "Congratulations!",
    gameOver: "GameOver",
    goal: "Goal!",
    steps: "ターン数: {{count}}",
    bumps: "壁衝突数: {{count}}",
    stage: "ステージ: {{current}}/{{total}}",
    // ハイスコア表示用のテンプレート。"Best:" の文言は不要なので省く
    best: "{{stage}}ステージ / {{steps}} ターン / {{bumps}} 衝突",
    result: "Your HighScore",
    highScores: "HighScore",
    openHighScores: "ハイスコア一覧を開く",
    options: "Settings",
    openOptions: "設定を開く",
    volumeSettings: "音量設定",
    noRecord: "記録なし",
    // ハイスコアを更新したときに表示するメッセージ
    newRecord: "記録更新！",
    ok: "OK",
    loadingAd: "広告を読み込んでいます",
    showAd: "広告を表示して次に進む",
    watchAdForReveal: "広告を見るともう一度全表示できます",
    removeAds: "広告を削除する",
    restorePurchase: "購入を復元する",
    // 購入完了時に表示するメッセージ
    purchaseSuccess: "広告削除を購入しました",
    // 復元完了時に表示するメッセージ
    restoreSuccess: "購入情報を復元しました",
    // 復元対象が見つからなかったときのメッセージ
    purchaseNotFound: "購入履歴が見つかりませんでした",
    // 購入をキャンセルしたときのメッセージ
    purchaseCancelled: "購入をキャンセルしました",
    // 購入処理に失敗したときのエラーメッセージ
    purchaseFailure: "購入に失敗しました",
    // 復元処理に失敗したときのエラーメッセージ
    restoreFailure: "復元に失敗しました",
    // BGM 音量の読み込みに失敗したときのエラーメッセージ
    loadBgmVolumeFailure: "BGM 音量を読み込めませんでした",
    // BGM 音量の保存に失敗したときのエラーメッセージ
    saveBgmVolumeFailure: "BGM 音量を保存できませんでした",
    // オーディオモードの設定に失敗したときのエラーメッセージ
    audioModeFailure: "オーディオ設定に失敗しました",
    // BGM 再生に失敗したときのエラーメッセージ
    playbackFailure: "BGM の再生に失敗しました",
    // 広告表示に失敗したときのエラーメッセージ
    adDisplayFailure: "広告を表示できませんでした",
    // 広告初期化に失敗したときのエラーメッセージ
    adInitFailure: "広告初期化に失敗しました",
    // 追跡許可の再取得に失敗したときのエラーメッセージ
    trackingPermissionFailure: "追跡許可の再取得に失敗しました",
    // SE 音量読込に失敗したときのエラーメッセージ
    loadSeVolumeFailure: "SE 音量を読み込めませんでした",
    // SE 音量保存に失敗したときのエラーメッセージ
    saveSeVolumeFailure: "SE 音量を保存できませんでした",
    // ハイスコア読込に失敗したときのエラーメッセージ
    loadHighScoreFailure: "ハイスコアを読み込めませんでした",
    // ハイスコア保存に失敗したときのエラーメッセージ
    saveHighScoreFailure: "ハイスコアを保存できませんでした",
    // ハイスコア削除に失敗したときのエラーメッセージ
    clearHighScoresFailure: "ハイスコアを削除できませんでした",
    nextStage: "次のステージへ",
    goGameResult: "ゲームリザルトへ進む",
    gameResults: "ゲームリザルト",
    stageRecord:
      "ステージ{{stage}}: {{steps}}ターン {{bumps}}衝突 リスポーン{{respawns}}回 可視化{{reveals}}回",
    totalStats:
      "合計 {{steps}}ターン {{bumps}}衝突 リスポーン{{respawns}}回 可視化{{reveals}}回",
    stepsGraph: "ステージごとのターン数",
    bumpsGraph: "ステージごとの壁衝突数",
    respawnsGraph: "ステージごとのリスポーン回数",
    revealsGraph: "ステージごとの可視化回数",
    changeLang: "Language",
    selectLang: "言語を選択してください",
    japanese: "日本語",
    english: "English",
    backToTitle: "タイトルへ戻る",
    continue: "続きから",
    startFromBegin: "{{name}}",
    needClearEasy: "Easyが未クリアです",
    needClearNormal: "Normalが未クリアです",
    confirmReset: "中断中のゲームデータを削除して新しいゲームを開始しますか？",
    confirmResetHighScores: "ハイスコアを全て削除しますか？",
    resetHighScores: "ハイスコアをリセット",
    suspendInfo: "難易度: {{level}} / ステージ: {{stage}}",
    yes: "はい",
    cancel: "キャンセル",
    back: "戻る",
    howToPlay: "ルール説明",
    openHowToPlay: "ルール説明を開く",
    ruleIntro:
      "\n各アイコンの意味は以下の通りです",
    respawnUsage:
      "敵の位置をリスポーン\nピンチの時に使用",
    revealUsage:
      "迷路全体を表示\n簡単になりすぎるので注意",
    // 敵の説明
    enemies: "敵\nプレイヤーを追跡中は色が変化する",
    player: "プレイヤーの現在位置",
    Goal: "挑戦中ステージのゴール地点",
    visitedGoals: "過去に到達したゴール地点",
    // アクセシビリティ用ラベル
    resultPanel: "結果表示パネル",
    adInfo: "広告設定情報",
    moveUp: "上へ移動",
    moveLeft: "左へ移動",
    moveRight: "右へ移動",
    moveDown: "下へ移動",
    stageNumber: "ステージ{{stage}}",
    languageSelectOverlay: "言語選択オーバーレイ",
    volumeSettingOverlay: "音量設定オーバーレイ",
    deleteLogs: "ログ削除",
    backToHome: "ホーム画面へ戻る",
    respawnEnemy: "敵をリスポーン",
    enemyIcon: "敵",
    playerIcon: "プレイヤー",
    goalIcon: "ゴール",
    visitedGoalIcon: "訪問済みゴール",
    resetConfirmOverlay: "リセット確認オーバーレイ",
    errorLogs: "エラーログ一覧",
    // エラーログが存在しない場合に表示するメッセージ
    noLogs: "ログはありません",
    // loadMaze でサイズが不正なときのエラーメッセージ
    invalidMazeSize: "迷路サイズは 5 または 10 を指定してください",
  } as const;

// 共通メッセージ型。ja のキーを string として定義
type Messages = { [K in keyof typeof ja]: string };
// メッセージのキー型を公開して他コンポーネントで利用可能にする
export type MessageKey = keyof Messages;

// en は ja と同じキーを持つ必要があるので satisfies を利用
const en = {
    practiceMode: "Practice Mode",
    openPractice: "Open Practice",
    tutorial: "Tutorial",
    // 難易度の名称（Easy）
    easy: "Easy ★☆☆",
    normal: "Normal ★★☆",
    hard: "Hard ★★★",
    startLevel: "Start {{name}}",
    enemyRandom: "Normal Random",
    enemySlow: "Slow Vision",
    enemySight: "Normal Vision",
    // 軌跡長関連
    enemyPathLen: "Enemy Path Length",
    playerPathLen: "Player Path Length",
    wallDuration: "Wall Lifetime",
    startMazeSize: "Start {{size}} maze",
    increase: "Increase {{label}}",
    decrease: "Decrease {{label}}",
    bgmVolume: "BGM Volume",
    seVolume: "SE Volume",
    resetMaze: "Reset Maze",
    resetMazeLabel: "Reset maze",
    showAll: "Show All",
    // 迷路全体の表示切替
    showMazeAll: "Show entire maze",
    hideMazeAll: "Hide entire maze",
    gameClear: "Game Clear",
    gameOver: "Game Over",
    goal: "Goal!",
    steps: "Steps: {{count}}",
    bumps: "Bumps: {{count}}",
    stage: "Stage: {{current}}/{{total}}",
    // Template for high score display. "Best:" is redundant so omit it
    best: "{{stage}} stages / {{steps}} steps / {{bumps}} bumps",
    // ハイスコア表示用タイトル
    result: "Your HighScore",
    highScores: "High Scores",
    openHighScores: "View High Scores",
    options: "Options",
    // 設定画面を開くボタン
    openOptions: "Open Settings",
    volumeSettings: "Volume Settings",
    noRecord: "No record",
    // Message shown when a new high score is achieved
    newRecord: "New Record!",
    ok: "OK",
    loadingAd: "Loading ad...",
    showAd: "Show ad and continue",
    watchAdForReveal: "Watch an ad to reveal again",
    removeAds: "Remove Ads",
    restorePurchase: "Restore Purchase",
    // Message shown when purchase completes successfully
    purchaseSuccess: "Ad removal purchased",
    // Message shown when restore completes successfully
    restoreSuccess: "Purchase restored",
    // Shown when no purchases were found to restore
    purchaseNotFound: "No purchases to restore",
    // Message shown when user cancels the purchase flow
    purchaseCancelled: "Purchase cancelled",
    // Message shown when purchase fails
    purchaseFailure: "Failed to complete purchase",
    // 復元処理に失敗したときのエラーメッセージ
    restoreFailure: "Failed to restore purchase",
    // BGM 音量の読み込みに失敗したときのエラーメッセージ
    loadBgmVolumeFailure: "Failed to load BGM volume",
    // BGM 音量の保存に失敗したときのエラーメッセージ
    saveBgmVolumeFailure: "Failed to save BGM volume",
    // オーディオモードの設定に失敗したときのエラーメッセージ
    audioModeFailure: "Failed to configure audio mode",
    // BGM 再生に失敗したときのエラーメッセージ
    playbackFailure: "Failed to play BGM",
    // Message shown when ad display fails
    adDisplayFailure: "Failed to show ad",
    // Message shown when ad initialization fails
    adInitFailure: "Failed to initialize ads",
    // Message shown when re-checking tracking permission fails
    trackingPermissionFailure: "Failed to re-check tracking permission",
    // SE 音量読込に失敗したときのエラーメッセージ
    loadSeVolumeFailure: "Failed to load SE volume",
    // SE 音量保存に失敗したときのエラーメッセージ
    saveSeVolumeFailure: "Failed to save SE volume",
    // Error message when loading high scores fails
    loadHighScoreFailure: "Failed to load high score",
    // Error message when saving high scores fails
    saveHighScoreFailure: "Failed to save high score",
    // Error message when clearing high scores fails
    clearHighScoresFailure: "Failed to clear high scores",
    nextStage: "Next stage",
    goGameResult: "View Game Results",
    gameResults: "Game Results",
    stageRecord:
      "Stage {{stage}}: {{steps}} steps {{bumps}} bumps respawns {{respawns}} reveals {{reveals}}",
    totalStats:
      "Total {{steps}} steps {{bumps}} bumps respawns {{respawns}} reveals {{reveals}}",
    stepsGraph: "Steps per stage",
    bumpsGraph: "Bumps per stage",
    respawnsGraph: "Respawns per stage",
    revealsGraph: "Reveals per stage",
    changeLang: "Language",
    selectLang: "Select language",
    japanese: "Japanese",
    english: "English",
    backToTitle: "Back to title",
    continue: "Continue",
    startFromBegin: "{{name}}",
    needClearEasy: "Easy level not cleared",
    needClearNormal: "Normal level not cleared",
    confirmReset: "Delete saved game and start a new one?",
    confirmResetHighScores: "Delete all high scores?",
    resetHighScores: "Reset High Scores",
    suspendInfo: "Level: {{level}} / Stage: {{stage}}",
    yes: "Yes",
    cancel: "Cancel",
    back: "Back",
    howToPlay: "How to Play",
    openHowToPlay: "Open How to Play",
    ruleIntro:
      "The icons below have the following meanings.",
    // リスポーン機能の説明
    respawnUsage:
      "Respawn enemy positions\nUse when you're in a pinch",
    revealUsage:
      "Reveals the entire maze\nBe careful, this makes the stage much easier",
    // Enemies の説明
    enemies: "Enemies. Their color changes while chasing the player",
    player: "Your current position",
    Goal: "Goal position for the current stage",
    visitedGoals: "Previously reached goal positions",
    // Accessibility labels
    resultPanel: "Result panel",
    adInfo: "Ad configuration info",
    moveUp: "Move up",
    moveLeft: "Move left",
    moveRight: "Move right",
    moveDown: "Move down",
    stageNumber: "Stage {{stage}}",
    languageSelectOverlay: "Language selection overlay",
    volumeSettingOverlay: "Volume settings overlay",
    deleteLogs: "Delete logs",
    backToHome: "Back to home",
    respawnEnemy: "Respawn enemy",
    enemyIcon: "Enemy",
    playerIcon: "Player",
    goalIcon: "Goal",
    visitedGoalIcon: "Visited goal",
    resetConfirmOverlay: "Reset confirmation overlay",
    errorLogs: "Error logs",
    // エラーログが存在しない場合に表示するテキスト
    noLogs: "No logs",
    // Error when an invalid maze size is specified in loadMaze
    invalidMazeSize: "Maze size must be 5 or 10",
  } as const satisfies Messages;

// 各言語のメッセージを Lang と Messages のレコードにまとめる
const messages = { ja, en } as const satisfies Record<Lang, Messages>;

// 文言を取得しプレースホルダーを差し替える簡易関数
function translate(
  lang: Lang,
  key: MessageKey,
  params?: Record<string, string | number>
) {
  // デフォルト言語の文言をフォールバックとして取得
  let template: string = messages[lang][key] ?? messages.ja[key];
  if (params) {
    // 渡されたプレースホルダーと値の組を順番に処理する
    for (const [k, v] of Object.entries(params)) {
      // すべての出現箇所を置換するため g フラグ付きの正規表現を使用
      const regex = new RegExp(`{{${k}}}`, "g");
      // 正規表現にマッチしたすべての箇所を実際の値に差し替える
      template = template.replace(regex, String(v));
    }
  }
  return template;
}

interface LocaleContextValue {
  lang: Lang;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  changeLang: (l: Lang) => Promise<void>;
  ready: boolean;
  firstLaunch: boolean;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ja");
  const [ready, setReady] = useState(false);
  const [firstLaunch, setFirstLaunch] = useState(false);
  const handleError = useHandleError();

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === "ja" || stored === "en") {
          setLang(stored);
        } else {
          // 言語未選択なら初回起動とみなす
          setFirstLaunch(true);
        }
      } catch (e) {
        handleError("言語設定の読み込みに失敗しました", e);
      } finally {
        // エラーの有無に関わらず ready にする
        setReady(true);
      }
    })();
  }, [handleError]);

  const changeLang = async (l: Lang) => {
    setLang(l);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, l);
    } catch (e) {
      handleError("言語設定を保存できませんでした", e);
    }
    setFirstLaunch(false);
  };

  // 翻訳関数をメモ化して無駄な再レンダリングを防ぐ
  const t = useCallback(
    (key: MessageKey, params?: Record<string, string | number>) =>
      translate(lang, key, params),
    [lang]
  );

  return (
    <LocaleContext.Provider value={{ lang, t, changeLang, ready, firstLaunch }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale は LocaleProvider 内で利用してください");
  return ctx;
}
