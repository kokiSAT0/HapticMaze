import React, { createContext, useContext, useState } from 'react';

const RunRecordContext = createContext(undefined);

export function RunRecordProvider({ children }) {
  const [records, setRecords] = useState([]);
  const [respawns, setRespawns] = useState(0);
  const [reveals, setReveals] = useState(0);

  const addRecord = (stage, steps, bumps) => {
    setRecords((prev) => [...prev, { stage, steps, bumps, respawns, reveals }]);
    setRespawns(0);
    setReveals(0);
  };

  const incRespawn = () => setRespawns((v) => v + 1);
  const incReveal = () => setReveals((v) => v + 1);

  const reset = () => {
    setRecords([]);
    setRespawns(0);
    setReveals(0);
  };

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
