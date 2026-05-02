import { useState, useEffect, useCallback } from 'react';
import { useDataSource } from '../context/DataSourceContext.jsx';
import { getRepository }  from '../data/repositories/index.js';

export function useCostCenters() {
  const { mode }              = useDataSource();
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const repo = getRepository('costCenters', mode);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await repo.list();
      setData(list);
    } catch(err) {
      setError(err.message || 'Erro ao carregar centros de custo.');
    } finally {
      setLoading(false);
    }
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (data) => {
    const result = await repo.create(data);
    if(!result.error) setData(result.updated);
    return result;
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = useCallback(async (id, changes) => {
    const result = await repo.update(id, changes);
    if(!result.error) setData(result.updated);
    return result;
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = useCallback(async (id) => {
    const result = await repo.remove(id);
    if(!result.error) setData(result.updated);
    return result;
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const getAnalysis = useCallback((id) => {
    return repo.getAnalysis(id);
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const getMonthlyVariation = useCallback(() => {
    return repo.getMonthlyVariation();
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refresh, create, update, remove, getAnalysis, getMonthlyVariation };
}
