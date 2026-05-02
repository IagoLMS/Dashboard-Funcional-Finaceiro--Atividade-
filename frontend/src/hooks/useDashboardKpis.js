import { useState, useEffect, useCallback } from 'react';
import { useDataSource } from '../context/DataSourceContext.jsx';
import { getRepository }  from '../data/repositories/index.js';

export function useDashboardKpis() {
  const { mode }              = useDataSource();
  const [kpis, setKpis]       = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const repo = getRepository('dashboard', mode);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [k, m, d] = await Promise.all([
        repo.getKpis(),
        repo.getMonthly(),
        repo.getDepartments(),
      ]);
      setKpis(k);
      setMonthly(m);
      setDepartments(d);
    } catch(err) {
      setError(err.message || 'Erro ao carregar dados do dashboard.');
    } finally {
      setLoading(false);
    }
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { refresh(); }, [refresh]);

  return { kpis, monthly, departments, loading, error, refresh };
}
