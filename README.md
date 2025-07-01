# Maze Sense α

このリポジトリは Expo SDK 53 を用いた触覚迷路ゲーム「Maze Sense」の α 版です。
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

4. ユニットテスト

   Jest を使ったユニットテストが含まれています。次のコマンドで実行できます。

   ```bash
   pnpm test
   ```

## AdMob 広告について

Expo SDK53 以降では `react-native-google-mobile-ads` を利用します。インタースティシャル広告の
テスト用 ID と本番用 ID を環境変数で切り替えられます。

1. テストビルドでは `react-native-google-mobile-ads` が提供するテスト ID を自動使用。
2. 本番ビルド時に `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID` を設定するとその値を使用します。
   広告 SDK 連携には `ANDROID_ADMOB_APP_ID` と `IOS_ADMOB_APP_ID` を app.config.js で参照します。
   これらの変数はプロジェクト直下の `.env` に記載します。ひな形として `.env.example` を用意しているのでコピーして利用してください。テスト広告のみで動作確認する場合は `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID` を設定しないままにします。

### 本番ビルド例

```bash
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID="ca-app-pub-xxxxxxxxxxxxxxxx/nnnnnnnnnn" \
  expo export --public-url https://example.com
```

Expo のビルドサービスを利用する場合は `eas.json` の `env` セクションに同名の変数を追加してください。

## ゲーム内容

- 起動時はデフォルトで 10×10 迷路を読み込みます
- D‑Pad の上下左右ボタンで 1 マスずつ移動します
- ゴールまでのマンハッタン距離に応じて画面の枠がフラッシュし、端末が振動します
- 壁にぶつかると赤い枠と長めの振動でフィードバックされ、Bumps が加算されます
- ゴールに到達すると Steps と Bumps を表示するモーダルが開きます
- 画面右上のメニューから「Reset Maze」「Exit to Title」を選択できます

## 主要ディレクトリ

```
mazesense/
├─ app/              # 画面コンポーネント (expo-router)
├─ assets/mazes/     # 迷路 JSON
├─ components/       # 再利用 UI (DPad など)
├─ src/game/         # ゲームロジック
└─ src/types/        # 型定義
```

迷路 JSON の形式や詳細な仕様は `APP_SPEC.md` を参照してください。

## 迷路データの更新手順

`assets/mazes` フォルダに迷路 JSON を配置した状態で `pnpm start` などの起動
コマンドを実行すると、`scripts/update-maze-import.js` が自動的に走り
`src/game/mazeAsset.ts` が生成されます。これにより迷路セットが最新の内容に
置き換わります。手動で更新したい場合は以下を実行してください。

```bash
pnpm exec node scripts/update-maze-import.js
```
