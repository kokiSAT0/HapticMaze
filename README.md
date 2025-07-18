# Maze Sense β

このリポジトリは Expo SDK 53 を利用した触覚迷路ゲーム「Maze Sense」の β 版です。
ホーム画面から 5×5 または 10×10 の迷路を選択でき、
チュートリアル・レベルモード・練習モードも利用できます。
全ステージをクリアすると各ステージの結果を折れ線グラフで確認できる
「ゲームリザルト」画面へ遷移します。

## 必要環境

- Node.js 20 以上  　JavaScript を実行するためのランタイム環境です
- pnpm 8 以上 (npm でも動作します)  　パッケージ管理ツールの一種で、高速に依存関係をインストールできます

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
- 難易度はチュートリアル・イージー・ノーマル・ハードの 4 段階で、壁の寿命や敵の配置条件がレベルごとに異なります（詳細は `doc/level.md` を参照）
- D‑Pad の上下左右ボタンで 1 マスずつ移動します
- ゴールまでのマンハッタン距離に応じて画面の枠がフラッシュし、端末が振動します
- 壁にぶつかると赤い枠と長めの振動でフィードバックされ、Bumps が加算されます
- ゴールに到達すると Steps と Bumps を表示するモーダルが開きます
- ゲーム状態は自動保存され、再起動時に「つづきから」を選択可能です
- クリア状況はレベル別にハイスコアとして保存されます
- ハイスコアはホーム画面の「HighScore」ボタンから確認できます
- 各ステージの記録は RunRecord として保存され、ゲーム終了後に
  折れ線グラフで確認できます
- BGM と効果音の音量をホーム画面とプレイ画面で調整できます
- 画面右上には敵リスポーンボタンと迷路全表示ボタンがあります
- タイトルに戻るときは左上の家アイコンを押します
- 日本語 / 英語の切り替えに対応しています

## 主要ディレクトリ

```
mazesense/
├─ app/              # 画面コンポーネント (expo-router)
├─ components/       # ボタンやメニューなど共通 UI
├─ constants/        # UI寸法やレベル定義
├─ hooks/            # テーマ取得など共通フック
├─ scripts/          # 迷路データ更新スクリプト
├─ assets/
│  ├─ mazes/         # 迷路 JSON
│  ├─ images/        # アイコンなど画像
│  ├─ sounds/        # 効果音
│  └─ fonts/         # 使用フォント
├─ src/
│  ├─ ads/           # 広告表示用コード
│  ├─ audio/         # BGM など音声制御
│  ├─ components/    # MiniMap など画面専用パーツ
│  ├─ game/          # ゲームロジック
│  ├─ hooks/         # React フック群
│  ├─ locale/        # 多言語テキスト管理
│  ├─ styles/        # スタイル定義
│  ├─ types/         # 型定義
│  └─ utils/         # 汎用ユーティリティ
└─ doc/              # レベル仕様書など
```

迷路 JSON の形式や詳細な仕様は `APP_SPEC.md` を参照してください。

## UI サイズの調整

ボタンの大きさやモーダル幅など、画面要素のサイズは `constants/ui.ts` にまとめて
います。今後寸法を変更したい場合はこのファイルだけ編集すれば他のコードを触らずに
更新できます。

## 迷路データの更新手順

`assets/mazes` フォルダに迷路 JSON を配置した状態で `pnpm start` などの起動
コマンドを実行すると、`scripts/update-maze-import.js` が自動的に走り
`src/game/mazeAsset.ts` が生成されます。これにより迷路セットが最新の内容に
置き換わります。手動で更新したい場合は以下を実行してください。

```bash
pnpm exec node scripts/update-maze-import.js
```

## デバッグ用オプション

ステージ開始時に表示される黒画面のバナーをスキップしたい場合は
`.env` に次の行を追加します。

```bash
EXPO_PUBLIC_DISABLE_STAGE_BANNER=true
```

値を `false` または未設定にすると通常通りバナーが表示されます。

難易度解放の状態に関係なくすべてのゲームモードを試したい場合は以下を設定します。

```bash
EXPO_PUBLIC_UNLOCK_ALL_LEVELS=true
```

通常は `false` のままで構いません。

ゲーム開始時にいきなり最終ステージへ進みたい場合は次の設定を追加します。

```bash
EXPO_PUBLIC_START_AT_FINAL_STAGE=true
```

デバッグ目的でのみ使用してください。

## エラーログの確認

アプリ内で発生したエラーは `AsyncStorage` に保存されます。ログは最大50件まで保
持され、新しいエラーが記録されると古いものから削除されます。開発中に内容を確認し
たい場合は `getErrorLogs` 関数を利用してください。
BGM の再生や広告表示に失敗したときも、設定中の言語に応じたメッセージが表示されます。

## β版の配布について

現在のバージョンはテスト目的の β 版です。TestFlight もしくは Google Play の内部
テストトラックを通じて限定配布します。個人情報の収集は行っていません。

詳細な利用規約とプライバシーポリシーについては、リポジトリ直下の [`TERMS_OF_SERVICE.md`](TERMS_OF_SERVICE.md) と [`PRIVACY_POLICY.md`](PRIVACY_POLICY.md) を参照してください。
