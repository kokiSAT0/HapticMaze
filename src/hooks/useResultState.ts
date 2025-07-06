import { useState } from 'react';

/**
 * リザルト表示に関する状態だけを管理するフック。
 * 表示の ON/OFF やフラグをまとめて扱います。
 */
export function useResultState() {
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [stageClear, setStageClear] = useState(false);
  const [gameClear, setGameClear] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [debugAll, setDebugAll] = useState(false);
  const [okLocked, setOkLocked] = useState(false);
  // 各ステージで広告を一度だけ表示したかを記録するフラグ
  const [adShown, setAdShown] = useState(false);

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
  } as const;
}
