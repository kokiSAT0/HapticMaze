import { levelWallLifetime } from '../level1';

describe('levelWallLifetime', () => {
  test('90以下ではInfinityを返す', () => {
    expect(levelWallLifetime(90)).toBe(Infinity);
  });
  test('91では10を返す', () => {
    expect(levelWallLifetime(91)).toBe(10);
  });
  test('100では10を返す', () => {
    expect(levelWallLifetime(100)).toBe(10);
  });
  test('101以上ではInfinityを返す', () => {
    expect(levelWallLifetime(101)).toBe(Infinity);
  });
});
