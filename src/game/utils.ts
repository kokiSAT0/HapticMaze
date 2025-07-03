import * as Haptics from "expo-haptics";
import { withTiming, withSequence, SharedValue } from "react-native-reanimated";
import type { MazeData, Vec2, Dir } from "@/src/types/maze";
import type { Enemy } from "@/src/types/enemy";
// MazeSets 型を使用するため state から読み込む
import type { MazeSets } from "./state";

/**
 * 2点間のマンハッタン距離を求めます。
 * マンハッタン距離とは |x1 - x2| + |y1 - y2| のように
 * 各軸の差を足し合わせる単純な計算方法です。
 * Math.abs は絶対値を求める関数を意味します。
 */
export function distance(a: Vec2, b: Vec2): number {
  "worklet";
  return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
}

/**
 * 値を線形補間します。t が 0 のとき start、1 のとき end を返します。
 * lerp は "linear interpolation" の略称です。
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export interface FeedbackOptions {
  /**
   * 距離の最大値。
   * デフォルトは `goal.x + goal.y` ですが、
   * 呼び出し側で盤面サイズから計算した値を渡すのが推奨です。
   */
  maxDist?: number;
}

/**
 * 値を一定範囲に収める簡単な clamp 関数。
 */
export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/**
 * ゴールまでのマンハッタン距離に応じて
 * 3 段階の振動を発生させます。
 * borderW は Reanimated の SharedValue<number> です。
 */
/**
 * applyDistanceFeedback の戻り値型です。
 * wait は次回呼び出しまでの待ち時間、
 * id は setInterval から返るタイマー ID を表します。
 * 戻り値をまとめたオブジェクトとして返すことで、
 * 呼び出し側で扱いやすくしています。
 */
export interface DistanceFeedbackResult {
  wait: number;
  id: NodeJS.Timeout;
}

export function applyDistanceFeedback(
  pos: Vec2,
  goal: Vec2,
  opts: FeedbackOptions = {}
): DistanceFeedbackResult {
  // 追加: 迷路の大きさに応じた最大距離を指定できるようにする
  const maxDist = opts.maxDist ?? 4;
  // ゴールまでのマンハッタン距離を計算
  const dist = distance(pos, goal);
  // 距離を 4 段階に正規化する。
  // maxDist と同じ距離で 4、0 に近いほど 1 に近づくイメージ
  const scaled = Math.max(1, Math.ceil((dist / maxDist) * 4));

  // 距離段階に応じて振動スタイルと継続時間を決定
  let style: Haptics.ImpactFeedbackStyle;
  let duration: number;
  if (scaled === 1) {
    style = Haptics.ImpactFeedbackStyle.Heavy;
    duration = 400;
  } else if (scaled === 2) {
    style = Haptics.ImpactFeedbackStyle.Heavy;
    duration = 200;
  } else if (scaled === 3) {
    style = Haptics.ImpactFeedbackStyle.Medium;
    duration = 100;
  } else if (scaled === 4) {
    style = Haptics.ImpactFeedbackStyle.Medium;
    duration = 100;
  } else {
    // scaled が 5 以上の場合はかなり遠いとみなし最弱振動
    style = Haptics.ImpactFeedbackStyle.Light;
    duration = 100;
  }

  // まず 1 回振動させ、50ms 間隔で duration いっぱいまで繰り返す
  Haptics.impactAsync(style);
  const id = setInterval(() => {
    Haptics.impactAsync(style);
  }, 50);
  setTimeout(() => clearInterval(id), duration);

  // 待ち時間として振動継続時間を返す
  return { wait: duration, id };
}

/**
 * 壁に衝突したときのフィードバックを出します。
 * 太さ 50px の赤枠を 300ms 表示し、
 * Haptics.ImpactFeedbackStyle.Heavy を
 * 同じく 300ms 繰り返して振動させます。
 * setColor には枠線の色を変更する関数を渡します。
 */
