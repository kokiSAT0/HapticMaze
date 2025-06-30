import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Lang = 'ja' | 'en';

// 言語設定を保存する際のキー
const STORAGE_KEY = 'lang';

// 画面で表示する文言の定義
const messages = {
  ja: {
    practiceMode: '練習モード',
    openPractice: '練習モードを開く',
    level1: 'レベル1',
    level2: 'レベル2',
    startLevel: '{{name}}を開始',
    enemyRandom: '等速・ランダム',
    enemySlow: '鈍足・視認',
    enemySight: '等速・視認',
    enemyPathLen: '敵軌跡長',
    playerPathLen: '自分軌跡長',
    wallDuration: '壁表示',
    startMazeSize: '{{size}}マス迷路を開始',
    increase: '{{label}}を増やす',
    decrease: '{{label}}を減らす',
    resetMaze: '迷路リセット',
    resetMazeLabel: '迷路を最初から',
    showAll: '全てを可視化',
    showMazeAll: '迷路を全て表示',
    gameClear: 'ゲームクリア',
    gameOver: 'ゲームオーバー',
    goal: 'ゴール！',
    steps: 'Steps: {{count}}',
    bumps: 'Bumps: {{count}}',
    stage: 'Stage: {{current}}/{{total}}',
    best: 'Best: {{stage}}ステージ / {{steps}} steps / {{bumps}} bumps',
    ok: 'OK',
    changeLang: '言語設定',
    selectLang: '言語を選択してください',
    japanese: '日本語',
    english: 'English',
    backToTitle: 'タイトルへ戻る',
  },
  en: {
    practiceMode: 'Practice Mode',
    openPractice: 'Open Practice',
    level1: 'Level 1',
    level2: 'Level 2',
    startLevel: 'Start {{name}}',
    enemyRandom: 'Normal Random',
    enemySlow: 'Slow Vision',
    enemySight: 'Normal Vision',
    enemyPathLen: 'Enemy Path',
    playerPathLen: 'Player Path',
    wallDuration: 'Wall Lifetime',
    startMazeSize: 'Start {{size}} maze',
    increase: 'Increase {{label}}',
    decrease: 'Decrease {{label}}',
    resetMaze: 'Reset Maze',
    resetMazeLabel: 'Reset maze',
    showAll: 'Show All',
    showMazeAll: 'Show whole maze',
    gameClear: 'Game Clear',
    gameOver: 'Game Over',
    goal: 'Goal!',
    steps: 'Steps: {{count}}',
    bumps: 'Bumps: {{count}}',
    stage: 'Stage: {{current}}/{{total}}',
    best: 'Best: {{stage}} stages / {{steps}} steps / {{bumps}} bumps',
    ok: 'OK',
    changeLang: 'Language',
    selectLang: 'Select language',
    japanese: 'Japanese',
    english: 'English',
    backToTitle: 'Back to title',
  },
} as const;

type Messages = typeof messages.ja;
export type MessageKey = keyof Messages;

// 文言を取得しプレースホルダーを差し替える簡易関数
function translate(lang: Lang, key: MessageKey, params?: Record<string, string | number>) {
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
  const [lang, setLang] = useState<Lang>('ja');
  const [ready, setReady] = useState(false);
  const [firstLaunch, setFirstLaunch] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored === 'ja' || stored === 'en') {
        setLang(stored);
      } else {
        // 言語未選択なら初回起動とみなす
        setFirstLaunch(true);
      }
      setReady(true);
    })();
  }, []);

  const changeLang = async (l: Lang) => {
    setLang(l);
    await AsyncStorage.setItem(STORAGE_KEY, l);
    setFirstLaunch(false);
  };

  const t = (key: MessageKey, params?: Record<string, string | number>) =>
    translate(lang, key, params);

  return (
    <LocaleContext.Provider value={{ lang, t, changeLang, ready, firstLaunch }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale は LocaleProvider 内で利用してください');
  return ctx;
}
