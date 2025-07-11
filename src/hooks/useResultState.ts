import React, { createContext, useContext, useState, type ReactNode } from "react";

// ResultState の値をまとめたインターフェース
interface ResultStateValue {
  showResult: boolean;
  setShowResult: (v: boolean) => void;
  gameOver: boolean;
  setGameOver: (v: boolean) => void;
  stageClear: boolean;
  setStageClear: (v: boolean) => void;
  gameClear: boolean;
  setGameClear: (v: boolean) => void;
  showMenu: boolean;
  setShowMenu: (v: boolean) => void;
  debugAll: boolean;
  setDebugAll: (v: boolean) => void;
  okLocked: boolean;
  setOkLocked: (v: boolean) => void;
  adShown: boolean;
  setAdShown: (v: boolean) => void;
  showBanner: boolean;
  setShowBanner: (v: boolean) => void;
  bannerStage: number;
  setBannerStage: (v: number) => void;
  // ステージ1バナーを一度だけ表示したかどうか
  bannerShown: boolean;
  setBannerShown: (v: boolean) => void;
  // 全表示機能を何回使ったかのカウンター
  revealUsed: number;
  setRevealUsed: (v: number) => void;
}

const ResultStateContext = createContext<ResultStateValue | undefined>(undefined);

// Provider コンポーネント。App 全体をラップして状態を共有する
export function ResultStateProvider({ children }: { children: ReactNode }) {
  const value = useResultStateImpl();
  return React.createElement(
    ResultStateContext.Provider,
    { value },
    children
  );
}

// 実際の状態管理ロジックを分離
function useResultStateImpl(): ResultStateValue {
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [stageClear, setStageClear] = useState(false);
  const [gameClear, setGameClear] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [debugAll, setDebugAll] = useState(false);
  const [okLocked, setOkLocked] = useState(false);
  // 各ステージで広告を一度だけ表示したかを記録するフラグ
  const [adShown, setAdShown] = useState(false);
  // 全表示機能を使った回数を保持するカウンター
  const [revealUsed, setRevealUsed] = useState(0);
  // ステージ番号を表示する黒画面の表示フラグ
  const [showBanner, setShowBanner] = useState(false);
  // バナーに表示する次のステージ番号
  const [bannerStage, setBannerStage] = useState(0);
  // ステージ1バナーを一度だけ表示したかを保持するフラグ
  const [bannerShown, setBannerShown] = useState(false);

  return {
    showResult,
    setShowResult,
    gameOver,
    setGameOver,
    stageClear,
    setStageClear,
    gameClear,
    setGameClear,
    showMenu,
    setShowMenu,
    debugAll,
    setDebugAll,
    okLocked,
    setOkLocked,
    adShown,
    setAdShown,
    showBanner,
    setShowBanner,
    bannerStage,
    setBannerStage,
    bannerShown,
    setBannerShown,
    revealUsed,
    setRevealUsed,
  } as const;
}

// Context から状態を取得するフック
export function useResultState(): ResultStateValue {
  const ctx = useContext(ResultStateContext);
  if (!ctx) {
    throw new Error('useResultState は ResultStateProvider 内で利用してください');
  }
  return ctx;
}
