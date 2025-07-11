/* eslint-disable import/first */

// React の機能は簡易モックで置き換え
jest.mock('react', () => ({
  useEffect: jest.fn(),
  useRef: (init: any) => ({ current: init }),
}));

// 状態管理フックをモック
let showResult = true;
let stageClear = true;
let gameOver = false;
let gameClear = false;
const setShowResult = jest.fn((v: boolean) => {
  showResult = v;
});
const setStageClear = jest.fn((v: boolean) => {
  stageClear = v;
});
const setGameOver = jest.fn((v: boolean) => {
  gameOver = v;
});
const setGameClear = jest.fn((v: boolean) => {
  gameClear = v;
});
const setDebugAll = jest.fn();
const setNewRecord = jest.fn();
const setOkLocked = jest.fn();
const setShowMenu = jest.fn();
let adShown = false;
const setAdShown = jest.fn((v: boolean) => {
  adShown = v;
});
let bannerStage = 0;
const setBannerStage = jest.fn((v: number) => {
  bannerStage = v;
});
let bannerShown = false;
const setBannerShown = jest.fn((v: boolean) => {
  bannerShown = v;
});

jest.mock('@/src/hooks/useResultState', () => ({
  useResultState: () => ({
    showResult,
    setShowResult,
    gameOver,
    setGameOver,
    stageClear,
    setStageClear,
    gameClear,
    setGameClear,
    showMenu: false,
    setShowMenu,
    debugAll: false,
    setDebugAll,
    okLocked: false,
    setOkLocked,
    adShown,
    setAdShown,
    showBanner: false,
    setShowBanner: jest.fn(),
    bannerStage,
    setBannerStage,
    bannerShown,
    setBannerShown,
    revealUsed: 0,
    setRevealUsed: jest.fn(),
  }),
}));

jest.mock('@/src/hooks/useHighScore', () => ({
  useHighScore: () => ({
    highScore: null,
    newRecord: false,
    setNewRecord,
    updateScore: jest.fn(),
  }),
}));

const loadAdIfNeeded = jest.fn();
const showAd = jest.fn(async () => {
  // 広告表示時の状態を確認する
  expect(showResult).toBe(false);
  expect(stageClear).toBe(true);
  // 広告が表示された想定で true を返す
  return true;
});

jest.mock('@/src/hooks/useStageEffects', () => ({
  useStageEffects: () => ({ loadAdIfNeeded, showAd }),
}));

// clearGame 関数をモックして呼び出し確認に使う
const clearGame = jest.fn();
jest.mock('@/src/game/saveGame', () => ({ clearGame }));

import { useResultActions } from '@/src/hooks/useResultActions';

