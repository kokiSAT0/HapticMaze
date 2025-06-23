import maze001 from '@/assets/mazes/maze001.json';
import type { MazeData } from '@/src/types/maze';

/**
 * maze001.json を読み込んで MazeData 型に変換する関数
 * JSON をそのまま返すだけだが、型チェックを兼ねている
 */
export function loadMaze(): MazeData {
  // JSON.parse は不要。import 時点でオブジェクト化されている
  return maze001 as MazeData;
}
