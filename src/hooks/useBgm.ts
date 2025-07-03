// BGM 再生のためのフックを再輸出します
// 実装本体は audio/BgmProvider.tsx にあるため
// このファイルから呼び出すことで hooks フォルダに機能を集約しています
export { useBgm } from '@/src/audio/BgmProvider';
