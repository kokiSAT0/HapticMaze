// utils.ts の nextPosition をテスト
// 初心者向けにコメントを付けています

import { nextPosition } from '../utils';
import type { Vec2 } from '@/src/types/maze';

const pos = (x: number, y: number): Vec2 => ({ x, y });

describe('nextPosition', () => {
  test('上へ移動すると y が 1 減る', () => {
    expect(nextPosition(pos(1, 1), 'Up')).toEqual(pos(1, 0));
  });

  test('下へ移動すると y が 1 増える', () => {
    expect(nextPosition(pos(1, 1), 'Down')).toEqual(pos(1, 2));
  });

  test('左へ移動すると x が 1 減る', () => {
    expect(nextPosition(pos(1, 1), 'Left')).toEqual(pos(0, 1));
  });

  test('右へ移動すると x が 1 増える', () => {
    expect(nextPosition(pos(1, 1), 'Right')).toEqual(pos(2, 1));
  });
});
