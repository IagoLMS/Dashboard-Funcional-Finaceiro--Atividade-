import { Heart } from 'lucide-react';
import { KPI_DATA } from '../utils/data';
import { useAuth } from '../context/AuthContext';

const PAGE_TITLES = {
  users: 'Gestão de Usuários',
};

const fmt = (v) => 'R$ ' + v.toLocaleString('pt-BR');

export default function Topbar({ page }) {
  const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  const { user } = useAuth();
  
  return (
    <header className="flex items-center justify-between flex-shrink-0 h-14 px-7 bg-white border-b border-slate-200">
      <div className="text-base font-bold text-slate-900 flex gap-2">
        {PAGE_TITLES[page] || `Bem vindo(a), ${user?.name.split(' ')[0]}! 💙`}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-xs text-slate-400">{now}</div>
        <div className="flex items-center gap-2 py-1.5 px-3.5 bg-green-100/30 border border-green-300 rounded-full">
          <div className="w-[7px] h-[7px] rounded-full bg-green-500" />
          <span className="text-[11px] font-medium text-green-800">Saldo Mensal</span>
          <span className="text-[13px] font-bold text-green-700 font-mono">{fmt(KPI_DATA.lucro)}</span>
        </div>
      </div>
    </header>
  );
}
