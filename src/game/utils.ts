import * as Haptics from "expo-haptics";
import { Vibration } from "react-native";
import {
  withTiming,
  withDelay,
  withSequence,
  SharedValue,
} from "react-native-reanimated";
import type { MazeData, Vec2, Dir } from "@/src/types/maze";
import type { Enemy } from "@/src/types/enemy";

/**
 * 2点間の直線距離を求めます。
 * Math.hypot はピタゴラスの定理を使って距離を計算する関数です。
 */
export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * 値を線形補間します。t が 0 のとき start、1 のとき end を返します。
 * lerp は "linear interpolation" の略称です。
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export interface FeedbackOptions {
  /** 距離の最大値。デフォルトはゴール座標から計算した距離 */
  maxDist?: number;
  /** 枠太さの範囲 [細いとき, 太いとき] */
  borderRange?: [number, number];
}

/**
 * 値を一定範囲に収める簡単な clamp 関数。
 */
export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/**
 * ゴールとの距離に応じて枠アニメーションを表示し、
 * 同じ時間だけ impactAsync を繰り返して振動します。
 * borderW は Reanimated の SharedValue<number> です。
 */
/**
 * applyDistanceFeedback の戻り値型
 * wait: 次回呼び出しまでの待ち時間
 * id:   setInterval から得られるタイマー ID
 */
export interface DistanceFeedbackResult {
  wait: number;
  id: NodeJS.Timeout;
}

export function applyDistanceFeedback(
  pos: Vec2,
  goal: Vec2,
  borderW: SharedValue<number>,
  opts: FeedbackOptions = {}
): number {
  // borderRange のデフォルトは [2, 200]。
  // 移動時に表示する枠線の太さが 2px から 200px の範囲で変化します。
  const { maxDist = Math.hypot(goal.x, goal.y), borderRange = [2, 200] } = opts;

  const dist = distance(pos, goal);
  // r = 0 がゴール、1 が最遠の正規化値
  const r = clamp(dist / maxDist, 0, 1);
  const width = lerp(borderRange[0], borderRange[1], 1 - r);

  // 周期 800→200ms を距離に応じて線形補間
  const period = clamp(lerp(800, 200, 1 - r), 150, 1000);
  // デューティ比 0.25→0.75 で枠を表示する時間を決める
  const duty = lerp(0.25, 0.75, 1 - r);
  const showTime = Math.max(period * duty, 30);

  // r が遠いほど弱く、近いほど強く振動
  // 0.66 より遠い → Light
  // 0.33 より遠い → Medium
  // それ以外 → Heavy
  const style =
    r > 0.66
      ? Haptics.ImpactFeedbackStyle.Light
      : r > 0.33
      ? Haptics.ImpactFeedbackStyle.Medium
      : Haptics.ImpactFeedbackStyle.Heavy;

  Haptics.impactAsync(style);
  // 枠が表示されている間 (showTime + 300ms) は短い振動を繰り返す
  const id = setInterval(() => {
    Haptics.impactAsync(style);
  }, 150);
  setTimeout(() => clearInterval(id), showTime + 300);

  borderW.value = withSequence(
    withTiming(width, { duration: 150 }),
    withDelay(showTime, withTiming(0, { duration: 150 }))
  );

  // wait に待ち時間、id にタイマー ID をまとめて返す
  return { wait: period, id };
}

/**
 * 壁に衝突したときのフィードバックを出します。
 * 太さ 50px の赤枠を 300ms 表示し、
 * 400ms の長い振動を 1 回発生させます。
 * setColor には枠線の色を変更する関数を渡します。
 */