export interface BumpFeedbackOptions extends FeedbackOptions {
  /** 枠線の太さ (px)。未指定なら 50 */
  width?: number;
  /** 表示時間 (ms)。未指定なら 300 */
  showTime?: number;
}

export function applyBumpFeedback(
  borderW: SharedValue<number>,
  setColor: (color: string) => void,
  opts: BumpFeedbackOptions = {}
): number {
  // 枠線の太さと表示時間。デフォルト値を用意して分かりやすくする
  const width = opts.width ?? 50;
  const showTime = opts.showTime ?? 300;

  // 枠線を赤く変更する
  setColor("red");

  // 指定時間だけ Heavy スタイルで振動させる
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  const id = setInterval(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, 50);
  setTimeout(() => clearInterval(id), showTime);

  // 枠線を表示 → すぐ非表示とするため 50ms ずつアニメーション
  borderW.value = withSequence(
    withTiming(width, { duration: showTime / 2 }),
    withTiming(0, { duration: showTime / 2 })
  );

  // 色のリセットは呼び出し側で行う
  // 呼び出し元へ待ち時間を返す
  return showTime;
}

/**
 * 壁配列から O(1) 検索用の Set を生成します。
 */
export function wallSet(walls: [number, number][]): Set<string> {
  return new Set(walls.map(([x, y]) => `${x},${y}`));
}

/**
 * 現在位置と進行方向から移動可能か判定します。
 * MazeData の v_walls / h_walls は Set である前提です。
 */
export function canMove({ x, y }: Vec2, dir: Dir, maze: MazeSets): boolean {
  // maze.v_walls / maze.h_walls は Set 型として扱える
  const h = maze.v_walls;
  const v = maze.h_walls;
  const last = maze.size - 1;
  switch (dir) {
    case "Right":
      return !h.has(`${x},${y}`) && x < last;
    case "Left":
      return !h.has(`${x - 1},${y}`) && x > 0;
    case "Down":
      return !v.has(`${x},${y}`) && y < last;
    case "Up":
      return !v.has(`${x},${y - 1}`) && y > 0;
  }
}

/**
 * 現在位置 pos と方向 dir から次の座標を計算します。
 * 単純に座標を±1 するだけの処理です。
 */
export function nextPosition(pos: Vec2, dir: Dir): Vec2 {
  const next = { ...pos };
  switch (dir) {
    case "Up":
      next.y -= 1;
      break;
    case "Down":
      next.y += 1;
      break;
    case "Left":
      next.x -= 1;
      break;
    case "Right":
      next.x += 1;
      break;
  }
  return next;
}

/**
 * 衝突した壁の座標を取得します。
 * 壁が存在しない場合は null を返します。
 */
export function getHitWall(
  { x, y }: Vec2,
  dir: Dir,
  maze: MazeSets
): { kind: "v" | "h"; key: string } | null {
  // MazeSets なら直接 Set 操作が可能
  const h = maze.v_walls;
  const v = maze.h_walls;
  // 迷路の端は last 番のマスの外側にあると考える
  const last = maze.size - 1;
  switch (dir) {
    case "Right":
      if (h.has(`${x},${y}`)) return { kind: "v", key: `${x},${y}` };
      // 右端にぶつかった場合
      if (x >= last) return { kind: "v", key: `${last},${y}` };
      break;
    case "Left":
      if (h.has(`${x - 1},${y}`)) return { kind: "v", key: `${x - 1},${y}` };
      // 左端にぶつかった場合
      if (x <= 0) return { kind: "v", key: `-1,${y}` };
      break;
    case "Down":
      if (v.has(`${x},${y}`)) return { kind: "h", key: `${x},${y}` };
      // 下端にぶつかった場合
      if (y >= last) return { kind: "h", key: `${x},${last}` };
      break;
    case "Up":
      if (v.has(`${x},${y - 1}`)) return { kind: "h", key: `${x},${y - 1}` };
      // 上端にぶつかった場合
      if (y <= 0) return { kind: "h", key: `${x},-1` };
      break;
  }
  return null;
}

