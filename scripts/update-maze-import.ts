#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// ---------- スクリプトの目的 ----------
// assets/mazes フォルダにある迷路 JSON を調べて
// src/game/mazeAsset.ts というファイルを作り直します。
// 迷路を追加するたびに手で import を書く必要をなくすための自動生成です。
// -------------------------------------

// このスクリプトは assets/mazes フォルダ内の JSON を読み取り、
// src/game/mazeAsset.ts に迷路データの import 文をまとめて自動生成します。
// "自動生成" はプログラムが人の手を介さずファイルを作り直すことを意味します。

// __dirname はこのファイルがあるディレクトリを指す特殊変数
const rootDir: string = path.join(__dirname, '..');
const mazesDir: string = path.join(rootDir, 'assets', 'mazes');

// ↑ここまでで迷路フォルダのパスが決まりました

// 迷路データのファイル一覧を取得する処理
// fs.readdirSync はフォルダ内の名前をすぐに配列で返す「同期処理」です
const mazeFiles: string[] = fs
  .readdirSync(mazesDir)
  .filter(
    (name: string) =>
      name.endsWith('.json') && fs.statSync(path.join(mazesDir, name)).isFile()
  );

// ↑ここまでで mazeFiles に JSON ファイル名だけが入りました

// ファイルが無い場合はここでエラーを出して終了します
if (mazeFiles.length === 0) {
  console.error('assets/mazes に JSON ファイルがありません');
  process.exit(1);
}
// ↑ここまでで空チェックが完了しました

// ここから取得したファイル名を使って import と export の行を作ります
// ファイル名に含まれる数字をサイズとして扱うため並び替えを行います

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

// ↑ここまでで importLines と exportLines の配列が完成しました

// ここから mazeAsset.ts に書き込むテキストを作ります
const outputPath: string = path.join(rootDir, 'src', 'game', 'mazeAsset.ts');
const content: string =
  `// 自動生成: assets/mazes 内の迷路をサイズ別にエクスポート\n` +
  `// ${new Date().toISOString()}\n` +
  importLines.join('\n') +
  '\n\n' +
  exportLines.join('\n') +
  '\n';

// ↑ここまでで出力するテキストが content にまとまりました

// ファイルへ書き込む処理
fs.writeFileSync(outputPath, content);
// 書き込みが終わったことをコンソールに表示
console.log(`mazeAsset.ts updated with ${mazeFiles.join(', ')}`);
