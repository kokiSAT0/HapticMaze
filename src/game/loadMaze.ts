// mazeAsset.ts から迷路セットを読み込む
import { mazeSet5, mazeSet10 } from './mazeAsset';
import type { MazeData } from '@/src/types/maze';
import type { MessageKey } from '@/src/locale/LocaleContext';

export interface LoadMazeOptions {
  /** エラー時に呼び出されるコールバック */
  showError?: (msg: string) => void;
  /** 現在の言語に応じた文言を取得するための関数 */
  t?: (key: MessageKey) => string;
}

// IIFE でプール配列と操作関数を閉じ込める
const { loadMaze, resetMazePools } = (() => {
  // 使われていない迷路を保持するプール。外部から直接は触れられない
  let pool5: MazeData[] = [...mazeSet5];
  let pool10: MazeData[] = [...mazeSet10];

  /**
   * 指定したサイズの迷路をランダムに返す
   * @param size 迷路の一辺の長さ
   */
  function loadMaze(size: number = 10, opts: LoadMazeOptions = {}): MazeData {
    // 5 でも 10 でもない場合はエラー扱い
    if (size !== 5 && size !== 10) {
      console.error('loadMaze: invalid size', size);
      // 翻訳関数が渡されなくても必ず t('invalidMazeSize') を利用するため
      // デフォルトの翻訳関数を用意して英語メッセージを返す
      const t = opts.t ?? ((key: MessageKey) => {
        // 想定しているキーは invalidMazeSize のみだが、他のキーが来た場合はそのまま返す
        if (key === 'invalidMazeSize') {
          return 'Maze size must be 5 or 10';
        }
        return key;
      });
      // 上記で用意した t を利用してエラーメッセージを取得する
      const msg = t('invalidMazeSize');
      opts.showError?.(msg);
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
  function resetMazePools() {
    pool5 = [...mazeSet5];
    pool10 = [...mazeSet10];
  }

  return { loadMaze, resetMazePools };
})();

export { loadMaze, resetMazePools };
