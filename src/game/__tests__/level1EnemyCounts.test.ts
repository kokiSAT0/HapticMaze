import { level1EnemyCounts } from '../level1';

/**
 * level1EnemyCounts の挙動確認テスト
 */
describe('level1EnemyCounts', () => {
  test('ステージ1ではランダム敵1体', () => {
    expect(level1EnemyCounts(1)).toEqual({ random: 1, slow: 0, sight: 0, fast: 0 });
  });

  test('ステージ2でもランダム敵1体', () => {
    expect(level1EnemyCounts(2)).toEqual({ random: 1, slow: 0, sight: 0, fast: 0 });
  });

  test('ステージ3では鈍足敵1体', () => {
    expect(level1EnemyCounts(3)).toEqual({ random: 0, slow: 1, sight: 0, fast: 0 });
  });
});
