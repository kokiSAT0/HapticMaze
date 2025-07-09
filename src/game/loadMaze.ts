// mazeAsset.ts から迷路セットを読み込む
import { mazeSet5, mazeSet10 } from './mazeAsset';
import type { MazeData } from '@/src/types/maze';

// 未使用迷路のプールを保持する変数。使い切ったら再初期化する
let pool5: MazeData[] = [...mazeSet5];
let pool10: MazeData[] = [...mazeSet10];

export interface LoadMazeOptions {
  /** エラー時に呼び出されるコールバック */
  showError?: (msg: string) => void;
}

/**
 * 指定したサイズの迷路をランダムに返す
 * @param size 迷路の一辺の長さ
 */
export function loadMaze(size: number = 10, opts: LoadMazeOptions = {}): MazeData {
  // 5 でも 10 でもない場合はエラー扱い
  if (size !== 5 && size !== 10) {
    console.error('loadMaze: invalid size', size);
    opts.showError?.('迷路サイズは 5 または 10 を指定してください');
    // 初心者向け: 不正な値はデフォルトの10に置き換える
    size = 10;
  }

  // サイズに応じてプールを選択する
  const pool = size === 5 ? pool5 : pool10;
  // プールが空なら元のセットから再初期化
  if (pool.length === 0) {
    if (size === 5) {
      pool5 = [...mazeSet5];
    } else {
      pool10 = [...mazeSet10];
    }
  }
  // 更新後のプールを再取得
  const list = size === 5 ? pool5 : pool10;
  const idx = Math.floor(Math.random() * list.length);
  // splice で取り出して重複を防ぐ
  const [maze] = list.splice(idx, 1);
  if (size === 5) {
    pool5 = list;
  } else {
    pool10 = list;
  }
  return maze;
}

/** テスト用にプールを初期状態へ戻す */
export function resetMazePools() {
  pool5 = [...mazeSet5];
  pool10 = [...mazeSet10];
}
