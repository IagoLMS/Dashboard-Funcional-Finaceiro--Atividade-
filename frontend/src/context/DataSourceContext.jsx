import { createContext, useContext, useState } from 'react';

const STORAGE_KEY = 'cf_data_source';

const DataSourceContext = createContext(null);

export function DataSourceProvider({ children }) {
  const [mode, setModeState] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'mock'; }
    catch { return 'mock'; }
  });

  function setMode(newMode) {
    setModeState(newMode);
    try { localStorage.setItem(STORAGE_KEY, newMode); }
    catch { /* storage unavailable */ }
  }

  return (
    <DataSourceContext.Provider value={{ mode, setMode }}>
      {children}
    </DataSourceContext.Provider>
  );
}

export function useDataSource() {
  const ctx = useContext(DataSourceContext);
  if(!ctx) 
    throw new Error('useDataSource must be used inside DataSourceProvider');
  return ctx;
}
