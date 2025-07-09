import { tutorialEnemyCounts } from '../tutorial';

describe('tutorialEnemyCounts', () => {
  test('ステージ1は敵なし', () => {
    expect(tutorialEnemyCounts(1)).toEqual({ random: 0, slow: 0, sight: 0, fast: 0 });
  });

  test('ステージ4はランダム1体', () => {
    expect(tutorialEnemyCounts(4)).toEqual({ random: 1, slow: 0, sight: 0, fast: 0 });
  });

  test('ステージ9は鈍足視認1体', () => {
    expect(tutorialEnemyCounts(9)).toEqual({ random: 0, slow: 1, sight: 0, fast: 0 });
  });

  test('ステージ12はランダム1体', () => {
    expect(tutorialEnemyCounts(12)).toEqual({ random: 1, slow: 0, sight: 0, fast: 0 });
  });

  test('ステージ20以降は鈍足視認1体', () => {
    expect(tutorialEnemyCounts(20)).toEqual({ random: 0, slow: 1, sight: 0, fast: 0 });
  });
});
