import { useAuth } from '../context/AuthContext'

const s = {
  sidebar: {
    width: 240, minHeight: '100vh', background: '#0f172a',
    display: 'flex', flexDirection: 'column', flexShrink: 0,
    position: 'sticky', top: 0, height: '100vh',
  },
  logo: {
    padding: '24px 20px 20px', borderBottom: '1px solid #1e293b',
    display: 'flex', alignItems: 'center', gap: 10,
  },
  logoIcon: {
    width: 36, height: 36, background: '#16a34a', borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 800, fontSize: 15, flexShrink: 0,
  },
  logoText: { color: '#f1f5f9', fontWeight: 700, fontSize: 16 },
  logoSub: { color: '#64748b', fontSize: 11 },
  nav: { flex: 1, padding: '12px 0' },
  navItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 20px', cursor: 'pointer', transition: 'all .15s',
    color: active ? '#f1f5f9' : '#64748b',
    background: active ? '#1e293b' : 'transparent',
    borderLeft: active ? '3px solid #22c55e' : '3px solid transparent',
    fontWeight: active ? 600 : 400, fontSize: 14,
    userSelect: 'none',
  }),
  navIcon: { fontSize: 16, width: 20, textAlign: 'center' },
  sectionLabel: {
    padding: '16px 20px 6px', fontSize: 10, fontWeight: 700,
    color: '#334155', textTransform: 'uppercase', letterSpacing: '.08em',
  },
  footer: {
    padding: '16px 20px', borderTop: '1px solid #1e293b',
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  avatar: {
    width: 32, height: 32, borderRadius: '50%', background: '#1e293b',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#94a3b8', fontWeight: 700, fontSize: 13, flexShrink: 0,
  },
  userName: { color: '#cbd5e1', fontSize: 13, fontWeight: 600 },
  userRole: { color: '#475569', fontSize: 11 },
  logoutBtn: {
    width: '100%', padding: '8px', background: 'transparent',
    border: '1px solid #1e293b', borderRadius: 6, color: '#475569',
    cursor: 'pointer', fontSize: 12, transition: 'all .15s',
  },
}

const ROLE_LABELS = { admin: 'Administrador', gestor: 'Gestor', viewer: 'Visualizador' }

export default function Sidebar({ page, setPage, onLogout }) {
  const { user } = useAuth()

  const navItems = [
    { id: 'dashboard', icon: '◈', label: 'Dashboard', roles: ['admin', 'gestor', 'viewer'] },
    { id: 'users', icon: '⊞', label: 'Gestão de Usuários', roles: ['admin'] },
  ]

  const visible = navItems.filter(item => item.roles.includes(user?.role))

  return (
    <aside style={s.sidebar}>
      <div style={s.logo}>
        <div style={s.logoIcon}>CF</div>
        <div>
          <div style={s.logoText}>CorpFinance</div>
          <div style={s.logoSub}>Financeiro</div>
        </div>
      </div>

      <nav style={s.nav}>
        <div style={s.sectionLabel}>Menu</div>
        {visible.map(item => (
          <div
            key={item.id}
            style={s.navItem(page === item.id)}
            onClick={() => setPage(item.id)}
            onMouseEnter={e => { if (page !== item.id) e.currentTarget.style.color = '#94a3b8' }}
            onMouseLeave={e => { if (page !== item.id) e.currentTarget.style.color = '#64748b' }}
          >
            <span style={s.navIcon}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>

      <div style={s.footer}>
        <div style={s.userInfo}>
          <div style={s.avatar}>{user?.name?.[0] || 'U'}</div>
          <div>
            <div style={s.userName}>{user?.name}</div>
            <div style={s.userRole}>{ROLE_LABELS[user?.role]}</div>
          </div>
        </div>
        <button
          style={s.logoutBtn}
          onClick={onLogout}
          onMouseEnter={e => { e.target.style.borderColor = '#dc2626'; e.target.style.color = '#dc2626' }}
          onMouseLeave={e => { e.target.style.borderColor = '#1e293b'; e.target.style.color = '#475569' }}
        >
          ↩ Sair da conta
        </button>
      </div>
    </aside>
  )
}
