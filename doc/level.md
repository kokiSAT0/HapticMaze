# レベルの概要

Maze Sense にはチュートリアルからハードまで 4 種類の難易度があります。下表では各レベルの迷路サイズや敵配置の違いをまとめています。

| レベル         | 迷路サイズ | ゴール出現位置           | 敵出現位置         | 衝突壁の寿命                                                                                       | 周囲の壁表示           | プレイヤー軌跡長 |
| -------------- | ---------- | ------------------------ | ------------------ | -------------------------------------------------------------------------------------------------- | ---------------------- | ---------------- |
| チュートリアル | 5×5        | 完全ランダム             | プレイヤーから遠い |
無限大
                   | 全ステージ表示  | 20 マス          |
| イージー       | 10×10      | 完全ランダム             | プレイヤーから遠い | 無限大                                                                                             | 全ステージ表示 | 20 マス          |
| ノーマル       | 10×10      | ランダム                 | プレイヤーから遠い | 1〜51: 無限大<br>52〜: 50 ターン                                                                   | プレイヤー1T・敵10T   | 10 マス          |
| ハード         | 10×10      | プレイヤーから遠い       | ランダム           | 1〜21: 無限大<br>22〜51: 40 ターン<br>52〜72: 30 ターン<br>73〜90: 20 ターン<br>91〜100: 10 ターン | なし                   | 7 マス           |

軌跡長はプレイヤーが進んだ跡を何マス分画面に残すかを示します。値が大きいほど長い軌跡が表示され、道のりを振り返りやすくなります。

### チュートリアルの敵出現数

| ステージ番号                                   | 出現する敵        |
| ---------------------------------------------- | ----------------- |
| 5, 8, 9, 12, 13, 14, 16, 17, 18, 21, 22       | 鈍足視認 1 体     |
| 10, 15, 19, 20, 23, 24, 25                    | 等速ランダム 1 体 |
| 上記以外                                       | 敵なし            |

## 敵出現数の詳細

下表はイージー以降のレベルで使用する`level1EnemyCounts`の内容です。ステージ番号を 3 で割った余りごとに敵の種類が変化します。
ランダムは等速ランダムのこと。

| ステージ範囲 | 余り 1 (mod 3 = 1)                          | 余り 2 (mod 3 = 2)                          | 余り 0 (mod 3 = 0)                          |
| ------------ | ------------------------------------------- | ------------------------------------------- | ------------------------------------------- |
| 1〜9         | ランダム 1 体                               | ランダム 1 体                               | 鈍足視認 1 体                               |
| 10〜18       | ランダム 1 体                               | ランダム 1 体                               | ランダム 1 体                               |
| 19〜27       | ランダム 1 体                               | ランダム 1 体                               | 鈍足視認 2 体                               |
| 28〜36       | ランダム 1 体                               | ランダム 2 体                               | 鈍足視認 2 体                               |
| 37〜45       | ランダム 2 体                               | ランダム 2 体                               | ランダム 1 体＋鈍足視認 2 体                |
| 46〜54       | ランダム 2 体                               | 鈍足視認 3 体                               | ランダム 1 体＋鈍足視認 2 体                |
| 55〜63       | ランダム 2 体                               | 鈍足視認 3 体                               | ランダム 1 体＋鈍足視認 2 体                |
| 64〜72       | ランダム 2 体                               | ランダム 1 体＋鈍足視認 2 体                | ランダム 2 体＋鈍足視認 1 体                |
| 73〜81       | ランダム 2 体                               | ランダム 1 体＋鈍足視認 2 体                | ランダム 2 体＋等速視認 1 体                |
| 82〜90       | ランダム 1 体＋鈍足視認 2 体                | ランダム 3 体                               | ランダム 1 体＋鈍足視認 3 体                |
| 91〜99       | ランダム 1 体＋鈍足視認 2 体＋等速視認 1 体 | ランダム 1 体＋鈍足視認 2 体＋等速視認 1 体 | ランダム 1 体＋鈍足視認 2 体＋等速視認 1 体 |
| 100          | ランダム 1 体＋鈍足視認 2 体＋等速視認 2 体 | ランダム 1 体＋鈍足視認 2 体＋等速視認 2 体 | ランダム 1 体＋鈍足視認 2 体＋等速視認 2 体 |

**補足**

`mod` は数値を 3 で割ったときの余りを意味します。例えばステージ 5 なら `5 mod 3` は 2 になります。
