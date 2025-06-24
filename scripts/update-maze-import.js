#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const mazesDir = path.join(rootDir, 'assets', 'mazes');

// assets/mazes 内の JSON ファイルを検索
const mazeFiles = fs
  .readdirSync(mazesDir)
  .filter((name) => name.endsWith('.json') && fs.statSync(path.join(mazesDir, name)).isFile());

if (mazeFiles.length === 0) {
  console.error('assets/mazes に JSON ファイルがありません');
  process.exit(1);
}

// 複数ある場合でも先頭のみ使用する (通常は 1 つのみの想定)
const mazeFile = mazeFiles[0];

const outputPath = path.join(rootDir, 'src', 'game', 'mazeAsset.ts');
const content = `// 自動生成: assets/mazes 内の唯一の JSON を参照する\n` +
  `// ${new Date().toISOString()}\n` +
  `import mazeData from '@/assets/mazes/${mazeFile}';\n` +
  `export default mazeData;\n`;

fs.writeFileSync(outputPath, content);
console.log(`mazeAsset.ts updated with ${mazeFile}`);

