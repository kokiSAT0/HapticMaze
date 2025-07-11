import { level1EnemyCounts } from '../level1';

/**
 * level1EnemyCounts の挙動確認テスト
 */
describe('level1EnemyCounts', () => {
  test('ステージ1ではランダム敵1体', () => {
    expect(level1EnemyCounts(1)).toEqual({ random: 1, slow: 0, sight: 0, fast: 0 });
  });

  test('ステージ3では鈍足視認1体', () => {
    expect(level1EnemyCounts(3)).toEqual({ random: 0, slow: 1, sight: 0, fast: 0 });
  });

  test('ステージ32ではランダム敵2体', () => {
    expect(level1EnemyCounts(32)).toEqual({ random: 2, slow: 0, sight: 0, fast: 0 });
  });

  test('ステージ63では鈍足視認2体とランダム1体', () => {
    expect(level1EnemyCounts(63)).toEqual({ random: 1, slow: 2, sight: 0, fast: 0 });
  });

  test('ステージ100では等速視認2体と鈍足視認2体', () => {
    expect(level1EnemyCounts(100)).toEqual({ random: 1, slow: 2, sight: 2, fast: 0 });
  });
});
