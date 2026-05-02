import { useState } from 'react';
import { Database, FlaskConical, RefreshCw } from 'lucide-react';
import { useDataSource } from '../context/DataSourceContext.jsx';

export default function DataSourceToggle() {
  const { mode, setMode } = useDataSource();
  const [confirming, setConfirming] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);

  const isMock = mode === 'mock';

  const requestSwitch = (newMode) => {
    if(newMode === mode) return;
    setPendingMode(newMode);
    setConfirming(true);
  };

  const confirm = () => {
    setMode(pendingMode);
    setConfirming(false);
    setPendingMode(null);
  };

  const cancel = () => {
    setConfirming(false);
    setPendingMode(null);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-slate-400 font-medium">Fonte de dados:</span>

        <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-slate-50 shadow-sm text-[12px] font-semibold">
          <button
            onClick={() => requestSwitch('mock')}
            className={[
              'flex items-center gap-1.5 py-1.5 px-3 cursor-pointer transition-colors',
              isMock
                ? 'bg-amber-500 text-white shadow-inner'
                : 'text-slate-500 hover:bg-slate-100',
            ].join(' ')}
          >
            <FlaskConical size={13} />
            Demo
          </button>

          <button
            onClick={() => requestSwitch('api')}
            className={[
              'flex items-center gap-1.5 py-1.5 px-3 cursor-pointer transition-colors',
              !isMock
                ? 'bg-blue-900 text-white shadow-inner'
                : 'text-slate-500 hover:bg-slate-100',
            ].join(' ')}
          >
            <Database size={13} />
            Produção
          </button>
        </div>

        {isMock ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold py-0.5 px-2 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
            <FlaskConical size={9} /> Modo Demo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold py-0.5 px-2 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
            <Database size={9} /> Dados Reais
          </span>
        )}
      </div>

      {confirming && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-[380px] bg-white rounded-[14px] pt-6 px-6 pb-5 shadow-xl animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${pendingMode === 'api' ? 'bg-blue-100' : 'bg-amber-100'}`}>
                {pendingMode === 'api'
                  ? <Database size={18} className="text-blue-700" />
                  : <FlaskConical size={18} className="text-amber-600" />
                }
              </div>
              <div className="text-[15px] font-bold text-slate-900">
                {pendingMode === 'api' ? 'Ativar Modo Produção?' : 'Ativar Modo Demo?'}
              </div>
            </div>
            <p className="text-[13px] text-slate-500 mb-5">
              {pendingMode === 'api'
                ? 'Os dados exibidos serão carregados do banco real via API. Certifique-se que o backend está rodando.'
                : 'Os dados exibidos serão demonstrativos (sem persistência permanente). Ideal para testes.'
              }
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={cancel}
                className="flex-1 py-[9px] px-4 bg-slate-50 border border-slate-200 rounded-[7px] text-[13px] text-gray-700 cursor-pointer hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={confirm}
                className={`flex-1 py-[9px] px-4 rounded-[7px] text-[13px] text-white font-semibold cursor-pointer flex items-center justify-center gap-2 ${pendingMode === 'api' ? 'bg-blue-900 hover:bg-blue-800' : 'bg-amber-500 hover:bg-amber-600'}`}
              >
                <RefreshCw size={14} /> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
