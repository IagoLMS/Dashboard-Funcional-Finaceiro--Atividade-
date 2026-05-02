import { useAuth } from '../context/AuthContext';
import { House, LogOut, TrendingUp, UserCog, Wallet } from 'lucide-react';

import logoLight from "../assets/logotype/logo_reduced_light.png";

const ROLE_LABELS = { 
  gestor: 'Gestor', 
  viewer: 'Visualizador', 
  admin:  'Administrador', 
};

const NAV_ITEMS = [
  { id: 'dashboard',   icon: House,      label: 'Dashboard',          roles: ['admin', 'gestor', 'viewer'] },
  { id: 'users',       icon: UserCog,    label: 'Gestão de Usuários', roles: ['admin'] },
  { id: 'cashflow',    icon: TrendingUp, label: 'Fluxo de Caixa',     roles: ['admin', 'gestor'] },
  { id: 'receivables', icon: Wallet,     label: 'Contas a Receber',   roles: ['admin', 'gestor'] },
];

const navItemClass = (active) => [
  'flex items-center gap-3 px-5 py-2.5 cursor-pointer transition-all text-sm select-none border rounded-md',
  active
    ? 'text-slate-100 bg-white/20 border-white/90 font-semibold'
    : 'text-slate-300 bg-transparent border-transparent hover:text-slate-400',
].join(' ');

export default function Sidebar({ page, setPage, onLogout }) {
  const { user } = useAuth();
  const visible = NAV_ITEMS.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="relative overflow-hidden flex flex-col flex-shrink-0 w-60 h-screen top-0 bg-blue-900">
      <div className="pointer-events-none absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-dark-cyan/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 w-[480px] h-[480px] rounded-full bg-cyan/20 blur-3xl" />

      <div className="z-10 flex justify-center gap-2.5 px-5 pt-6 pb-5 border-b border-white/60">
        <img src={logoLight} className='h-14' alt="Start Solidarium Logotype"  />
      </div>

      <nav className="z-10 flex-1 py-3 px-3 space-y-1">
        <div className="px-5 pt-4 pb-1.5 text-[10px] font-bold text-white/70 uppercase tracking-[0.1em]">
          Menu
        </div>

        {visible.map(item => (
          <div
            key={item.id}
            className={navItemClass(page === item.id)}
            onClick={() => setPage(item.id)}
          >
            <item.icon className="text-base w-5 text-center"/>
            {item.label}
          </div>
        ))}
      </nav>

      <div className="z-10 px-5 py-4 border-t border-white/60 bg-black/10">
        <div className="flex items-center gap-2.5 mb-5 mt-1">
          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full bg-white/10 text-white/90 font-bold text-[16px] border border-white/40">
            {user?.name?.[0] || 'U'}
          </div>

          <div>
            <div className="text-white/90 text-[14px] font-semibold">{user?.name}</div>
            <div className="text-white/70 text-[12px]">{ROLE_LABELS[user?.role]}</div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 p-3 bg-transparent border border-white/40 rounded-md text-white/70 cursor-pointer text-xs transition-all hover:border-red-300 hover:text-red-300"
        >
          <LogOut className='scale-x-[-1]' size={14} /> Sair da conta
        </button>
      </div>
    </aside>
  )
}
