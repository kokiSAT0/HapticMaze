import type { MazeData, Vec2 } from '@/src/types/maze';
import type { Enemy } from '@/src/types/enemy';
import { moveEnemyRandom, moveEnemySmart, moveEnemySight, moveEnemySense } from './utils';

/** 敵の行動種類を表す列挙型に近い文字列 */
export type EnemyBehavior = 'smart' | 'random' | 'sight' | 'sense';

/** 敵を1ターン移動させる関数の型 */
export type EnemyMover = (
  enemy: Enemy,
  maze: MazeData,
  visited: Set<string>,
  player: Vec2,
  rnd?: () => number,
) => Enemy;

/** 行動種類から実際の移動関数を取得する */
export function getEnemyMover(behavior: EnemyBehavior): EnemyMover {
  switch (behavior) {
    case 'smart':
      return moveEnemySmart;
    case 'sight':
      return moveEnemySight;
    case 'sense':
      return moveEnemySense;
    case 'random':
    default:
      // moveEnemyRandom は追跡しない単純な移動
      return (
        e: Enemy,
        maze: MazeData,
        _v: Set<string>,
        _p: Vec2,
        rnd: () => number = Math.random,
      ) => moveEnemyRandom(e, maze, _v, _p, rnd);
  }
}

/**
 * 迷路サイズと最終ステージかどうかから敵の行動を選ぶヘルパー。
 * 現在はサイズ5なら追跡しない、10なら追跡する。
 * 最終ステージはサイズに関わらず追跡する。
 */
export function selectEnemyBehavior(size: number, finalStage: boolean): EnemyBehavior {
  if (finalStage) return 'smart';
  return size === 5 ? 'random' : 'smart';
}

