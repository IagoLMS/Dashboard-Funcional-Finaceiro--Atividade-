import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDataSource } from '../context/DataSourceContext.jsx';
import { getRepository }  from '../data/repositories/index.js';

export function useCashFlow() {
  const { mode }              = useDataSource();
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const repo = useMemo(() => getRepository('cashflow', mode), [mode]);

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
  }, [repo]);

  useEffect(() => { refresh(); }, [refresh]);

  const sync = useCallback(async () => {
    try {
      const list = await repo.list();
      setData(list);
    } catch(err) {
      setError(err.message || 'Erro ao sincronizar dados.');
    }
  }, [repo]);

  const create = useCallback(async (entry) => {
    const result = await repo.create(entry);
    await sync();
    return result;
  }, [repo, sync]);

  const update = useCallback(async (id, changes) => {
    const result = await repo.update(id, changes);
    await sync();
    return result;
  }, [repo, sync]);

  const remove = useCallback(async (id) => {
    const result = await repo.remove(id);
    await sync();
    return result;
  }, [repo, sync]);

  return { data, loading, error, refresh, create, update, remove };
}
