// distance 関数のテスト
// マンハッタン距離へ変更したため、その挙動を確認します

import { distance } from '../math';
import type { Vec2 } from '@/src/types/maze';

const pos = (x: number, y: number): Vec2 => ({ x, y });

describe('distance', () => {
  test('同じ座標なら距離は0になる', () => {
    expect(distance(pos(0, 0), pos(0, 0))).toBe(0);
  });

  test('異なる座標ではマンハッタン距離を返す', () => {
    // 0,0 と 3,4 の距離は |3-0| + |4-0| = 7
    expect(distance(pos(0, 0), pos(3, 4))).toBe(7);
  });
});