/**
 * 敵をランダムな位置に生成します。
 * count には生成したい数、rnd は乱数関数を指定します。
 * 同じマスを避け、スタート地点とゴール地点も除外します。
 */
export function spawnEnemies(
  count: number,
  maze: MazeData,
  rnd: () => number = Math.random,
  exclude: Set<string> = new Set(),
  biased: boolean = true
): Vec2[] {
  const enemies: Vec2[] = [];
  const start = { x: maze.start[0], y: maze.start[1] };
  const goal = { x: maze.goal[0], y: maze.goal[1] };
  const candidates = allCells(maze.size).filter((c) => {
    const key = `${c.x},${c.y}`;
    if (exclude.has(key)) return false;
    if (c.x === start.x && c.y === start.y) return false;
    if (c.x === goal.x && c.y === goal.y) return false;
    return true;
  });

  // 候補マスから一つずつ選ぶ。biased が true の場合はスタートから遠いほど
  // 選ばれやすくする
  while (enemies.length < count && candidates.length > 0) {
    const cell = biased
      ? biasedPickGoal(start, candidates, rnd)
      : candidates[Math.floor(rnd() * candidates.length)];
    const key = `${cell.x},${cell.y}`;
    enemies.push(cell);
    exclude.add(key);
    const idx = candidates.findIndex((c) => c.x === cell.x && c.y === cell.y);
    if (idx !== -1) candidates.splice(idx, 1);
  }

  return enemies;
}

/**
 * 敵をランダムに一マス移動させます。
 * rnd を渡すとテストで動きを固定できます。
 */
export function moveEnemyRandom(
  enemy: Enemy,
  maze: MazeSets,
  _visited?: Map<string, number>,
  _player?: Vec2,
  rnd: () => number = Math.random
): Enemy {
  const dirs: Dir[] = ["Up", "Down", "Left", "Right"].filter((d) =>
    canMove(enemy.pos, d, maze)
  );
  if (dirs.length === 0) return enemy;
  const idx = Math.floor(rnd() * dirs.length);
  return { ...enemy, pos: nextPosition(enemy.pos, dirs[idx]) };
}

/**
 * 未踏マスを優先して移動する基本行動。
 * 全方向踏破済みならランダムに進みます。
 */
export function moveEnemyBasic(
  enemy: Enemy,
  maze: MazeSets,
  visited: Map<string, number>,
  rnd: () => number = Math.random
): Enemy {
  const dirs: Dir[] = ["Up", "Down", "Left", "Right"].filter((d) =>
    canMove(enemy.pos, d, maze)
  );
  if (dirs.length === 0) return enemy;

  // 各方向の到達回数を調べ、最も少ないものを選ぶ
  let bestDirs: Dir[] = [];
  let bestCount = Infinity;
  for (const d of dirs) {
    const next = nextPosition(enemy.pos, d);
    const key = `${next.x},${next.y}`;
    const count = visited.get(key) ?? 0;
    if (count < bestCount) {
      bestCount = count;
      bestDirs = [d];
    } else if (count === bestCount) {
      bestDirs.push(d);
    }
  }

  const idx = Math.floor(rnd() * bestDirs.length);
  return { ...enemy, pos: nextPosition(enemy.pos, bestDirs[idx]) };
}

/**
 * BFS を用いて start から goal までの最短経路を探します。
 * 戻り値は最初の一歩の座標 next と、ゴールまでの距離 dist です。
 * 到達不能な場合は null を返します。
 */
export function shortestStep(
  start: Vec2,
  goal: Vec2,
  maze: MazeSets
): { next: Vec2; dist: number } | null {
  const visited = new Set<string>([`${start.x},${start.y}`]);
  type Node = { pos: Vec2; dist: number; first: Vec2 | null };
  const queue: Node[] = [{ pos: start, dist: 0, first: null }];

  while (queue.length > 0) {
    const { pos, dist, first } = queue.shift() as Node;
    if (pos.x === goal.x && pos.y === goal.y) {
      return { next: first ?? pos, dist };
    }

    for (const dir of ["Up", "Down", "Left", "Right"] as const) {
      if (!canMove(pos, dir, maze)) continue;
      const nxt = nextPosition(pos, dir);
      const key = `${nxt.x},${nxt.y}`;
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push({ pos: nxt, dist: dist + 1, first: first ?? nxt });
    }
  }
  return null;
}

