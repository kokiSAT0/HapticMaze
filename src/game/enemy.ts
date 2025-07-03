import type { MazeData, Vec2 } from '@/src/types/maze';
import type { Enemy, EnemyBehavior } from '@/src/types/enemy';
import { moveEnemyBasic, moveEnemySight } from './enemyAI';

/** 敵を1ターン移動させる関数の型 */
export type EnemyMover = (
  enemy: Enemy,
  maze: MazeData,
  visited: Map<string, number>,
  player: Vec2,
  rnd?: () => number,
) => Enemy;

/** 行動種類から実際の移動関数を取得する */
export function getEnemyMover(behavior: EnemyBehavior): EnemyMover {
  switch (behavior) {
    case 'smart':
      // smart も視認追跡と同じ挙動とする
      return moveEnemySight;
    case 'sight':
      return moveEnemySight;
    case 'random':
    default:
      // moveEnemyBasic は未踏マスを優先する単純な移動
      return (
        e: Enemy,
        maze: MazeData,
        v: Map<string, number>,
        _p: Vec2,
        rnd: () => number = Math.random,
      ) => moveEnemyBasic(e, maze, v, rnd);
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

