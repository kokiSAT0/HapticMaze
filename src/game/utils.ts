import * as Haptics from "expo-haptics";
import { Vibration } from "react-native";
import {
  withTiming,
  withDelay,
  withSequence,
  SharedValue,
} from "react-native-reanimated";
import type { MazeData, Vec2, Dir } from "@/src/types/maze";

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
export function applyDistanceFeedback(
  pos: Vec2,
  goal: Vec2,
  borderW: SharedValue<number>,
  opts: FeedbackOptions = {}
): number {
  // borderRange のデフォルトは [2, 80]。
  // 移動時に表示する枠線の太さが 2px から 80px の範囲で変化します。
  const { maxDist = Math.hypot(goal.x, goal.y), borderRange = [2, 80] } = opts;

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

  // 次回呼び出しまでの待ち時間を返す
  return period;
}

/**
 * 壁に衝突したときのフィードバックを出します。
 * 太さ 30px の赤枠を 600ms 表示し、
 * 400ms の長い振動を 1 回発生させます。
 * setColor には枠線の色を変更する関数を渡します。
 */
export function applyBumpFeedback(
  pos: Vec2,
  goal: Vec2,
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
