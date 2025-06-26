/** 敵の行動パターンを表す文字列型 */
export type EnemyBehavior = 'smart' | 'random' | 'sight' | 'sense';

/** 敵の種類を表す文字列型 */
export type EnemyKind = 'random' | 'sense' | 'slow' | 'sight' | 'fast';

export interface Enemy {
  pos: import('./maze').Vec2;
  /** プレイヤーから見えるかどうか */
  visible: boolean;
  /** 行動間隔。1なら毎ターン、2なら2ターンに1回 */
  interval: number;
  /** 1ターンに何回行動するか。倍速なら2 */
  repeat: number;
  /** 次に行動するまでの残りターン数 */
  cooldown: number;
  /** 直線視野で見失ったときに追う座標。未使用時は null */
  target?: import('./maze').Vec2 | null;
  /** 敵固有の行動パターン */
  behavior: EnemyBehavior;
  /** スポーン時の種別。描画色の判定に利用する */
  kind?: EnemyKind;
}

export interface EnemyCounts {
  /** 等速・ランダムの数 */
  random: number;
  /** 等速・感知の数 */
  sense: number;
  /** 鈍足・視認の数 */
  slow: number;
  /** 等速・視認の数 */
  sight: number;
  /** 倍速・視認ありの数 (未使用) */
  fast: number;
}
