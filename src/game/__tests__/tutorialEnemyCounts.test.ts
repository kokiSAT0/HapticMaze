import { tutorialEnemyCounts } from '../tutorial';

describe('tutorialEnemyCounts', () => {
  test('ステージ1は敵なし', () => {
    expect(tutorialEnemyCounts(1)).toEqual({ random: 0, slow: 0, sight: 0, fast: 0 });
  });

  test('ステージ5では鈍足視認1体', () => {
    expect(tutorialEnemyCounts(5)).toEqual({ random: 0, slow: 1, sight: 0, fast: 0 });
  });

  test('ステージ10ではランダム1体', () => {
    expect(tutorialEnemyCounts(10)).toEqual({ random: 1, slow: 0, sight: 0, fast: 0 });
  });

  test('ステージ25でもランダム1体', () => {
    expect(tutorialEnemyCounts(25)).toEqual({ random: 1, slow: 0, sight: 0, fast: 0 });
  });
});
