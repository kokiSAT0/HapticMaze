export interface Enemy {
  pos: import('./maze').Vec2;
  /** プレイヤーから見えるか */
  visible: boolean;
  /** 行動間隔。1なら毎ターン、2なら2ターンに1回 */
  interval: number;
  /** 1ターンに何回行動するか。倍速なら2 */
  repeat: number;
  /** 次に行動するまでの残りターン数 */
  cooldown: number;
  /** 直線視野で見失ったときに追う座標。未使用時は null */
  target?: import('./maze').Vec2 | null;
}

export interface EnemyCounts {
  /** 等速・視認なしの数 */
  invisible: number;
  /** 等速・視認ありの数 */
  visible: number;
  /** 鈍足・視認ありの数 */
  slow: number;
  /** 等速・直線視野の数 */
  sight: number;
  /** 倍速・視認ありの数 */
  fast: number;
  /** 感知型の数 */
  sense: number;
}
