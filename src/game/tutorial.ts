import type { EnemyCounts } from '@/src/types/enemy';

/**
 * チュートリアル専用の敵出現数を返す関数です。
 * ステージ番号ごとの敵出現設定をまとめています。
 * 以下の番号は配列（複数の値をまとめた変数）で管理し、該当するステージなら
 * それぞれの敵を1体だけ登場させます。
 *
 * - `slowStages`: 鈍足視認が出るステージ
 * - `randomStages`: 等速ランダムが出るステージ
 * - 上記以外は敵なし
*/
export function tutorialEnemyCounts(stage: number): EnemyCounts {
  // 鈍足視認が出現するステージ番号一覧
  const slowStages = [5, 8, 9, 12, 13, 14, 16, 17, 18, 21, 22];
  // 等速ランダムが出現するステージ番号一覧
  const randomStages = [10, 15, 19, 20, 23, 24, 25];

  if (slowStages.includes(stage)) {
    return { random: 0, slow: 1, sight: 0, fast: 0 };
  }

  if (randomStages.includes(stage)) {
    return { random: 1, slow: 0, sight: 0, fast: 0 };
  }

  return { random: 0, slow: 0, sight: 0, fast: 0 };
}
