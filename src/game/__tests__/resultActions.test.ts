/* eslint-disable import/first */

// React の機能は簡易モックで置き換え
jest.mock('react', () => ({
  useEffect: jest.fn(),
  useRef: (init: any) => ({ current: init }),
}));

// 状態管理フックをモック
let showResult = true;
let stageClear = true;
const setShowResult = jest.fn((v: boolean) => {
  showResult = v;
});
const setStageClear = jest.fn((v: boolean) => {
  stageClear = v;
});
const setGameOver = jest.fn();
const setGameClear = jest.fn();
const setDebugAll = jest.fn();
const setNewRecord = jest.fn();
const setOkLocked = jest.fn();
const setShowMenu = jest.fn();

jest.mock('@/src/hooks/useResultState', () => ({
  useResultState: () => ({
    showResult,
    setShowResult,
    gameOver: false,
    setGameOver,
    stageClear,
    setStageClear,
    gameClear: false,
    setGameClear,
    showMenu: false,
    setShowMenu,
    debugAll: false,
    setDebugAll,
    okLocked: false,
    setOkLocked,
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

const showAdIfNeeded = jest.fn(async () => {
  // 広告表示時点でリザルト関連フラグが全て false になっているか確認
  expect(showResult).toBe(false);
  expect(stageClear).toBe(false);
});

jest.mock('@/src/hooks/useStageEffects', () => ({
  useStageEffects: () => ({ showAdIfNeeded }),
}));

import { useResultActions } from '@/src/hooks/useResultActions';

describe('handleOk の広告表示後処理', () => {
  beforeEach(() => {
    showResult = true;
    stageClear = true;
    jest.clearAllMocks();
  });

  test('広告閉鎖後に次ステージでリザルトが自動表示されない', async () => {
    const nextStage = jest.fn();
    const resetRun = jest.fn();
    const router = { replace: jest.fn() };

    const actions = useResultActions({
      state: { stage: 2 } as any,
      maze: { size: 10 } as any,
      nextStage,
      resetRun,
      router,
      showSnackbar: jest.fn(),
      pauseBgm: jest.fn(),
      resumeBgm: jest.fn(),
    });

    await actions.handleOk();

    expect(showAdIfNeeded).toHaveBeenCalledWith(2);
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
      showSnackbar: jest.fn(),
      pauseBgm: jest.fn(),
      resumeBgm: jest.fn(),
    });

    await actions.handleOk();

    // 広告やステージ遷移は呼ばれない
    expect(showAdIfNeeded).not.toHaveBeenCalled();
    expect(nextStage).not.toHaveBeenCalled();

    // リザルト関連フラグは false のまま
    expect(showResult).toBe(false);
  });

  test('ステート更新が非同期でもフラグが正しくリセットされる', async () => {
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
      showSnackbar: jest.fn(),
      pauseBgm: jest.fn(),
      resumeBgm: jest.fn(),
    });

    await actions.handleOk();
    await Promise.resolve();

    expect(showAdIfNeeded).toHaveBeenCalledWith(2);
    expect(nextStage).toHaveBeenCalled();
    expect(showResult).toBe(false);
    expect(stageClear).toBe(false);
  });
});
