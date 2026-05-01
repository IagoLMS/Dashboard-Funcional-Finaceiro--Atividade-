import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { exportPDF } from '../utils/pdfExport';
import { useAuth } from '../context/AuthContext';
import { KPI_DATA, MONTHLY_DATA, DEPARTMENTS } from '../utils/data';

const DEPT_COLORS = ['#16a34a', '#1d4ed8', '#f59e0b', '#8b5cf6'];

const fmt   = (v) => 'R$ ' + v.toLocaleString('pt-BR');
const total = DEPARTMENTS.reduce((s, d) => s + d.value, 0);

const cardClass    = 'bg-white rounded-xl pt-5 px-5 pb-4 shadow-card';
const thClass      = 'pb-2.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.05em] border-b border-slate-100';
const thRightClass = `${thClass} !text-right`;
const tdClass      = 'py-2.5 text-[13px] text-gray-700 border-b border-slate-50';
const tdRightClass = `${tdClass} text-right font-mono`;

const CustomTooltip = ({ active, payload, label }) => {
  if(!active || !payload?.length) return null
  
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3.5">
      <div className="text-xs text-slate-400 mb-1.5">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="text-xs mb-0.5" style={{ color: p.color }}>
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
    <div className="flex-1 min-h-0 p-7 overflow-y-auto">
      {isViewer && (
        <div className="mb-6 py-3.5 px-[18px] bg-yellow-100 border border-yellow-300 rounded-[10px] text-[13px] text-yellow-900 animate-fade-in">
          ℹ️ Você está em modo <strong>Visualizador</strong>. Apenas métricas básicas estão disponíveis.
        </div>
      )}

      {!isViewer && (
        <div className="flex mb-4">
          <button
            onClick={exportPDF}
            className="ml-auto flex items-center gap-2 py-2.5 px-[18px] bg-slate-900 text-white rounded-lg font-semibold text-[13px] cursor-pointer transition-colors hover:bg-slate-800"
          >
            ⬇ Exportar Relatório PDF
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 mb-6 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
        <KpiCard label="Receita Mensal"   value={fmt(KPI_DATA.receita)}   color="#16a34a" accent="#16a34a" trend={`+${KPI_DATA.receitaTrend}% vs mês ant.`} positive />
        <KpiCard label="Despesas Mensais" value={fmt(KPI_DATA.despesas)}  color="#dc2626" accent="#dc2626" trend={`${KPI_DATA.custosTrend}% vs mês ant.`} positive />
        {!isViewer && <>
          <KpiCard label="Lucro Líquido"   value={fmt(KPI_DATA.lucro)}     color="#1d4ed8" accent="#1d4ed8" />
          <KpiCard label="Margem de Lucro" value={`${KPI_DATA.margem}%`}   color="#7c3aed" accent="#7c3aed" />
        </>}
      </div>

      {!isViewer && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`${cardClass} animate-fade-in`}>
              <div className="text-[13px] font-bold text-slate-900 mb-4">Receitas × Despesas × Lucro (últimos 6 meses)</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={MONTHLY_DATA} barGap={2} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => 'R$' + (v / 1000) + 'k'} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="receita"  name="Receita"  fill="#16a34a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" name="Despesas" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lucro"    name="Lucro"    fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={`${cardClass} animate-fade-in`}>
              <div className="text-[13px] font-bold text-slate-900 mb-4">Evolução Mensal — Receita e Lucro</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={MONTHLY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => 'R$' + (v / 1000) + 'k'} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="receita" name="Receita" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4, fill: '#16a34a' }} />
                  <Line type="monotone" dataKey="lucro"   name="Lucro"   stroke="#1d4ed8" strokeWidth={2.5} dot={{ r: 4, fill: '#1d4ed8' }} strokeDasharray="5 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`${cardClass} animate-fade-in`}>
            <div className="text-[13px] font-bold text-slate-900 mb-4">Custos por Departamento</div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={thClass}>Departamento</th>
                  <th className={thRightClass}>Custo</th>
                  <th className={thRightClass}>% do Total</th>
                  <th className={thClass}>Distribuição</th>
                </tr>
              </thead>
              <tbody>
                {DEPARTMENTS.map((dept, i) => {
                  const pct = ((dept.value / total) * 100).toFixed(1)
                  return (
                    <tr key={dept.name}>
                      <td className={tdClass}>
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-block w-2.5 h-2.5 rounded-[3px]" style={{ background: DEPT_COLORS[i] }} />
                          {dept.name}
                        </span>
                      </td>
                      <td className={tdRightClass}>{fmt(dept.value)}</td>
                      <td className={`${tdRightClass} !text-slate-500`}>{pct}%</td>
                      <td className={tdClass}>
                        <div className="bg-slate-100 rounded-[3px] h-1.5 w-[140px]">
                          <div
                            className="h-1.5 rounded-[3px] mt-1 max-w-full"
                            style={{ width: `${pct}%`, background: DEPT_COLORS[i] }}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
                <tr>
                  <td className={`${tdClass} font-bold !text-slate-900`}>Total</td>
                  <td className={`${tdRightClass} font-bold !text-slate-900`}>{fmt(total)}</td>
                  <td className={`${tdRightClass} font-bold !text-slate-900`}>100%</td>
                  <td className={tdClass} />
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
    <div
      className={`${cardClass} border-t-[3px] animate-fade-in`}
      style={{ borderTopColor: accent }}
    >
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.06em] mb-2">{label}</div>
      <div className="text-[26px] font-bold font-mono leading-none" style={{ color }}>{value}</div>
      {trend && (
        <div className={[
          'inline-flex items-center gap-1 mt-2.5 text-xs font-semibold py-0.5 px-2 rounded-full',
          positive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600',
        ].join(' ')}>
          {positive !== undefined ? (positive ? '↑' : '↓') : ''} {trend}
        </div>
      )}
    </div>
  )
}
