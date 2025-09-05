import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHandleError } from '@/src/utils/handleError';
// 翻訳関数を利用するため LocaleContext から取得
import { useLocale } from '@/src/locale/LocaleContext';

/**
 * 1 ステージ分の記録を表すインターフェース
 * stage: ステージ番号
 * steps: 歩数
 * bumps: 壁にぶつかった回数
 * respawns: リスタート回数
 * reveals: 全表示を使った回数
 */
export interface RunRecord {
  stage: number;
  steps: number;
  bumps: number;
  respawns: number;
  reveals: number;
}

/**
 * Context が保持する値の型
 */
interface RunRecordContextValue {
  records: RunRecord[];
  addRecord: (stage: number, steps: number, bumps: number) => void;
  incRespawn: () => void;
  incReveal: () => void;
  reset: () => void;
}

// AsyncStorage に保存する際のキー名
const STORAGE_KEY = 'runRecords';

// 保存されるデータの形を定義
interface StoredData {
  records: RunRecord[];
  respawns: number;
  reveals: number;
}

const RunRecordContext = createContext<RunRecordContextValue | undefined>(undefined);

export function RunRecordProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<RunRecord[]>([]);
  const [respawns, setRespawns] = useState(0);
  const [reveals, setReveals] = useState(0);
  // 例外表示用の共通ハンドラ
  const handleError = useHandleError();
  // ローカライズされた文言を取得する関数
  const { t } = useLocale();

  // 初回マウント時に保存済みのデータを読み込む
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          const data = JSON.parse(json) as StoredData;
          setRecords(data.records ?? []);
          setRespawns(data.respawns ?? 0);
          setReveals(data.reveals ?? 0);
        }
      } catch (e) {
        // スコアデータの読込に失敗した場合の処理
        handleError(t('loadScoreFailure'), e);
      }
    })();
  }, [handleError, t]);

  // データが変化するたびに保存する
  useEffect(() => {
    (async () => {
      try {
        const data: StoredData = { records, respawns, reveals };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        // スコアデータの保存に失敗した場合の処理
        handleError(t('saveScoreFailure'), e);
      }
    })();
  }, [records, respawns, reveals, handleError, t]);

  /**
   * ステージクリア時に記録を追加する処理
   */
  const addRecord = useCallback(
    (stage: number, steps: number, bumps: number) => {
      setRecords((prev) => [...prev, { stage, steps, bumps, respawns, reveals }]);
      setRespawns(0);
      setReveals(0);
    },
    [respawns, reveals],
  );

  /** リスタート回数を増やす */
  const incRespawn = useCallback(() => setRespawns((v) => v + 1), []);
  /** 全表示回数を増やす */
  const incReveal = useCallback(() => setReveals((v) => v + 1), []);

  /** 記録をすべてリセットする */
  const reset = useCallback(() => {
    setRecords([]);
    setRespawns(0);
    setReveals(0);
  }, []);

  return React.createElement(
    RunRecordContext.Provider,
    { value: { records, addRecord, incRespawn, incReveal, reset } },
    children,
  );
}

/**
 * 記録コンテキストを取得するフック
 */
export function useRunRecords(): RunRecordContextValue {
  const ctx = useContext(RunRecordContext);
  if (!ctx) throw new Error('useRunRecords は RunRecordProvider 内で利用してください');
  return ctx;
}
