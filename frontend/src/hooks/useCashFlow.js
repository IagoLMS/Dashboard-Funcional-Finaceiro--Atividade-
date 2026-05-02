import { useState, useEffect, useCallback } from 'react';
import { useDataSource } from '../context/DataSourceContext.jsx';
import { getRepository }  from '../data/repositories/index.js';

export function useCashFlow() {
  const { mode }         = useDataSource();
  const [data, setData]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const repo = getRepository('cashflow', mode);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await repo.list();
      setData(list);
    } catch(err) {
      setError(err.message || 'Erro ao carregar fluxo de caixa.');
    } finally {
      setLoading(false);
    }
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (entry) => {
    const updated = await repo.create(entry);
    setData(updated);
    return updated;
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = useCallback(async (id, changes) => {
    const updated = await repo.update(id, changes);
    setData(updated);
    return updated;
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = useCallback(async (id) => {
    const updated = await repo.remove(id);
    setData(updated);
    return updated;
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refresh, create, update, remove };
}