/**
 * 壁を考慮した最短経路で距離を測り、
 * 2 マス以内ならプレイヤーへ向かう敵 AI。
 * それ以外では未踏回数が少ない方向へ進みます。
 * visited にはその敵がこれまでに踏んだマスの回数表を渡します。
 */
export function moveEnemySmart(
  enemy: Enemy,
  maze: MazeSets,
  visited: Map<string, number>,
  player: Vec2,
  rnd: () => number = Math.random
): Enemy {
  const dirs: Dir[] = ["Up", "Down", "Left", "Right"].filter((d) =>
    canMove(enemy.pos, d, maze)
  );
  if (dirs.length === 0) return enemy;

  const chase = shortestStep(enemy.pos, player, maze);
  if (chase && chase.dist <= 2) {
    return { ...enemy, pos: chase.next };
  }

  return moveEnemyBasic(enemy, maze, visited, rnd);
}

/**
 * 敵からプレイヤーが直線上に見えるかを判定する。
 * range を指定しない場合は無制限で、壁を挟むと視認できない。
 */
export function inSight(
  enemy: Vec2,
  player: Vec2,
  maze: MazeSets,
  range: number = Infinity
): boolean {
  if (enemy.x === player.x) {
    const dy = player.y - enemy.y;
    const dir: Dir = dy > 0 ? "Down" : "Up";
    if (Math.abs(dy) > range) return false;
    for (let i = 0; i < Math.abs(dy); i++) {
      const pos = { x: enemy.x, y: enemy.y + i * Math.sign(dy) };
      if (!canMove(pos, dir, maze)) return false;
    }
    return true;
  }
  if (enemy.y === player.y) {
    const dx = player.x - enemy.x;
    const dir: Dir = dx > 0 ? "Right" : "Left";
    if (Math.abs(dx) > range) return false;
    for (let i = 0; i < Math.abs(dx); i++) {
      const pos = { x: enemy.x + i * Math.sign(dx), y: enemy.y };
      if (!canMove(pos, dir, maze)) return false;
    }
    return true;
  }
  return false;
}

/**
 * 直線上にプレイヤーが見える場合のみ追跡する敵 AI。
 * range は視認距離を表し、省略時は無制限です。
 * 視認できなくなったら最後に見たマスまで移動し、
 * それ以外では未踏マス優先の移動を行います。
 */
export function moveEnemySight(
  enemy: Enemy,
  maze: MazeSets,
  visited: Map<string, number>,
  player: Vec2,
  rnd: () => number = Math.random,
  range: number = Infinity
): Enemy {
  let target = enemy.target ?? null;
  if (inSight(enemy.pos, player, maze, range)) {
    target = { ...player };
  }
  if (target) {
    const chase = shortestStep(enemy.pos, target, maze);
    if (chase) {
      const next = chase.next;
      const reached = next.x === target.x && next.y === target.y;
      return { ...enemy, pos: next, target: reached ? null : target };
    }
    target = null;
  }
  const moved = moveEnemyBasic(enemy, maze, visited, rnd);
  return { ...moved, target };
}

/**
 * 感知距離内ならプレイヤーへ近づく敵 AI。
 * range 以内にプレイヤーがいなければ moveEnemyBasic を行う。
 */
