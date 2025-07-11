// 距離計算は math モジュールへ移動
import { distance } from "@/src/game/math";
import React from "react";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import Svg, { Circle, Rect } from "react-native-svg";

import type { Enemy } from "@/src/types/enemy";
import type { MazeData, Vec2 } from "@/src/types/maze";
import { renderWalls, renderHitWalls, renderAdjacentWalls } from "./mini-map/Walls";
import {
  renderPath,
  renderEnemyPaths,
  renderVisitedGoals,
} from "./mini-map/Paths";
import { renderEnemies } from "./mini-map/Enemies";
import { prepMaze, type MazeSets } from "@/src/game/state";

// AnimatedRect はコンポーネント外で一度だけ作成しておく
// これにより再レンダー時に新しい Animated コンポーネントが生成されるのを防ぐ
const AnimatedRect = Animated.createAnimatedComponent(Rect);


// MiniMapProps インターフェース
// ミニマップに必要な情報をまとめて渡す
export interface MiniMapProps {
  maze: MazeData; // 迷路の壁情報
  path: Vec2[]; // 通過したマスの履歴
  pos: Vec2; // 現在の位置
  enemies?: Enemy[]; // 敵の位置一覧
  enemyPaths?: Vec2[][]; // 敵の移動履歴
  flash?: number | import("react-native-reanimated").SharedValue<number>; // 外枠の太さ
  size?: number; // 表示サイズ (デフォルト80px)
  /**
   * デバッグ表示フラグ
   * true のとき壁とゴールを含む全情報を描画
   * 外枠の色もオレンジに変わる
   */
  showAll?: boolean;
  /** Result 画面かどうか。VisitedGoal 描画の判定に使用 */
  showResult?: boolean;
  /** 衝突した壁 (縦方向) */
  hitV?: Map<string, number>;
  /** 衝突した壁 (横方向) */
  hitH?: Map<string, number>;
  /** プレイヤー軌跡長 */
  playerPathLength?: number;
  /** 壁表示ターン数 */
  wallLifetime?: number;
  /**
   * これまでにゴールとして使われたマスの集合
   * "x,y" 形式の文字列で座標を保持する
   */
  visitedGoals?: Set<string>;
  /** プレイヤー周囲の壁を常に表示する */
  adjacentWalls?: boolean;
}

// MiniMap コンポーネント
// react-native-svg を使い迷路と軌跡を描画する
export function MiniMap({
  maze,
  path,
  pos,
  enemies = [],
  enemyPaths = [],
  flash = 2,
  size = 80,
  showAll = false,
  showResult = false,
  hitV,
  hitH,
  playerPathLength = Infinity,
  wallLifetime = Infinity,
  visitedGoals,
  adjacentWalls = false,
}: MiniMapProps) {
  const cell = size / maze.size; // 各マスの大きさ
  // MazeData から壁検索しやすい形へ変換
  const mazeSets = React.useMemo<MazeSets>(() => prepMaze(maze), [maze]);
  const style = useAnimatedStyle(() => ({
    borderWidth: typeof flash === "number" ? flash : flash.value,
  }));

  // ゴールまでのマンハッタン距離から外周線の色を算出する
  // useDerivedValue を使うことで常に最新の座標に応じた色を計算する
  const borderColor = useDerivedValue(() => {
    // 迷路サイズから取り得る最大距離を求める
    const maxDist = (maze.size - 1) * 2;
    // distance は 2 点間のマンハッタン距離を返す
    const d = distance(pos, { x: maze.goal[0], y: maze.goal[1] });
    const r = Math.min(d / maxDist, 1);
    const g = Math.round(255 * (1 - r));
    return `rgb(${g},${g},${g})`;
  }, [pos, maze.goal, maze.size]);

  const borderProps = useAnimatedProps(() => ({ stroke: borderColor.value }));


  return (
    // デバッグ表示の有無にかかわらず外枠は描画しない
    // borderColor を常に transparent にして非表示にする
    <Animated.View
      style={[{ width: size, height: size, borderColor: "transparent" }, style]}
    >
      <Svg width={size} height={size}>
        {/* マンハッタン距離に応じて濃さを変える外周線 */}
        <AnimatedRect
          animatedProps={borderProps}
          x={0}
          y={0}
          width={size}
          height={size}
          strokeWidth={10} // 外周の太さ
          fill="none"
        />
        {renderWalls({ maze, cell, size, showAll })}
        {renderHitWalls({ cell, hitV, hitH, wallLifetime })}
        {adjacentWalls && renderAdjacentWalls({ maze: mazeSets, pos, cell })}
        {renderPath({ path, cell, playerPathLength })}
        {renderEnemyPaths({ enemyPaths, enemies, cell, showAll })}
        {renderVisitedGoals({ visitedGoals, cell, showResult, showAll })}
        {showAll && (
          // ゴール位置は塗りつぶし四角で表示する
          <Rect
            x={(maze.goal[0] + 0.25) * cell}
            y={(maze.goal[1] + 0.25) * cell}
            width={cell * 0.5}
            height={cell * 0.5}
            fill="white" // 塗りつぶし
          />
        )}
        {/* 現在位置を円で表示 */}
        <Circle
          cx={(pos.x + 0.5) * cell}
          cy={(pos.y + 0.5) * cell}
          r={cell * 0.3}
          fill="white"
        />
        {renderEnemies({ enemies, cell, showAll, playerPos: pos, maze: mazeSets })}
      </Svg>
    </Animated.View>
  );
}