export function applyBumpFeedback(
  borderW: SharedValue<number>,
  setColor: (color: string) => void,
  opts: FeedbackOptions = {}
): number {
  // 暫定実装として太さ 50px、表示時間 300ms に固定
  const width = 50;
  const showTime = 300;

  // 枠線を赤く変更
  setColor("red");

  // Vibration.vibrate を用いて 400ms の長い振動を 1 回発生させる
  // iOS では duration を指定しても常に 400ms 固定
  Vibration.vibrate(400);

  borderW.value = withSequence(
    withTiming(width, { duration: 150 }),
    withDelay(showTime, withTiming(0, { duration: 150 }))
  );

  // フィードバック終了後に色を元へ戻す
  setTimeout(() => setColor("white"), showTime + 300);
  // 次回入力まで待つ時間を返す
  return showTime + 300;
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
export function canMove({ x, y }: Vec2, dir: Dir, maze: MazeData): boolean {
  const h = maze.v_walls as unknown as Set<string>;
  const v = maze.h_walls as unknown as Set<string>;
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
  maze: MazeData
): { kind: "v" | "h"; key: string } | null {
  const h = maze.v_walls as unknown as Set<string>;
  const v = maze.h_walls as unknown as Set<string>;
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
): Vec2[] {
  const enemies: Vec2[] = [];
  while (enemies.length < count) {
    const x = Math.floor(rnd() * maze.size);
    const y = Math.floor(rnd() * maze.size);
    const key = `${x},${y}`;
    const dup = exclude.has(key) || enemies.some((e) => e.x === x && e.y === y);
    if (dup) continue;
    if (x === maze.start[0] && y === maze.start[1]) continue;
    if (x === maze.goal[0] && y === maze.goal[1]) continue;
    enemies.push({ x, y });
    exclude.add(key);
  }
  return enemies;
}

/**
 * 敵をランダムに一マス移動させます。
 * rnd を渡すとテストで動きを固定できます。
 */
export function moveEnemyRandom(
  enemy: Enemy,
  maze: MazeData,
  _visited?: Set<string>,
  _player?: Vec2,
  rnd: () => number = Math.random,
): Enemy {
  const dirs: Dir[] = ['Up', 'Down', 'Left', 'Right'].filter((d) =>
    canMove(enemy.pos, d, maze),
  );
  if (dirs.length === 0) return enemy;
  const idx = Math.floor(rnd() * dirs.length);
  return { ...enemy, pos: nextPosition(enemy.pos, dirs[idx]) };
}

/**
 * BFS を用いて start から goal までの最短経路を探します。
 * 戻り値は最初の一歩の座標 next と、ゴールまでの距離 dist です。
 * 到達不能な場合は null を返します。
 */
export function shortestStep(
  start: Vec2,
  goal: Vec2,
  maze: MazeData,
): { next: Vec2; dist: number } | null {
  const visited = new Set<string>([`${start.x},${start.y}`]);
  type Node = { pos: Vec2; dist: number; first: Vec2 | null };
  const queue: Node[] = [{ pos: start, dist: 0, first: null }];

  while (queue.length > 0) {
    const { pos, dist, first } = queue.shift() as Node;
    if (pos.x === goal.x && pos.y === goal.y) {
      return { next: first ?? pos, dist };
    }

    for (const dir of ['Up', 'Down', 'Left', 'Right'] as const) {
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
 * それ以外では未踏マスを優先して移動します。
 * visited にはその敵がこれまでに踏んだマスの集合を渡します。
 */
export function moveEnemySmart(
  enemy: Enemy,
  maze: MazeData,
  visited: Set<string>,
  player: Vec2,
  rnd: () => number = Math.random,
): Enemy {
  const dirs: Dir[] = ['Up', 'Down', 'Left', 'Right'].filter((d) =>
    canMove(enemy.pos, d, maze),
  );
  if (dirs.length === 0) return enemy;

  const chase = shortestStep(enemy.pos, player, maze);
  if (chase && chase.dist <= 2) {
    return { ...enemy, pos: chase.next };
  }

  // 旧実装: マンハッタン距離だけで判断していた処理は削除

  const unvisited = dirs.filter((d) => {
    const next = nextPosition(enemy.pos, d);
    return !visited.has(`${next.x},${next.y}`);
  });

  const choices = unvisited.length > 0 ? unvisited : dirs;
  const idx = Math.floor(rnd() * choices.length);
  return { ...enemy, pos: nextPosition(enemy.pos, choices[idx]) };
}

/**
 * 敵からプレイヤーが直線上に見えるか判定します。
 * 上下左右3マス以内で壁がない場合に true を返します。
 */
function inSight(enemy: Vec2, player: Vec2, maze: MazeData): boolean {
  if (enemy.x === player.x) {
    const dy = player.y - enemy.y;
    const dir: Dir = dy > 0 ? 'Down' : 'Up';
    if (Math.abs(dy) > 3) return false;
    for (let i = 0; i < Math.abs(dy); i++) {
      const pos = { x: enemy.x, y: enemy.y + i * Math.sign(dy) };
      if (!canMove(pos, dir, maze)) return false;
    }
    return true;
  }
  if (enemy.y === player.y) {
    const dx = player.x - enemy.x;
    const dir: Dir = dx > 0 ? 'Right' : 'Left';
    if (Math.abs(dx) > 3) return false;
    for (let i = 0; i < Math.abs(dx); i++) {
      const pos = { x: enemy.x + i * Math.sign(dx), y: enemy.y };
      if (!canMove(pos, dir, maze)) return false;
    }
    return true;
  }
  return false;
}

/**
 * 直線視野でプレイヤーを追う敵 AI。
 * プレイヤーが視界にいない場合は moveEnemySmart と同じ動きをします。
 * 視界外になったときは最後に確認したマスへ向かいます。
 */
export function moveEnemySight(
  enemy: Enemy,
  maze: MazeData,
  visited: Set<string>,
  player: Vec2,
  rnd: () => number = Math.random,
): Enemy {
  let target = enemy.target ?? null;
  if (inSight(enemy.pos, player, maze)) {
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
  const moved = moveEnemySmart(enemy, maze, visited, player, rnd);
  return { ...moved, target };
}

/**
 * 敵の移動履歴を更新します。
 * paths には各敵のこれまでの座標配列を渡します。
 * enemies は移動後の座標配列です。
 * 4 点より多い場合は古い順に削除して常に最新 4 点を保ちます。
 */
export function updateEnemyPaths(paths: Vec2[][], enemies: Vec2[]): Vec2[][] {
  return enemies.map((e, i) => {
    const prev = paths[i] ?? [];
    const next = [...prev, e];
    if (next.length > 4) next.shift();
    return next;
  });
}

/**
 * 盤面サイズからランダムなマス座標を返す関数。
 * rnd を渡すと任意の乱数でテストしやすくなる。
 */
export function randomCell(
  size: number,
  rnd: () => number = Math.random,
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
  rnd: () => number = Math.random,
): Vec2 {
  const weights = cells.map(
    (c) => Math.abs(c.x - start.x) + Math.abs(c.y - start.y) + 1,
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
