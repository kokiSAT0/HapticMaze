import React, { createContext, useContext, useState, useCallback } from 'react';

const RunRecordContext = createContext(undefined);

export function RunRecordProvider({ children }) {
  const [records, setRecords] = useState([]);
  const [respawns, setRespawns] = useState(0);
  const [reveals, setReveals] = useState(0);

  const addRecord = useCallback((stage, steps, bumps) => {
    setRecords((prev) => [...prev, { stage, steps, bumps, respawns, reveals }]);
    setRespawns(0);
    setReveals(0);
  }, [respawns, reveals]);

  const incRespawn = useCallback(() => setRespawns((v) => v + 1), []);
  const incReveal = useCallback(() => setReveals((v) => v + 1), []);

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

export function useRunRecords() {
  const ctx = useContext(RunRecordContext);
  if (!ctx) throw new Error('useRunRecords は RunRecordProvider 内で利用してください');
  return ctx;
}