describe('handleOk の広告表示後処理', () => {
  beforeEach(() => {
    showResult = true;
    stageClear = true;
    gameOver = false;
    gameClear = false;
    adShown = false;
    jest.clearAllMocks();
  });

  test('広告表示後は同じリザルト画面を維持する', async () => {
    const nextStage = jest.fn();
    const resetRun = jest.fn();
    const router = { replace: jest.fn() };

    const actions = useResultActions({
      state: { stage: 2 } as any,
      maze: { size: 10 } as any,
      nextStage,
      resetRun,
      router,
      pauseBgm: jest.fn(),
      resumeBgm: jest.fn(),
    });

    await actions.handleOk();

    expect(showAd).toHaveBeenCalledWith(null);
    expect(nextStage).not.toHaveBeenCalled();
    expect(showResult).toBe(true);
    expect(stageClear).toBe(true);
  });

  test('広告表示後の再押下で次ステージへ進む', async () => {
    const nextStage = jest.fn();
    const resetRun = jest.fn();
    const router = { replace: jest.fn() };

    // 既に広告を見た状態を想定
    adShown = true;

    const actions = useResultActions({
      state: { stage: 2 } as any,
      maze: { size: 10 } as any,
      nextStage,
      resetRun,
      router,
      pauseBgm: jest.fn(),
      resumeBgm: jest.fn(),
    });

    await actions.handleOk();

    expect(showAd).not.toHaveBeenCalled();
    expect(nextStage).toHaveBeenCalled();
    expect(showResult).toBe(false);
    expect(stageClear).toBe(false);
  });

  test('広告条件外ならリザルトを再表示しない', async () => {
    const nextStage = jest.fn();
    const resetRun = jest.fn();
    const router = { replace: jest.fn() };

    // このテストでは広告を表示しない想定で false を返す
    showAd.mockResolvedValueOnce(false);

    const actions = useResultActions({
      state: { stage: 3 } as any,
      maze: { size: 10 } as any,
      nextStage,
      resetRun,
      router,
      pauseBgm: jest.fn(),
      resumeBgm: jest.fn(),
    });

    await actions.handleOk();

    expect(showAd).toHaveBeenCalledWith(null);
    // 広告が無いのでそのまま次ステージへ
    expect(nextStage).toHaveBeenCalled();
    expect(showResult).toBe(false);
    expect(stageClear).toBe(false);
  });

  test('広告なしでもリザルト非表示を維持', async () => {
    const nextStage = jest.fn();
    const resetRun = jest.fn();
    const router = { replace: jest.fn() };

    // ステージクリアでない状態を想定
    stageClear = false;

    const actions = useResultActions({
      state: { stage: 1 } as any,
      maze: { size: 10 } as any,
      nextStage,
      resetRun,
      router,
      pauseBgm: jest.fn(),
      resumeBgm: jest.fn(),
    });

    await actions.handleOk();

    // 広告やステージ遷移は呼ばれない
    expect(showAd).not.toHaveBeenCalled();
    expect(nextStage).not.toHaveBeenCalled();

    // リザルト関連フラグは false のまま
    expect(showResult).toBe(false);
  });

  test('ステート更新が非同期でもリザルトを再表示できる', async () => {
    const nextStage = jest.fn();
    const resetRun = jest.fn();
    const router = { replace: jest.fn() };

    // 非同期で値が書き換わるようにモックする
    setShowResult.mockImplementation(async (v: boolean) => {
      await Promise.resolve();
      showResult = v;
    });
    setStageClear.mockImplementation(async (v: boolean) => {
      await Promise.resolve();
      stageClear = v;
    });

    const actions = useResultActions({
      state: { stage: 2 } as any,
      maze: { size: 10 } as any,
      nextStage,
      resetRun,
      router,
      pauseBgm: jest.fn(),
      resumeBgm: jest.fn(),
    });

    await actions.handleOk();
    await Promise.resolve();

    expect(showAd).toHaveBeenCalledWith(null);
    expect(nextStage).not.toHaveBeenCalled();
    expect(showResult).toBe(true);
    expect(stageClear).toBe(true);
  });

  test('ゲームオーバー時はセーブデータを削除してタイトルへ戻る', async () => {
    const nextStage = jest.fn();
    const resetRun = jest.fn();
    const router = { replace: jest.fn() };

    // ゲームオーバー状態を再現する
    gameOver = true;

    const actions = useResultActions({
      state: { stage: 1 } as any,
      maze: { size: 10 } as any,
      nextStage,
      resetRun,
      router,
      pauseBgm: jest.fn(),
      resumeBgm: jest.fn(),
    });

    await actions.handleOk();

    expect(clearGame).toHaveBeenCalled();
    expect(resetRun).toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith('/');
  });

  test('ゲームクリア時もセーブデータを削除してタイトルへ戻る', async () => {
    const nextStage = jest.fn();
    const resetRun = jest.fn();
    const router = { replace: jest.fn() };

    // ゲームクリア状態を再現する
    gameClear = true;

    const actions = useResultActions({
      state: { stage: 3 } as any,
      maze: { size: 10 } as any,
      nextStage,
      resetRun,
      router,
      pauseBgm: jest.fn(),
      resumeBgm: jest.fn(),
    });

    await actions.handleOk();

    expect(clearGame).toHaveBeenCalled();
    expect(resetRun).toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith('/');
  });
});
