import { normalWallLifetime, hardWallLifetime } from '../level1';

describe('normalWallLifetime', () => {
  test('51以下はInfinity', () => {
    expect(normalWallLifetime(51)).toBe(Infinity);
  });
  test('52以上は50', () => {
    expect(normalWallLifetime(52)).toBe(50);
  });
});

describe('hardWallLifetime', () => {
  test('ステージ10ではInfinity', () => {
    expect(hardWallLifetime(10)).toBe(Infinity);
  });
  test('ステージ30では40', () => {
    expect(hardWallLifetime(30)).toBe(40);
  });
  test('ステージ60では30', () => {
    expect(hardWallLifetime(60)).toBe(30);
  });
  test('ステージ80では20', () => {
    expect(hardWallLifetime(80)).toBe(20);
  });
  test('ステージ95では10', () => {
    expect(hardWallLifetime(95)).toBe(10);
  });
  test('101以上はInfinity', () => {
    expect(hardWallLifetime(101)).toBe(Infinity);
  });
});
