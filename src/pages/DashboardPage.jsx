import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { exportPDF } from '../utils/pdfExport';
import { useAuth } from '../context/AuthContext';
import { Download, FolderDown, FolderUp } from 'lucide-react';
import { KPI_DATA, MONTHLY_DATA, DEPARTMENTS } from '../utils/data';

const DEPT_COLORS = ['#1b9d46', '#047fa1', '#F0992D', '#925BEC'];

const fmt = (v) => 'R$ ' + v.toLocaleString('pt-BR');

const total = DEPARTMENTS.reduce((s, d) => s + d.value, 0);

const cardClass    = 'bg-white rounded-xl py-5 px-5 mt-1 flex flex-col gap-2 shadow-card';
const thClass      = 'pb-2.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.05em] border-b border-slate-100';
const thRightClass = `${thClass} !text-right`;
const tdClass      = 'py-2.5 px-1 text-[14px] text-text/70 font-semibold border-b border-slate-50';
const tdRightClass = `${tdClass} text-right`;

const CustomTooltip = ({ active, payload, label }) => {
  if(!active || !payload?.length) return null

  return (
    <div className="bg-white border border-slate-300 rounded-lg py-2.5 px-3.5">
      <div className="text-xs text-slate-400 mb-2">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="text-xs font-medium mb-0.5" style={{ color: p.color }}>
          {p.name}: <strong>R$ {p.value?.toLocaleString('pt-BR')}</strong>
        </div>
      ))}
    </div>
  )
}

const KpiCard = (
  { label, value, color, accent, trend, positive }
) => {
  return (
    <div
      className={`${cardClass} border-t-[3px] animate-fade-in transition-transform duration-200 ease-out hover:-translate-y-1`}
      style={{ borderTopColor: accent }}
    >
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.06em] mb-2">{label}</div>
      <div className="text-[26px] font-extrabold leading-none" style={{ color }}>{value}</div>
      {trend && (
        <div className={[
          'inline-flex items-center gap-1 mt-2.5 w-fit text-xs font-semibold py-0.5 px-2 rounded-full',
          positive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-400',
        ].join(' ')}>
          {positive !== undefined ? (positive ? '↑' : '↓') : ''} {trend}
        </div>
      )}
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
            title='Exportar Relatório PDF'
            onClick={exportPDF}
            className="ml-auto flex items-center gap-3 py-2.5 px-[18px] bg-slate-900 text-white rounded-lg font-semibold text-[13px] cursor-pointer transition-colors hover:bg-slate-800"
          >
            <Download size={18} /> Exportar Relatório PDF
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 mb-6 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
        <KpiCard label="Receita Mensal"   value={fmt(KPI_DATA.receita)}   color="#1B9D46" accent="#1B9D46" trend={`+${KPI_DATA.receitaTrend}% vs mês ant.`} positive />
        <KpiCard label="Despesas Mensais" value={fmt(KPI_DATA.despesas)}  color="#D71D2D" accent="#D71D2D" trend={`${KPI_DATA.custosTrend}% vs mês ant.`} positive />
        {!isViewer && <>
          <KpiCard label="Lucro Líquido"   value={fmt(KPI_DATA.lucro)}     color="#047FA1" accent="#047FA1" />
          <KpiCard label="Margem de Lucro" value={`${KPI_DATA.margem}%`}   color="#0197B2" accent="#0197B2" />
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
                  <Legend wrapperStyle={{ fontSize: 14 }} />
                  <Bar dataKey="receita"  name="Receita"  fill="#1B9D46" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" name="Despesas" fill="#D71D2D" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lucro"    name="Lucro"    fill="#047FA1" radius={[4, 4, 0, 0]} />
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
                  <Legend wrapperStyle={{ fontSize: 14 }} />
                  <Line type="monotone" dataKey="receita" name="Receita" stroke="#1B9D46" strokeWidth={2.5} dot={{ r: 4, fill: '#1B9D46' }} />
                  <Line type="monotone" dataKey="lucro"   name="Lucro"   stroke="#047FA1" strokeWidth={2.5} dot={{ r: 4, fill: '#047FA1' }} strokeDasharray="5 3" />
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
                    <tr key={dept.name} className='hover:bg-primary/10 duration-500'>
                      <td className={tdClass}>
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-block w-2.5 h-2.5 rounded-[3px]" style={{ background: DEPT_COLORS[i] }} />
                          {dept.name}
                        </span>
                      </td>
                      <td className={tdRightClass}>{fmt(dept.value)}</td>
                      <td className={`${tdRightClass} !text-text/60`}>{pct}%</td>
                      <td className={tdClass}>
                        <div className="bg-slate-100 rounded-[3px] h-1.5 w-[140px] ml-1">
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
                  <td className={`${tdClass} font-bold !text-text/80`}>Total</td>
                  <td className={`${tdRightClass} font-bold !text-text/80`}>{fmt(total)}</td>
                  <td className={`${tdRightClass} font-bold !text-text/80`}>100%</td>
                  <td className={tdClass} />
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
