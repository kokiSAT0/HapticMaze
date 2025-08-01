# AGENTS.md – AI Coding Guide for **Maze Sense** Development

> **目的**: このガイドは ChatGPT などの AI コーディング補助を最大限活用し実装を効率化する。エンジニアが本ガイドの指示をそのまま AI へ投げれば、コンポーネント雛形や関数サンプルを即座に得られるようにする。

---

## 1. プロジェクト概要

- 大人向け “暗闇 × 触覚” 迷路ゲーム。
- **10×10 固定迷路 JSON** を読み込み、D‑Pad で移動しゴールを目指す。
- ゴールまでの **直線距離** を「振動強度 + 画面枠フラッシュ」で提示。
- ゴール時に **手数 (Steps) / 壁衝突数 (Bumps)** を表示。

---

## 2. 技術スタック 

| 項目              | バージョン                              | 備考                       |
| ----------------- | --------------------------------------- | -------------------------- |
| Node.js           | 20.x                                    | LTS                        |
| Expo SDK          | **53.x**                                | Managed Workflow           |
| TypeScript        | 5.x (`"strict": false`)                 | 現時点は緩め、段階的に厳格化 |
| State / Animation | `react-native-reanimated@^3`            |                            |
| SVG               | `react-native-svg@^15`                  |                            |
| 振動              | `expo-haptics`                          |                            |
| パッケージ管理    | `pnpm` 推奨 (npm でも可)                |                            |
| ~~UI ライブラリ~~ | なし (シンプル UI のため不要)           |                            |
| テスト            | `jest`, `@testing-library/react-native` |                            |


---

## 3. リポジトリ構成(最新の構成に合わせてここを変更する必要あり)

```
maze-sense/
├── App.tsx                  # 画面切替 (Title ↔ Play)
├── assets/
│   └── mazes/maze001.json   # 10×10 迷路データ
├── src/
│   ├── screens/             # 画面
│   │   ├── TitleScreen.tsx
│   │   └── PlayScreen.tsx
│   ├── components/          # 再利用 UI
│   │   ├── DPad.tsx         # 十字キー
│   │   └── MiniMap.tsx      # ミニマップ
│   ├── game/                # ロジック
│   │   ├── useGame.tsx      # 状態管理 (Reducer)
│   │   └── utils.ts         # canMove 等ヘルパ
│   └── types/maze.ts        # MazeData 型
└── README.md
```

---

## 4. Maze JSON 仕様 

```json
{
  "id": "maze001",
  "size": 10,
  "start": [0, 0],
  "goal": [9, 9],
  "v_walls": [
    [0, 0],
    [3, 5]
  ],
  "h_walls": [
    [2, 4],
    [8, 1]
  ]
}
```

- **v_walls**: `(x,y)` と `(x+1,y)` の間に壁。
- **h_walls**: `(x,y)` と `(x,y+1)` の間に壁。
- 枠外壁はアプリで自動補完。

---

## 5. Git & コミット指針

- 単一ブランチ運用 (`main`)。
- コミット: `feat: canMove 実装`, `fix: 壁衝突バグ` などシンプル & 日本語 OK。

---

## 6. AI  開発基本方針

- **言語**: 日本語
- **コードブロック**: `tsx` / `ts` / `bash` / `json`
- **追加パッケージ**: 必要なら `pnpm add <pkg>` コマンドを明示

### ✅ 出力時チェックリスト

1. Expo SDK 53 に対応しているか？
2. `react-native-svg` / `reanimated` 使用箇所が正しいか？
3. 型定義 (`interface`) を付与したか？
4. `accessibilityLabel` を設定したか？
5. 不要 import / any 型は排除したか？

---

## 7. コード品質ルール

| 項目              | ルール                                             |
| ----------------- | -------------------------------------------------- |
| ESLint / Prettier | ルートで設定し CI に組込む                         |
| 迷路ロジック      | 純関数 & ユニットテスト必須                        |
| エラー処理        | `try/catch` で Snackbar 通知 (Reanimated 影響なし) |
| データ保存        | β版を目指して実装を目指す。                  |
| アクセシビリティ  | 主要ボタン ≥ 48dp, ラベル必須                      |

---

## 8. ビルド & テスト

開発環境は **Node.js 20** 以上と `pnpm` を前提とする。

1. 依存パッケージのインストール
   ```bash
   pnpm install
   ```
2. 開発サーバ起動
   ```bash
   pnpm ios      # iOS シミュレータ
   pnpm android  # Android 実機
   ```
3. Lint / テスト
   ```bash
   pnpm lint     # ESLint による静的解析
   # jest 実行は後日追加予定
   ```

---

## 9. リリース & 配布

- 内部配布のみ (TestFlight / Google Play Internal Testing)。
- 個人情報収集なし。将来的にはランキング機能を追加。
- 無料広告はAdmobを使用。

---

_Last updated: 2025‑07‑04_