export function moveEnemySense(
  enemy: Enemy,
  maze: MazeSets,
  visited: Map<string, number>,
  player: Vec2,
  rnd: () => number = Math.random,
  range: number = 3
): Enemy {
  const manhattan =
    Math.abs(enemy.pos.x - player.x) + Math.abs(enemy.pos.y - player.y);
  if (manhattan <= range) {
    const dirs: Dir[] = ["Up", "Down", "Left", "Right"].filter((d) =>
      canMove(enemy.pos, d, maze)
    );
    if (dirs.length === 0) return enemy;
    let best: Dir[] = [];
    let bestDist = Infinity;
    for (const d of dirs) {
      const next = nextPosition(enemy.pos, d);
      const dist = Math.abs(next.x - player.x) + Math.abs(next.y - player.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = [d];
      } else if (dist === bestDist) {
        best.push(d);
      }
    }
    const idx = Math.floor(rnd() * best.length);
    return { ...enemy, pos: nextPosition(enemy.pos, best[idx]) };
  }
  return moveEnemyBasic(enemy, maze, visited, rnd);
}

/**
 * 敵の移動履歴を更新します。
 * paths には各敵のこれまでの座標配列を渡します。
 * enemies は移動後の座標配列です。
 * 4 点より多い場合は古い順に削除して常に最新 4 点を保ちます。
 */
export function updateEnemyPaths(
  paths: Vec2[][],
  enemies: Vec2[],
  maxLen: number
): Vec2[][] {
  return enemies.map((e, i) => {
    const prev = paths[i] ?? [];
    const next = [...prev, e];
    // 配列が指定長より長くなったら先頭を捨てる
    while (next.length > maxLen) next.shift();
    return next;
  });
}

/**
 * プレイヤーの移動履歴を更新するヘルパー。
 * maxLen が無限大 (Infinity) の場合は全て残す。
 */
export function updatePlayerPath(
  path: Vec2[],
  pos: Vec2,
  maxLen: number
): Vec2[] {
  const next = [...path, pos];
  // 指定長より長くなったら古いものから削除
  while (maxLen !== Infinity && next.length > maxLen) next.shift();
  return next;
}

/**
 * 衝突壁マップの寿命を 1 減らす。
 * 0 以下になった要素は取り除く。
 */
export function decayHitMap(map: Map<string, number>): Map<string, number> {
  const next = new Map<string, number>();
  map.forEach((v, k) => {
    const nv = v === Infinity ? Infinity : v - 1;
    if (nv > 0 || nv === Infinity) next.set(k, nv);
  });
  return next;
}

/**
 * 盤面サイズからランダムなマス座標を返す関数。
 * rnd を渡すと任意の乱数でテストしやすくなる。
 */
export function randomCell(
  size: number,
  rnd: () => number = Math.random
): Vec2 {
  return {
    x: Math.floor(rnd() * size),
    y: Math.floor(rnd() * size),
  };
}

/**
 * スタート位置と候補マス配列から、距離が遠いほど選ばれやすい形で1マス選ぶ。
 * 重み付けにはマンハッタン距離を利用する。
 */
export function biasedPickGoal(
  start: Vec2,
  cells: Vec2[],
  rnd: () => number = Math.random
): Vec2 {
  const weights = cells.map(
    (c) => Math.abs(c.x - start.x) + Math.abs(c.y - start.y) + 1
  );
  const sum = weights.reduce((a, b) => a + b, 0);
  let r = rnd() * sum;
  for (let i = 0; i < cells.length; i++) {
    r -= weights[i];
    if (r <= 0) return cells[i];
  }
  return cells[cells.length - 1];
}

/**
 * 盤面サイズから全てのマス座標を列挙する簡易ヘルパー。
 */
export function allCells(size: number): Vec2[] {
  const cells: Vec2[] = [];
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      cells.push({ x, y });
    }
  }
  return cells;
}

/**
 * 何ステージごとに新しい迷路を読み込むかを示す定数。
 * 現在は 3 ステージごとにリセットする仕様です。
 */
export const STAGE_PER_MAP = 3;

/**
 * 現在のステージ番号から迷路を変更すべきか判定します。
 * stage が STAGE_PER_MAP の倍数なら true を返します。
 */
export function shouldChangeMap(stage: number): boolean {
  return stage % STAGE_PER_MAP === 0;
}
