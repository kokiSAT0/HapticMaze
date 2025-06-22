# Haptic Maze — α 版 技術仕様書 (v0.2.0 / 2025‑06‑23)

> **このドキュメントの目的**
> このドキュメントをもとにテスターがプレイできる α 版を完成させる。

---

## 1. 機能要件 (MVP)

| #   | 機能                  | 詳細                                                     |
| --- | --------------------- | -------------------------------------------------------- |
| F1  | 10×10 固定迷路読込    | JSON ファイル `assets/mazes/maze001.json` を起動時ロード |
| F2  | D‑Pad 移動            | 4 方向ボタン / 1 ボタン = 1 セル移動                     |
| F3  | 壁衝突判定            | `v_walls` / `h_walls` で O(1) 判定、衝突時位置は変えない |
| F4  | 距離フィードバック    | ゴール直線距離を振動長さ & 枠太さにマッピング            |
| F5  | ゴール判定 & 結果表示 | Steps & Bumps の数値をモーダル表示、OK でタイトルへ      |
| F6  | ヘッダーサブメニュー  | “Reset Maze” / “Exit to Title” を提供                    |

---

## 2. 非機能要件

- **FPS 60** を維持（アニメーションは Reanimated v3 使用）
- **アクセシビリティ**: D‑Pad ボタンに `accessibilityLabel` を付与
- **端末互換**: iOS 14+ / Android 9+
- **ビルドサイズ**: < 30 MB (apk) / < 40 MB (ipa)

---

## 3. データ仕様 — Maze JSON

Python 側で生成しやすいよう「マス間の壁」を直列配列で管理。

```jsonc
{
  "id": "maze001",
  "size": 10,
  "start": [0, 0],
  "goal": [9, 9],
  "v_walls": [
    [0, 0],
    [3, 5]
  ], // (x,y) — (x+1,y)
  "h_walls": [
    [2, 4],
    [8, 1]
  ] // (x,y) — (x,y+1)
}
```

- 配列は 0‑index。範囲外壁はアプリ側で暗黙追加。
- 型定義 (TypeScript):

```ts
export interface MazeData {
  id: string;
  size: 10;
  start: [number, number];
  goal: [number, number];
  v_walls: [number, number][];
  h_walls: [number, number][];
}
```

---

## 4. アーキテクチャ & ディレクトリ構成

```
haptic-maze/
├─ App.tsx                    // Navigation Entrypoint
├─ app.json                   // Expo 設定
├─ assets/
│  └─ mazes/maze001.json
└─ src/
   ├─ screens/
   │   ├─ TitleScreen.tsx
   │   └─ PlayScreen.tsx
   ├─ components/
   │   ├─ DPad.tsx
   │   └─ MiniMap.tsx
   ├─ game/
   │   ├─ useGame.ts          // ゲームロジック & 状態管理 (Reducer)
   │   └─ utils.ts            // 汎用関数 (canMove, distance etc.)
   └─ types/
       └─ maze.ts
```

- **Navigation**: `react-navigation` は未使用。`useState` で `scene` 分岐。
- **状態管理**: `useReducer<GameState>` を `GameContext` で共有。

---

## 5. 主要コンポーネント仕様

### 5.1 `DPad`

| Prop     | 型            | 説明          |        |                    |          |
| -------- | ------------- | ------------- | ------ | ------------------ | -------- |
| `onMove` | \`(dir: 'Up'  | 'Down'        | 'Left' | 'Right') => void\` | 方向通知 |
| `size`   | `number` (dp) | デフォルト 56 |        |                    |          |

### 5.2 `MiniMap`

| Prop    | 型         | 説明                    |
| ------- | ---------- | ----------------------- |
| `maze`  | `MazeData` | 壁情報描画用            |
| `path`  | `Vec2[]`   | 移動済み軌跡            |
| `pos`   | `Vec2`     | 現在位置                |
| `flash` | `number`   | 枠太さ (Animated value) |

---

## 6. ゲームロジック

### 6.1 GameState

```ts
interface GameState {
  pos: Vec2; // 現在位置
  steps: number; // 移動成功回数
  bumps: number; // 壁衝突回数
  path: Vec2[]; // 通過履歴 (MiniMap 用)
}
```

### 6.2 canMove

```ts
function canMove({ x, y }: Vec2, dir: Dir, maze: MazeData) {
  const { v_walls: h, h_walls: v } = maze;
  switch (dir) {
    case "Right":
      return !h.has(`${x},${y}`) && x < 9;
    case "Left":
      return !h.has(`${x - 1},${y}`) && x > 0;
    case "Down":
      return !v.has(`${x},${y}`) && y < 9;
    case "Up":
      return !v.has(`${x},${y - 1}`) && y > 0;
  }
}
```

_(Set<string> で常時  O(1) 判定)_

### 6.3 フィードバックマッピング

```ts
const maxDist = Math.hypot(9, 9);
const dist = Math.hypot(goal.x - x, goal.y - y);
const t = dist / maxDist; // 0–1
const vibMs = lerp(120, 20, 1 - t); // 120→20ms
const borderW = lerp(2, 8, 1 - t); // 2→8px
```

- 振動: `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium, vibMs);`
- 枠: Reanimated `withTiming(borderW, {duration:150})`

---

## 7. 画面 UI  寸法

| エリア       | 幅 × 高      | 備考            |
| ------------ | ------------ | --------------- |
| ミニマップ   | 80×80 px     | 固定            |
| D‑Pad        | ボタン 56 dp | CenterBottom    |
| ヘッダー     | H 48 dp      | rgba(0,0,0,0.6) |
| 枠フラッシュ | Border       | 2‑8 px / 150 ms |

---

## 8. 依存ライブラリ

| パッケージ              | バージョン | 用途             |
| ----------------------- | ---------- | ---------------- |
| expo                    | SDK 50     | Baseline         |
| expo‑haptics            | latest     | 振動 API         |
| react‑native‑svg        | 15.x       | MiniMap 描画     |
| react‑native‑reanimated | 3.x        | 枠アニメーション |

---

## 9. ビルド & 実行

```bash
# 1. プロジェクト作成
npx create-expo-app haptic-maze -t expo-template-blank-typescript
cd haptic-maze
pnpm i expo-haptics react-native-svg react-native-reanimated@next

# 2. 迷路 JSON 追加
mkdir -p assets/mazes && cp <path>/maze001.json assets/mazes/

# 3. iOS シミュレータ
expo start --ios
#    Android 実機
expo start --android
```

---

## 10. TODO チェックリスト

- [ ] Maze JSON パーサ実装
- [ ] GameContext / useGameReducer
- [ ] D‑Pad UI + 入力ハンドラ
- [ ] 壁衝突判定 & 状態更新
- [ ] ミニマップ & 軌跡描画
- [ ] 振動 / 枠フィードバック関数
- [ ] ゴール判定 & ResultModal
- [ ] ヘッダーサブメニュー
- [ ] EAS build (iOS TestFlight / Android APK)

---

## 11. 検証項目 (QA)

1. **移動**: 10×10 すべてのセルに到達可能か
2. **壁衝突**: 壁リスト完全一致で衝突するか
3. **フィードバック**: 距離に比例して振動&枠が変化するか
4. **Result**: steps / bumps が正しくカウントされるか
5. **Reset**: サブメニュー → 位置 & 軌跡が初期化されるか
6. **デバイス振動差異**: iPhone / Pixel で体感確認

---

## 12. 今後拡張 (β 以降)

- 迷路自動生成 & 複数サイズ
- タイム/スコア・リーダーボード
- Endless / TimeAttack モード
- カスタムハプティックパック DLC

---
