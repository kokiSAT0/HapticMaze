// 距離計算は math モジュールへ移動
// 距離計算や補間用ユーティリティ
import { clamp, distance, lerp } from "@/src/game/math";
import React from "react";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import Svg, { Circle, Rect } from "react-native-svg";

import { prepMaze, type MazeSets } from "@/src/game/state";
import type { Enemy } from "@/src/types/enemy";
import type { MazeData, Vec2 } from "@/src/types/maze";
import { renderEnemies } from "./mini-map/Enemies";
import {
  renderEnemyPaths,
  renderPath,
  renderVisitedGoals,
} from "./mini-map/Paths";
import {
  renderAdjacentWalls,
  renderHitWalls,
  renderWalls,
} from "./mini-map/Walls";

// プレイヤー用の円もアニメーションさせるためコンポーネント化
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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

  // プレイヤーの外周半径。描画時は一定値とする
  const radius = cell * 0.3;

  // プレイヤーの外周色
  // 仕様変更により常に薄いグレーで固定する
  const playerColor = useDerivedValue(() => "rgba(60, 60, 60, 1)");

  // 上に重ねる白円の半径を計算する
  // ゴールに近づくほど大きく、最遠で直径 2px (半径1px) にする
  const innerRadius = useDerivedValue(() => {
    const maxDist = (maze.size - 1) * 2;
    const d = distance(pos, { x: maze.goal[0], y: maze.goal[1] });
    // ゴールから遠いほど ratio が 0 に近づく
    const ratio = clamp(1 - d / maxDist, 0, 1);
    // 1px を最小半径とし、ratio に応じて線形補間
    return lerp(1, radius, ratio);
  }, [pos, maze.goal, maze.size]);

  // 外周円の色だけアニメーションさせる
  const outerProps = useAnimatedProps(() => ({
    // 常に薄いグレーの塗りつぶしを維持
    fill: playerColor.value,
    // 白色の細い枠線を追加
    stroke: "white",
    strokeWidth: 1,
    r: radius,
  }));

  // 内側の白円は半径のみ変化させる
  const innerProps = useAnimatedProps(() => ({
    r: innerRadius.value,
    fill: "white",
  }));

  return (
    // View の borderColor は常に透明にしておき、
    // 白枠は SVG で描画する
    <Animated.View
      style={[{ width: size, height: size, borderColor: "transparent" }, style]}
    >
      <Svg width={size} height={size}>
        {/* 外周は常に白色で細線表示 */}
        <Rect
          x={0}
          y={0}
          width={size}
          height={size}
          strokeWidth={1}
          stroke="white"
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
          // プレイヤー円からはみ出さないように一回り小さく描画する
          <Rect
            x={(maze.goal[0] + 0.3) * cell}
            y={(maze.goal[1] + 0.3) * cell}
            width={cell * 0.4}
            height={cell * 0.4}
            fill="white" // 塗りつぶし
          />
        )}
        {/*
          プレイヤー表示は以下の二重円で実現する
          1. 外側: 常に薄いグレーの円
          2. 内側: 白い円。距離で半径が変わる
        */}
        <AnimatedCircle
          animatedProps={outerProps}
          cx={(pos.x + 0.5) * cell}
          cy={(pos.y + 0.5) * cell}
        />
        <AnimatedCircle
          animatedProps={innerProps}
          cx={(pos.x + 0.5) * cell}
          cy={(pos.y + 0.5) * cell}
        />
        {renderEnemies({
          enemies,
          cell,
          showAll,
          playerPos: pos,
          maze: mazeSets,
        })}
      </Svg>
    </Animated.View>
  );
}
