import { normalWallLifetime, hardWallLifetime } from '../level1';

describe('normalWallLifetime', () => {
  test('51以下はInfinity', () => {
    expect(normalWallLifetime(51)).toBe(Infinity);
  });
  test('52以上は20', () => {
    expect(normalWallLifetime(52)).toBe(20);
  });
});

describe('hardWallLifetime', () => {
  test('ステージ10ではInfinity', () => {
    expect(hardWallLifetime(10)).toBe(Infinity);
  });
  test('ステージ30では20', () => {
    expect(hardWallLifetime(30)).toBe(20);
  });
  test('ステージ60では15', () => {
    expect(hardWallLifetime(60)).toBe(15);
  });
  test('ステージ80では10', () => {
    expect(hardWallLifetime(80)).toBe(10);
  });
  test('ステージ95では1', () => {
    expect(hardWallLifetime(95)).toBe(1);
  });
  test('101以上はInfinity', () => {
    expect(hardWallLifetime(101)).toBe(Infinity);
  });
});
