import { useAuth } from '../context/AuthContext'
import { KPI_DATA, MONTHLY_DATA, DEPARTMENTS } from '../utils/data'
import { exportPDF } from '../utils/pdfExport'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const fmt = (v) => 'R$ ' + v.toLocaleString('pt-BR')
const total = DEPARTMENTS.reduce((s, d) => s + d.value, 0)

const s = {
  page: { padding: 28, flex: 1, overflowY: 'auto', minHeight: 0 },
  grid4: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))',
    gap: 16, marginBottom: 24,
  },
  kpiCard: (accent) => ({
    background: '#fff', borderRadius: 12, padding: '20px 20px 16px',
    boxShadow: '0 1px 3px rgba(0,0,0,.07)', borderTop: `3px solid ${accent}`,
    animationDelay: '0ms',
  }),
  kpiLabel: { fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 },
  kpiValue: (color) => ({ fontSize: 26, fontWeight: 700, color, fontFamily: 'DM Mono, monospace', lineHeight: 1 }),
  kpiTrend: (positive) => ({
    display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 10,
    fontSize: 12, fontWeight: 600,
    color: positive ? '#16a34a' : '#dc2626',
    background: positive ? '#dcfce7' : '#fee2e2',
    padding: '2px 8px', borderRadius: 20,
  }),
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 },
  card: {
    background: '#fff', borderRadius: 12, padding: '20px 20px 16px',
    boxShadow: '0 1px 3px rgba(0,0,0,.07)',
  },
  cardTitle: { fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 16 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em', padding: '0 0 10px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' },
  td: { padding: '10px 0', fontSize: 13, color: '#374151', borderBottom: '1px solid #f8fafc' },
  tdRight: { padding: '10px 0', fontSize: 13, color: '#374151', textAlign: 'right', borderBottom: '1px solid #f8fafc', fontFamily: 'DM Mono, monospace' },
  bar: (pct, color) => ({
    height: 6, borderRadius: 3, background: color, width: `${pct}%`,
    marginTop: 4,
  }),
  pctText: { fontSize: 11, color: '#94a3b8', marginLeft: 8 },
  exportBtn: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
    background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8,
    fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'background .2s',
    marginBottom: 24, marginLeft: 'auto',
  },
  alert: {
    background: '#fef9c3', border: '1px solid #fde047', borderRadius: 10,
    padding: '14px 18px', fontSize: 13, color: '#713f12', marginBottom: 24,
  },
  fullRow: { gridColumn: '1 / -1' },
}

const DEPT_COLORS = ['#16a34a', '#1d4ed8', '#f59e0b', '#8b5cf6']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 12, color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>R$ {p.value?.toLocaleString('pt-BR')}</strong>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const isViewer = user?.role === 'viewer'

  return (
    <div style={s.page}>
      {isViewer && (
        <div style={s.alert} className="fade-in">
          ℹ️ Você está em modo <strong>Visualizador</strong>. Apenas métricas básicas estão disponíveis.
        </div>
      )}

      {/* Export Button */}
      {!isViewer && (
        <div style={{ display: 'flex', marginBottom: 16 }}>
          <button
            style={s.exportBtn}
            onClick={exportPDF}
            onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
            onMouseLeave={e => e.currentTarget.style.background = '#0f172a'}
          >
            ⬇ Exportar Relatório PDF
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div style={s.grid4}>
        <KpiCard label="Receita Mensal" value={fmt(KPI_DATA.receita)} color="#16a34a" accent="#16a34a" trend={`+${KPI_DATA.receitaTrend}% vs mês ant.`} positive />
        <KpiCard label="Despesas Mensais" value={fmt(KPI_DATA.despesas)} color="#dc2626" accent="#dc2626" trend={`${KPI_DATA.custosTrend}% vs mês ant.`} positive />
        {!isViewer && <>
          <KpiCard label="Lucro Líquido" value={fmt(KPI_DATA.lucro)} color="#1d4ed8" accent="#1d4ed8" />
          <KpiCard label="Margem de Lucro" value={`${KPI_DATA.margem}%`} color="#7c3aed" accent="#7c3aed" />
        </>}
      </div>

      {/* Charts - only for non-viewers */}
      {!isViewer && (
        <>
          <div style={s.row}>
            {/* Bar Chart */}
            <div style={s.card} className="fade-in">
              <div style={s.cardTitle}>Receitas × Despesas × Lucro (últimos 6 meses)</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={MONTHLY_DATA} barGap={2} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => 'R$' + (v/1000)+'k'} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="receita" name="Receita" fill="#16a34a" radius={[4,4,0,0]} />
                  <Bar dataKey="despesas" name="Despesas" fill="#dc2626" radius={[4,4,0,0]} />
                  <Bar dataKey="lucro" name="Lucro" fill="#1d4ed8" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart */}
            <div style={s.card} className="fade-in">
              <div style={s.cardTitle}>Evolução Mensal — Receita e Lucro</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={MONTHLY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => 'R$' + (v/1000)+'k'} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="receita" name="Receita" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4, fill: '#16a34a' }} />
                  <Line type="monotone" dataKey="lucro" name="Lucro" stroke="#1d4ed8" strokeWidth={2.5} dot={{ r: 4, fill: '#1d4ed8' }} strokeDasharray="5 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Departments */}
          <div style={s.card} className="fade-in">
            <div style={s.cardTitle}>Custos por Departamento</div>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Departamento</th>
                  <th style={{ ...s.th, textAlign: 'right' }}>Custo</th>
                  <th style={{ ...s.th, textAlign: 'right' }}>% do Total</th>
                  <th style={s.th}>Distribuição</th>
                </tr>
              </thead>
              <tbody>
                {DEPARTMENTS.map((dept, i) => {
                  const pct = ((dept.value / total) * 100).toFixed(1)
                  return (
                    <tr key={dept.name}>
                      <td style={s.td}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 10, height: 10, borderRadius: 3, background: DEPT_COLORS[i], display: 'inline-block' }} />
                          {dept.name}
                        </span>
                      </td>
                      <td style={s.tdRight}>{fmt(dept.value)}</td>
                      <td style={{ ...s.tdRight, color: '#64748b' }}>{pct}%</td>
                      <td style={s.td}>
                        <div style={{ background: '#f1f5f9', borderRadius: 3, height: 6, width: 140 }}>
                          <div style={{ ...s.bar(parseFloat(pct), DEPT_COLORS[i]), maxWidth: '100%' }} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
                <tr>
                  <td style={{ ...s.td, fontWeight: 700, color: '#0f172a' }}>Total</td>
                  <td style={{ ...s.tdRight, fontWeight: 700, color: '#0f172a' }}>{fmt(total)}</td>
                  <td style={{ ...s.tdRight, fontWeight: 700, color: '#0f172a' }}>100%</td>
                  <td style={s.td} />
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function KpiCard({ label, value, color, accent, trend, positive }) {
  return (
    <div style={s.kpiCard(accent)} className="fade-in">
      <div style={s.kpiLabel}>{label}</div>
      <div style={s.kpiValue(color)}>{value}</div>
      {trend && (
        <div style={s.kpiTrend(positive)}>
          {positive !== undefined ? (positive ? '↑' : '↓') : ''} {trend}
        </div>
      )}
    </div>
  )
}
