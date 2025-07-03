#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// __dirname はこのファイルがあるディレクトリを指す特殊変数
const rootDir: string = path.join(__dirname, '..');
const mazesDir: string = path.join(rootDir, 'assets', 'mazes');

// assets/mazes 内の JSON ファイル一覧を取得
const mazeFiles: string[] = fs
  .readdirSync(mazesDir)
  .filter(
    (name: string) =>
      name.endsWith('.json') && fs.statSync(path.join(mazesDir, name)).isFile()
  );

if (mazeFiles.length === 0) {
  console.error('assets/mazes に JSON ファイルがありません');
  process.exit(1);
}

// 迷路サイズごとの import / export 行を保存する配列
const importLines: string[] = [];
const exportLines: string[] = [];

// ファイル名に含まれる数字順に並べ替え
mazeFiles
  .slice()
  .sort((a: string, b: string) => {
    const aNum = parseInt(a.match(/(\d+)/)?.[1] ?? '0', 10);
    const bNum = parseInt(b.match(/(\d+)/)?.[1] ?? '0', 10);
    return aNum - bNum;
  })
  .forEach((file: string) => {
    const basename = path.basename(file, '.json');
    // ファイル名から数字を取り出してサイズに利用
    const sizeMatch = basename.match(/(\d+)/);
    if (!sizeMatch) return; // サイズを特定できないファイルは無視
    const size = sizeMatch[1];
    importLines.push(`import maze${size} from '@/assets/mazes/${file}';`);
    exportLines.push(`export const mazeSet${size} = maze${size};`);
  });

const outputPath: string = path.join(rootDir, 'src', 'game', 'mazeAsset.ts');
const content: string =
  `// 自動生成: assets/mazes 内の迷路をサイズ別にエクスポート\n` +
  `// ${new Date().toISOString()}\n` +
  importLines.join('\n') +
  '\n\n' +
  exportLines.join('\n') +
  '\n';

fs.writeFileSync(outputPath, content);
console.log(`mazeAsset.ts updated with ${mazeFiles.join(', ')}`);
