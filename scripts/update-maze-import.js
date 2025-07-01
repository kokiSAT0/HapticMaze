#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const mazesDir = path.join(rootDir, 'assets', 'mazes');

// assets/mazes 内の JSON ファイルを検索
const mazeFiles = fs
  .readdirSync(mazesDir)
  .filter(
    (name) => name.endsWith('.json') && fs.statSync(path.join(mazesDir, name)).isFile()
  );

if (mazeFiles.length === 0) {
  console.error('assets/mazes に JSON ファイルがありません');
  process.exit(1);
}

// 迷路サイズごとに import を生成
const importLines = [];
const exportLines = [];

// サイズ順に並べ替え
mazeFiles
  .slice()
  .sort((a, b) => {
    const aNum = parseInt(a.match(/(\d+)/)?.[1] ?? '0', 10);
    const bNum = parseInt(b.match(/(\d+)/)?.[1] ?? '0', 10);
    return aNum - bNum;
  })
  .forEach((file) => {
    const basename = path.basename(file, '.json');
    // ファイル名から数字を抽出してサイズに利用
    const sizeMatch = basename.match(/(\d+)/);
    if (!sizeMatch) return; // サイズを特定できないファイルは無視
    const size = sizeMatch[1];
    importLines.push(`import maze${size} from '@/assets/mazes/${file}';`);
    exportLines.push(`export const mazeSet${size} = maze${size};`);
  });

const outputPath = path.join(rootDir, 'src', 'game', 'mazeAsset.ts');
const content =
  `// 自動生成: assets/mazes 内の迷路をサイズ別にエクスポート\n` +
  `// ${new Date().toISOString()}\n` +
  importLines.join('\n') +
  '\n\n' +
  exportLines.join('\n') +
  '\n';

fs.writeFileSync(outputPath, content);
console.log(`mazeAsset.ts updated with ${mazeFiles.join(', ')}`);

