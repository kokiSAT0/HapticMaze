import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useHandleError } from '@/src/utils/handleError';

export type Lang = "ja" | "en";

// 言語設定を保存する際のキー
const STORAGE_KEY = "lang";

// 画面で表示する文言の定義
const messages = {
  ja: {
    practiceMode: "練習モード",
    openPractice: "練習モードを開く",
    tutorial: "チュートリアル",
    easy: "イージー",
    normal: "ノーマル",
    hard: "ハード",
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
    gameClear: "ゲームクリア",
    gameOver: "ゲームオーバー",
    goal: "ゴール！",
    steps: "Steps: {{count}}",
    bumps: "Bumps: {{count}}",
    stage: "Stage: {{current}}/{{total}}",
    best: "Best: {{stage}}ステージ / {{steps}} steps / {{bumps}} bumps",
    highScores: "ハイスコア",
    openHighScores: "ハイスコア一覧を開く",
    options: "オプション",
    openOptions: "設定を開く",
    volumeSettings: "音量設定",
    noRecord: "記録なし",
    // ハイスコアを更新したときに表示するメッセージ
    newRecord: "記録更新！",
    ok: "OK",
    loadingAd: "広告を読み込んでいます",
    showAd: "広告を表示して次に進む",
    nextStage: "次のステージへ",
    changeLang: "Language",
    selectLang: "言語を選択してください",
    japanese: "日本語",
    english: "English",
    backToTitle: "タイトルへ戻る",
    continue: "つづきから",
    startFromBegin: "{{name}}をはじめからプレイ",
    confirmReset: "中断中のゲームデータを削除して新しいゲームを開始しますか？",
    yes: "はい",
    cancel: "キャンセル",
  },
  en: {
    practiceMode: "Practice Mode",
    openPractice: "Open Practice",
    tutorial: "Tutorial",
    easy: "Easy",
    normal: "Normal",
    hard: "Hard",
    startLevel: "Start {{name}}",
    enemyRandom: "Normal Random",
    enemySlow: "Slow Vision",
    enemySight: "Normal Vision",
    enemyPathLen: "Enemy Path",
    playerPathLen: "Player Path",
    wallDuration: "Wall Lifetime",
    startMazeSize: "Start {{size}} maze",
    increase: "Increase {{label}}",
    decrease: "Decrease {{label}}",
    bgmVolume: "BGM Volume",
    seVolume: "SE Volume",
    resetMaze: "Reset Maze",
    resetMazeLabel: "Reset maze",
    showAll: "Show All",
    showMazeAll: "Show whole maze",
    gameClear: "Game Clear",
    gameOver: "Game Over",
    goal: "Goal!",
    steps: "Steps: {{count}}",
    bumps: "Bumps: {{count}}",
    stage: "Stage: {{current}}/{{total}}",
    best: "Best: {{stage}} stages / {{steps}} steps / {{bumps}} bumps",
    highScores: "High Scores",
    openHighScores: "View High Scores",
    options: "Options",
    openOptions: "Open settings",
    volumeSettings: "Volume Settings",
    noRecord: "No record",
    // Message shown when a new high score is achieved
    newRecord: "New Record!",
    ok: "OK",
    loadingAd: "Loading ad...",
    showAd: "Show ad and continue",
    nextStage: "Next stage",
    changeLang: "Language",
    selectLang: "Select language",
    japanese: "Japanese",
    english: "English",
    backToTitle: "Back to title",
    continue: "Continue",
    startFromBegin: "Play {{name}} from start",
    confirmReset: "Delete saved game and start new?",
    yes: "Yes",
    cancel: "Cancel",
  },
} as const;

type Messages = typeof messages.ja;
export type MessageKey = keyof Messages;

// 文言を取得しプレースホルダーを差し替える簡易関数
function translate(
  lang: Lang,
  key: MessageKey,
  params?: Record<string, string | number>,
) {
  let template = messages[lang][key] ?? messages.ja[key];
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      template = template.replace(`{{${k}}}`, String(v));
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
        handleError('言語設定の読み込みに失敗しました', e);
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
      handleError('言語設定を保存できませんでした', e);
    }
    setFirstLaunch(false);
  };

  // 翻訳関数をメモ化して無駄な再レンダリングを防ぐ
  const t = useCallback(
    (key: MessageKey, params?: Record<string, string | number>) =>
      translate(lang, key, params),
    [lang],
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
