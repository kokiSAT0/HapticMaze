// 距離計算は math モジュールへ移動
// 距離計算や補間用ユーティリティ
import { clamp, distance } from "@/src/game/math";
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

  // ゴールまでの距離に応じてプレイヤー外周の色を変える
  // 距離 0 と 1 のときは真っ白にし、それ以降は徐々に暗くしていく
  const playerColor = useDerivedValue(() => {
    // 迷路サイズから算出できる最大のマンハッタン距離
    const maxDist = (maze.size - 1) * 2;
    // プレイヤーとゴールの距離を取得
    const d = distance(pos, { x: maze.goal[0], y: maze.goal[1] });

    if (d <= 1) {
      // 距離が 0 または 1 のときは完全な白色を返す
      return 'rgb(255,255,255)';
    }

    // 2 以上の距離では段階的に暗くしていく
    // ratio は 0 〜 1 の範囲で増加する値
    const ratio = Math.min((d - 1) / (maxDist - 1), 1);

    // 最大距離でも見失わないよう下限を薄いグレー(ここでは rgb(80,80,80))に設定
    const minGray = 20;
    const g = Math.round(minGray + (255 - minGray) * (1 - ratio));
    return `rgb(${g},${g},${g})`;
  }, [pos, maze.goal, maze.size]);

  // ドーナツの内側を黒で塗りつぶすための半径を求める
  // 距離 0 ～ 1 マスでは r = 0、最遠では r = radius - 2 とする
  const innerRadius = useDerivedValue(() => {
    const maxDist = (maze.size - 1) * 2;
    const d = distance(pos, { x: maze.goal[0], y: maze.goal[1] });
    const ratio = clamp((d - 1) / (maxDist - 1), 0, 1);
    const limit = Math.max(radius - 2, 0);
    return limit * ratio;
  }, [pos, maze.goal, maze.size]);

  // 外周円の色だけアニメーションさせる
  const outerProps = useAnimatedProps(() => ({
    fill: playerColor.value,
    r: radius,
  }));

  // 内側の黒円は半径のみ変化させる
  const innerProps = useAnimatedProps(() => ({
    r: innerRadius.value,
    fill: "black",
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
          <Rect
            x={(maze.goal[0] + 0.25) * cell}
            y={(maze.goal[1] + 0.25) * cell}
            width={cell * 0.5}
            height={cell * 0.5}
            fill="white" // 塗りつぶし
          />
        )}
        {/*
          プレイヤー表示は以下の二重円で実現する
          1. 外側: ゴールまでの距離で色だけ変わる円
          2. 内側: 黒い円。半径を変えてドーナツの太さを表現
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
        {renderEnemies({ enemies, cell, showAll, playerPos: pos, maze: mazeSets })}
      </Svg>
    </Animated.View>
  );
}
