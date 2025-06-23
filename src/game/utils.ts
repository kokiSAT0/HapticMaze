import * as Haptics from 'expo-haptics';
import {
  withTiming,
  withDelay,
  withSequence,
  SharedValue,
} from 'react-native-reanimated';
import type { MazeData, Dir } from '@/src/types/maze';

export interface Vec2 {
  x: number;
  y: number;
}

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
  /** 枠表示時間の範囲 [短いとき, 長いとき] */
  showRange?: [number, number];
}

/**
 * ゴールとの距離に応じて振動と枠アニメーションを発生させます。
 * borderW は Reanimated の SharedValue<number> です。
 */
export function applyDistanceFeedback(
  pos: Vec2,
  goal: Vec2,
  borderW: SharedValue<number>,
  opts: FeedbackOptions = {}
) {
  const {
    maxDist = Math.hypot(goal.x, goal.y),

    // ゴールから遠いとき 120ms, 近いとき 20ms 振動させます
    vibrateRange = [120, 20],
    borderRange = [2, 40],

    showRange = [200, 1000],
  } = opts;

  const dist = distance(pos, goal);
  const t = dist / maxDist; // 0〜1 の値
  const width = lerp(borderRange[0], borderRange[1], 1 - t);

  // ゴールに近いほど長く枠を表示する時間を計算
  // showRange[1] を 1000 とすると最大 1 秒表示される
  const showTime = lerp(showRange[0], showRange[1], 1 - t);

  // t の値に応じて Light → Medium → Heavy の順で振動を強くする
  const style =
    t > 2 / 3
      ? Haptics.ImpactFeedbackStyle.Light
      : t > 1 / 3
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Heavy;
  Haptics.impactAsync(style);
  // withSequence を使って 1 回の代入で連続アニメーションを実行
  borderW.value = withSequence(
    withTiming(width, { duration: 150 }),
    withDelay(showTime, withTiming(0, { duration: 150 }))
  );
}

/**
 * 壁に衝突したときのフィードバックを出します。
 * applyDistanceFeedback と同じ計算式で枠の太さと表示時間を決め、
 * 色は赤に変更します。
 * setColor には枠線の色を変更する関数を渡します。
 */
export function applyBumpFeedback(
  pos: Vec2,
  goal: Vec2,
  borderW: SharedValue<number>,
  setColor: (color: string) => void,
  opts: FeedbackOptions = {}
) {
  const {
    maxDist = Math.hypot(goal.x, goal.y),
    borderRange = [2, 40],
    showRange = [200, 1000],
  } = opts;

  const dist = distance(pos, goal);
  const t = dist / maxDist;
  const width = lerp(borderRange[0], borderRange[1], 1 - t);
  const showTime = lerp(showRange[0], showRange[1], 1 - t);

  // 枠線を赤く変更
  setColor('red');

  // 2 回ともやや長めに、強く振動させて衝突をわかりやすくする
  // Heavy は Light よりも大きい振動を表します
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  // 200 ミリ秒後に再度振動させることで "2 回" を体感できるようにする
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, 200);

  borderW.value = withSequence(
    withTiming(width, { duration: 150 }),
    withDelay(showTime, withTiming(0, { duration: 150 }))
  );

  // フィードバック終了後に色を元へ戻す
  setTimeout(() => setColor('white'), showTime + 300);
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
    case 'Right':
      return !h.has(`${x},${y}`) && x < last;
    case 'Left':
      return !h.has(`${x - 1},${y}`) && x > 0;
    case 'Down':
      return !v.has(`${x},${y}`) && y < last;
    case 'Up':
      return !v.has(`${x},${y - 1}`) && y > 0;
  }
}

/**
 * 衝突した壁の座標を取得します。
 * 壁が存在しない場合は null を返します。
 */
export function getHitWall(
  { x, y }: Vec2,
  dir: Dir,
  maze: MazeData
): { kind: 'v' | 'h'; key: string } | null {
  const h = maze.v_walls as unknown as Set<string>;
  const v = maze.h_walls as unknown as Set<string>;
  switch (dir) {
    case 'Right':
      if (h.has(`${x},${y}`)) return { kind: 'v', key: `${x},${y}` };
      break;
    case 'Left':
      if (h.has(`${x - 1},${y}`)) return { kind: 'v', key: `${x - 1},${y}` };
      break;
    case 'Down':
      if (v.has(`${x},${y}`)) return { kind: 'h', key: `${x},${y}` };
      break;
    case 'Up':
      if (v.has(`${x},${y - 1}`)) return { kind: 'h', key: `${x},${y - 1}` };
      break;
  }
  return null;
}
