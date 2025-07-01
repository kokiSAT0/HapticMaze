import { applyDistanceFeedback, applyBumpFeedback } from '../utils';
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

    const result = applyDistanceFeedback({ x: 0, y: 0 }, { x: 0, y: 1 });

    expect(result.wait).toBe(400);
    expect(result.id).toBe(fakeId);
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Heavy
    );
    expect(intervalSpy).toHaveBeenCalledWith(expect.any(Function), 50);

    jest.advanceTimersByTime(result.wait);
    expect(clearSpy).toHaveBeenCalledWith(fakeId);
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

    const wait = applyBumpFeedback(border, setColor);

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
