import { level1EnemyCounts } from '../level1';

/**
 * level1EnemyCounts の挙動確認テスト
 */
describe('level1EnemyCounts', () => {
  test('ステージ1ではランダム敵1体', () => {
    expect(level1EnemyCounts(1)).toEqual({ random: 1, slow: 0, sight: 0, fast: 0 });
  });

  test('ステージ30までは3の倍数で鈍足視認1体', () => {
    expect(level1EnemyCounts(3)).toEqual({ random: 0, slow: 1, sight: 0, fast: 0 });
  });

  test('ステージ32ではランダム敵2体', () => {
    expect(level1EnemyCounts(32)).toEqual({ random: 2, slow: 0, sight: 0, fast: 0 });
  });

  test('ステージ63では鈍足視認1体とランダム1体', () => {
    expect(level1EnemyCounts(63)).toEqual({ random: 1, slow: 1, sight: 0, fast: 0 });
  });

  test('ステージ100でも鈍足視認1体とランダム1体', () => {
    expect(level1EnemyCounts(100)).toEqual({ random: 1, slow: 1, sight: 0, fast: 0 });
  });
});
