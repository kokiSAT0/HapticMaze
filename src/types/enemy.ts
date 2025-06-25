export interface Enemy {
  pos: import('./maze').Vec2;
  /** プレイヤーから見えるか */
  visible: boolean;
  /** 行動間隔。1なら毎ターン、2なら2ターンに1回 */
  interval: number;
  /** 次に行動するまでの残りターン数 */
  cooldown: number;
}

export interface EnemyCounts {
  /** 等速・視認なしの数 */
  invisible: number;
  /** 等速・視認ありの数 */
  visible: number;
  /** 鈍足・視認ありの数 */
  slow: number;
}
