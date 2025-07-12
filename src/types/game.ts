export interface NewGameOptions {
  /** 迷路サイズ。未指定なら10 */
  size?: number;
  /** 敵の出現数 */
  counts?: import('./enemy').EnemyCounts;
  /** 敵の軌跡を何マス残すか */
  enemyPathLength?: number;
  /** プレイヤーの軌跡長 */
  playerPathLength?: number;
  /** 壁表示を維持するターン数 */
  wallLifetime?: number;
  /** ステージ番号から敵数を計算する関数 */
  enemyCountsFn?: (stage: number) => import('./enemy').EnemyCounts;
  /** ステージ番号から壁寿命を計算する関数 */
  wallLifetimeFn?: (stage: number) => number;
  /** 周囲の壁を常に表示するか */
  showAdjacentWalls?: boolean;
  /** ステージ番号から周囲表示の有無を決める関数 */
  showAdjacentWallsFn?: (stage: number) => boolean;
  /** 敵のスポーン位置をスタートから遠くするか */
  biasedSpawn?: boolean;
  /** ゴールをスタートから遠ざけるかどうか */
  biasedGoal?: boolean;
  /** レベル識別子。練習モードでは undefined */
  levelId?: string;
  /** 何ステージごとに新しい迷路へ切り替えるか */
  stagePerMap?: number;
  /** 敵をリスポーンできる最大回数 */
  respawnMax?: number;
}
