import { useAuth } from '../context/AuthContext'
import { KPI_DATA } from '../utils/data'

const s = {
  bar: {
    height: 56, background: '#fff', borderBottom: '1px solid #e2e8f0',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 28px', flexShrink: 0,
  },
  title: { fontSize: 16, fontWeight: 700, color: '#0f172a' },
  right: { display: 'flex', alignItems: 'center', gap: 16 },
  saldo: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px',
    background: '#dcfce7', borderRadius: 20, border: '1px solid #86efac',
  },
  saldoLabel: { fontSize: 11, color: '#166534', fontWeight: 500 },
  saldoValue: { fontSize: 13, color: '#15803d', fontWeight: 700, fontFamily: 'DM Mono, monospace' },
  dot: { width: 7, height: 7, borderRadius: '50%', background: '#22c55e' },
  date: { fontSize: 12, color: '#94a3b8' },
}

const PAGE_TITLES = {
  dashboard: 'Dashboard Financeiro',
  users: 'Gestão de Usuários',
}

export default function Topbar({ page }) {
  const { user } = useAuth()
  const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  const fmt = (v) => 'R$ ' + v.toLocaleString('pt-BR')

  return (
    <header style={s.bar}>
      <div style={s.title}>{PAGE_TITLES[page] || 'Dashboard'}</div>
      <div style={s.right}>
        <div style={s.date}>{now}</div>
        <div style={s.saldo}>
          <div style={s.dot} />
          <span style={s.saldoLabel}>Saldo Mensal</span>
          <span style={s.saldoValue}>{fmt(KPI_DATA.lucro)}</span>
        </div>
      </div>
    </header>
  )
}
