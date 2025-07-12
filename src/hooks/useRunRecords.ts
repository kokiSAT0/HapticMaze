import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

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

const RunRecordContext = createContext<RunRecordContextValue | undefined>(undefined);

export function RunRecordProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<RunRecord[]>([]);
  const [respawns, setRespawns] = useState(0);
  const [reveals, setReveals] = useState(0);

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
