# Haptic Maze α

このリポジトリは Expo SDK 53 を用いた触覚迷路ゲーム「Haptic Maze」の α 版です。
ホーム画面から 5×5 または 10×10 の迷路を選んでプレイできます。

## 必要環境

- Node.js 20 以上
- pnpm 8 以上 (npm でも動作します)

## セットアップと実行

1. 依存パッケージのインストール

   ```bash
   pnpm install
   ```

2. アプリの起動

   ```bash
   pnpm ios      # iOS シミュレータで実行
   pnpm android  # Android 実機で実行
   ```

3. コードチェック

   ```bash
   pnpm lint
   ```

## ゲーム内容

- 起動時はデフォルトで 10×10 迷路を読み込みます
- D‑Pad の上下左右ボタンで 1 マスずつ移動します
 - ゴールまでのマンハッタン距離に応じて画面の枠がフラッシュし、端末が振動します
- 壁にぶつかると赤い枠と長めの振動でフィードバックされ、Bumps が加算されます
- ゴールに到達すると Steps と Bumps を表示するモーダルが開きます
- 画面右上のメニューから「Reset Maze」「Exit to Title」を選択できます

## 主要ディレクトリ

```
HapticMaze/
├─ app/              # 画面コンポーネント (expo-router)
├─ assets/mazes/     # 迷路 JSON
├─ components/       # 再利用 UI (DPad など)
├─ src/game/         # ゲームロジック
└─ src/types/        # 型定義
```

迷路 JSON の形式や詳細な仕様は `APP_SPEC.md` を参照してください。

