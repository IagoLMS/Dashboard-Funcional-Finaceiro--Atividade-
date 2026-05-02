import { useState, useEffect, useCallback } from 'react';
import { useDataSource } from '../context/DataSourceContext.jsx';
import { getRepository }  from '../data/repositories/index.js';

export function useReceivables() {
  const { mode }              = useDataSource();
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const repo = getRepository('receivables', mode);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await repo.list();
      setData(list);
    } catch(err) {
      setError(err.message || 'Erro ao carregar contas a receber.');
    } finally {
      setLoading(false);
    }
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (data) => {
    const updated = await repo.create(data);
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

  const registerPayment = useCallback(async (id, payment) => {
    const result = await repo.registerPayment(id, payment);
    if(!result.error) setData(result.updated);
    return result;
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refresh, create, update, remove, registerPayment };
}
