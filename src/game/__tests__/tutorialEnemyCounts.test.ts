import { tutorialEnemyCounts } from '../tutorial';

describe('tutorialEnemyCounts', () => {
  test('ステージ1は敵なし', () => {
    expect(tutorialEnemyCounts(1)).toEqual({ random: 0, slow: 0, sight: 0, fast: 0 });
  });

  test('ステージ16ではランダム1体', () => {
    expect(tutorialEnemyCounts(16)).toEqual({ random: 1, slow: 0, sight: 0, fast: 0 });
  });

  test('ステージ22では鈍足視認1体', () => {
    expect(tutorialEnemyCounts(22)).toEqual({ random: 0, slow: 1, sight: 0, fast: 0 });
  });

  test('ステージ25以降は鈍足視認1体', () => {
    expect(tutorialEnemyCounts(25)).toEqual({ random: 0, slow: 1, sight: 0, fast: 0 });
  });
});
