import { applyDistanceFeedback, applyBumpFeedback } from '../feedback';
import * as Haptics from 'expo-haptics';

// react-native-reanimated を使う関数は簡易モックを当てる
jest.mock('react-native-reanimated', () => ({
  withTiming: (v: number) => v,
  withSequence: (...vals: number[]) => vals[vals.length - 1],
}));

describe('applyDistanceFeedback', () => {
  // タイマー関連を制御し副作用を確認する
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Haptics, 'impactAsync').mockResolvedValue();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('距離1では Heavy スタイルで400ms待機', () => {
    const intervalSpy = jest.spyOn(global, 'setInterval');
    const clearSpy = jest.spyOn(global, 'clearInterval');
    const fakeId = {} as NodeJS.Timeout;
    intervalSpy.mockReturnValue(fakeId);

    const result = applyDistanceFeedback(
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { showError: jest.fn() },
    );

    expect(result.wait).toBe(400);
    expect(result.id).toBe(fakeId);
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Heavy
    );
    expect(intervalSpy).toHaveBeenCalledWith(expect.any(Function), 50);

    jest.advanceTimersByTime(result.wait);
    expect(clearSpy).toHaveBeenCalledWith(fakeId);
  });

  test('maxDist を渡すと段階計算が変わる', () => {
    const intervalSpy = jest.spyOn(global, 'setInterval');
    const fakeId = {} as NodeJS.Timeout;
    intervalSpy.mockReturnValue(fakeId);

    // 距離8で maxDist も8 の場合は scaled が4になり Medium 振動
    const result = applyDistanceFeedback(
      { x: 0, y: 0 },
      { x: 0, y: 8 },
      { maxDist: 8, showError: jest.fn() }
    );

    expect(result.wait).toBe(100);
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Medium
    );
    expect(intervalSpy).toHaveBeenCalledWith(expect.any(Function), 50);
  });

  test('距離が maxDist を超えると Light 振動になる', () => {
    const intervalSpy = jest.spyOn(global, 'setInterval');
    const fakeId = {} as NodeJS.Timeout;
    intervalSpy.mockReturnValue(fakeId);

    // maxDist 8 に対し距離9なので Light 振動
    const result = applyDistanceFeedback(
      { x: 0, y: 0 },
      { x: 0, y: 9 },
      { maxDist: 8, showError: jest.fn() }
    );

    expect(result.wait).toBe(100);
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Light
    );
    expect(intervalSpy).toHaveBeenCalledWith(expect.any(Function), 50);
  });
});

describe('applyBumpFeedback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Haptics, 'impactAsync').mockResolvedValue();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('デフォルト設定で枠線を赤くして振動する', () => {
    const border = { value: 0 } as any;
    const setColor = jest.fn();
    const intervalSpy = jest.spyOn(global, 'setInterval');
    const clearSpy = jest.spyOn(global, 'clearInterval');
    const fakeId = {} as NodeJS.Timeout;
    intervalSpy.mockReturnValue(fakeId);

    const wait = applyBumpFeedback(border, setColor, { showError: jest.fn() });

    expect(wait).toBe(300);
    expect(setColor).toHaveBeenCalledWith('red');
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Heavy
    );
    expect(intervalSpy).toHaveBeenCalledWith(expect.any(Function), 50);

    jest.advanceTimersByTime(wait);
    expect(clearSpy).toHaveBeenCalledWith(fakeId);
  });
});
