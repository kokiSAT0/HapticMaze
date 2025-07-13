#!/usr/bin/env node

// TypeScript の代わりに CommonJS 形式で書き直した版
// assets/mazes フォルダの JSON 一覧から src/game/mazeAsset.ts を自動生成します
// 迷路追加時に毎回 import を書く手間を省くためのスクリプトです

const fs = require('fs');
const path = require('path');

// __dirname はこのファイルが置かれたディレクトリを表します
const rootDir = path.join(__dirname, '..');
const mazesDir = path.join(rootDir, 'assets', 'mazes');

// 迷路 JSON のファイル名を取得
const mazeFiles = fs
  .readdirSync(mazesDir)
  .filter(
    (name) =>
      name.endsWith('.json') && fs.statSync(path.join(mazesDir, name)).isFile()
  );

// ファイルが無ければエラー終了
if (mazeFiles.length === 0) {
  console.error('assets/mazes に JSON ファイルがありません');
  process.exit(1);
}

// 迷路サイズ別に import と export の行を組み立て
const importLines = [];
const exportLines = [];

mazeFiles
  .slice()
  .sort((a, b) => {
    const aNum = parseInt((a.match(/(\d+)/) || [])[1] || '0', 10);
    const bNum = parseInt((b.match(/(\d+)/) || [])[1] || '0', 10);
    return aNum - bNum;
  })
  .forEach((file) => {
    const basename = path.basename(file, '.json');
    const sizeMatch = basename.match(/(\d+)/);
    if (!sizeMatch) return; // サイズが取れないファイルは無視
    const size = sizeMatch[1];
    importLines.push(`import maze${size} from '@/assets/mazes/${file}';`);
    exportLines.push(`export const mazeSet${size} = maze${size};`);
  });

// mazeAsset.ts の書き込み先と内容を準備
const outputPath = path.join(rootDir, 'src', 'game', 'mazeAsset.ts');
const content =
  `// 自動生成: assets/mazes 内の迷路をサイズ別にエクスポート\n` +
  `// ${new Date().toISOString()}\n` +
  importLines.join('\n') +
  '\n\n' +
  exportLines.join('\n') +
  '\n';

// ファイルへ書き込み、完了を表示
fs.writeFileSync(outputPath, content);
console.log(`mazeAsset.ts updated with ${mazeFiles.join(', ')}`);
