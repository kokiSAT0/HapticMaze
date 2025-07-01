// highScore.ts の各関数をテストする
// AsyncStorage を使うため専用のモックを利用します

import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadHighScore, saveHighScore, isBetterScore, type HighScore } from '../highScore';

// ライブラリが用意しているモックを適用
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// 簡単なスコア作成ヘルパー
const score = (stage: number, steps: number, bumps: number): HighScore => ({
  stage,
  steps,
  bumps,
});

describe('loadHighScore', () => {
  test('保存済みデータを正しく読み込む', async () => {
    const data = score(2, 10, 1);
    await AsyncStorage.setItem('highscore:level1', JSON.stringify(data));

    const result = await loadHighScore('level1');
    expect(result).toEqual(data);
  });
});

describe('saveHighScore', () => {
  test('AsyncStorage に値を書き込む', async () => {
    const data = score(1, 5, 0);
    const spy = jest.spyOn(AsyncStorage, 'setItem');

    await saveHighScore('level2', data);
    expect(spy).toHaveBeenCalledWith('highscore:level2', JSON.stringify(data));
  });
});

describe('isBetterScore', () => {
  test('ステージが高ければ常に良いと判定', () => {
    expect(
      isBetterScore(score(1, 20, 3), score(2, 50, 5))
    ).toBe(true);
  });

  test('同じステージなら手数を比較', () => {
    expect(
      isBetterScore(score(1, 10, 2), score(1, 8, 5))
    ).toBe(true);
  });

  test('手数が同じなら壁衝突数を比較', () => {
    expect(
      isBetterScore(score(1, 8, 5), score(1, 8, 4))
    ).toBe(true);
  });

  test('全て同じか劣る場合は false', () => {
    expect(
      isBetterScore(score(2, 5, 0), score(1, 10, 1))
    ).toBe(false);
  });
});
