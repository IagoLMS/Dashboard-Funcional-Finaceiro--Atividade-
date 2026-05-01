import { useAuth } from '../context/AuthContext'

const ROLE_LABELS = { admin: 'Administrador', gestor: 'Gestor', viewer: 'Visualizador' }

const NAV_ITEMS = [
  { id: 'dashboard', icon: '◈', label: 'Dashboard',           roles: ['admin', 'gestor', 'viewer'] },
  { id: 'users',     icon: '⊞', label: 'Gestão de Usuários',  roles: ['admin'] },
]

const navItemClass = (active) => [
  'flex items-center gap-3 px-5 py-2.5 cursor-pointer transition-all text-sm select-none border-l-[3px]',
  active
    ? 'text-slate-100 bg-slate-800 border-green-500 font-semibold'
    : 'text-slate-500 bg-transparent border-transparent font-normal hover:text-slate-400',
].join(' ')

export default function Sidebar({ page, setPage, onLogout }) {
  const { user } = useAuth()
  const visible = NAV_ITEMS.filter(item => item.roles.includes(user?.role))

  return (
    <aside className="flex flex-col flex-shrink-0 w-60 h-screen sticky top-0 bg-slate-900">
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-5 border-b border-slate-800">
        <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-lg bg-green-600 text-white font-extrabold text-[15px]">
          CF
        </div>
        <div>
          <div className="text-slate-100 font-bold text-base">CorpFinance</div>
          <div className="text-slate-500 text-[11px]">Financeiro</div>
        </div>
      </div>

      <nav className="flex-1 py-3">
        <div className="px-5 pt-4 pb-1.5 text-[10px] font-bold text-slate-700 uppercase tracking-[0.08em]">
          Menu
        </div>
        {visible.map(item => (
          <div
            key={item.id}
            className={navItemClass(page === item.id)}
            onClick={() => setPage(item.id)}
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-slate-800">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-slate-400 font-bold text-[13px]">
            {user?.name?.[0] || 'U'}
          </div>
          <div>
            <div className="text-slate-300 text-[13px] font-semibold">{user?.name}</div>
            <div className="text-slate-600 text-[11px]">{ROLE_LABELS[user?.role]}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full p-2 bg-transparent border border-slate-800 rounded-md text-slate-600 cursor-pointer text-xs transition-all hover:border-red-600 hover:text-red-600"
        >
          ↩ Sair da conta
        </button>
      </div>
    </aside>
  )
}
