import { useState, useMemo, useEffect } from 'react'; // useEffect: date validation
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  AlertTriangle, Award, BarChart2, CheckCircle2, ChevronDown,
  CircleDollarSign, Filter, Layers, Plus, RefreshCw, Target,
  TrendingDown, TrendingUp, Trash2, Upload, X, XCircle,
} from 'lucide-react';
import { COST_CENTER_TYPES, PAYABLE_CATEGORIES } from '../utils/data';
import {
  computeCostCenterAnalysis,
  computeCostCentersMonthlyVariation,
} from '../utils/businessRules.js';
import { useCostCenters } from '../hooks/useCostCenters.js';
import { usePayables }    from '../hooks/usePayables.js';
import RowActionsMenu from '../components/RowActionsMenu';

// ---------- Helpers ----------

const fmt = (v) =>
  'R$ ' + (isNaN(v) ? 0 : Number(v)).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

const fmtPct = (v, digits = 1) =>
  (isNaN(v) ? 0 : Number(v)).toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits }) + '%';

const fmtDate = (str) =>
  str ? new Date(str + 'T00:00:00').toLocaleDateString('pt-BR') : '—';

// ---------- Style tokens (mesmo padrão das demais páginas) ----------

const cardClass   = 'bg-white rounded-xl py-5 px-5 mt-1 flex flex-col gap-2 shadow-card';
const thClass     = 'py-3 px-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.05em] bg-slate-50 border-b border-slate-200';
const tdClass     = 'py-3 px-4 text-[13px] text-text/80 border-b border-slate-50 align-middle';
const fieldClass  = 'w-full py-[9px] px-3 border-[1.5px] border-slate-200 rounded-[7px] text-[13px] outline-none text-text/80 bg-slate-50 transition-colors focus:border-primary';
const labelClass  = 'block text-xs font-semibold text-gray-700 mb-[5px]';

// ---------- Status visual ----------

const STATUS_STYLE = {
  within:  { badge: 'bg-green-100/30  text-green-700  border border-green-200',  label: 'Dentro do orçamento',  icon: CheckCircle2,  color: '#1B9D46' },
  warning: { badge: 'bg-yellow-50/30  text-yellow-700 border border-yellow-200', label: 'Próximo do limite',    icon: AlertTriangle, color: '#F0992D' },
  over:    { badge: 'bg-red-100/30    text-red-600    border border-red-200',    label: 'Acima do orçamento',   icon: XCircle,       color: '#D71D2D' },
};

const TYPE_STYLE = {
  operacional:    { badge: 'bg-blue-50    text-blue-700    border border-blue-200',    label: 'Operacional' },
  administrativo: { badge: 'bg-purple-50  text-purple-700  border border-purple-200',  label: 'Administrativo' },
};

const computeStatus = (currentCost, budget) => {
  if(budget <= 0) return 'within';
  const pct = currentCost / budget;
  if(pct > 1)        return 'over';
  if(pct > 0.8)      return 'warning';
  return 'within';
};

// ---------- Sub-components ----------

const SummaryCard = ({ label, value, accent, icon: Icon, sub, trend, positive }) => (
  <div
    className={`${cardClass} border-t-[3px] animate-fade-in transition-transform duration-400 ease-out hover:-translate-y-1`}
    style={{ borderTopColor: accent }}
  >
    <div className="flex items-start justify-between">
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.06em]">{label}</div>
      <Icon size={18} style={{ color: accent }} className="opacity-70" />
    </div>
    <div className="text-[24px] font-extrabold leading-none mt-1" style={{ color: accent }}>{value}</div>
    {sub && <div className="text-[12px] text-slate-400 font-medium">{sub}</div>}
    {trend && (
      <div className={[
        'inline-flex items-center gap-1 mt-1 w-fit text-xs font-semibold py-0.5 px-2 rounded-full',
        positive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-400',
      ].join(' ')}>
        {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {trend}
      </div>
    )}
  </div>
);

const StatusBadge = ({ status }) => {
  const s    = STATUS_STYLE[status] || STATUS_STYLE.within;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold py-0.5 px-2.5 rounded-full ${s.badge}`}>
      <Icon size={10} /> {s.label}
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const s = TYPE_STYLE[type] || TYPE_STYLE.operacional;
  return (
    <span className={`inline-block text-[11px] font-semibold py-0.5 px-2 rounded-full ${s.badge}`}>
      {s.label}
    </span>
  );
};

const ProgressBar = ({ percentage, status }) => {
  const s    = STATUS_STYLE[status] || STATUS_STYLE.within;
  const safe = Math.min(100, percentage * 100);
  const over = percentage > 1;
  return (
    <div className="w-full">
      <div className="bg-slate-100 rounded-full h-1.5 w-full overflow-hidden">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${safe}%`, background: s.color }}
        />
      </div>
      <div className="text-[11px] text-slate-500 font-medium mt-1">
        {fmtPct(percentage * 100)} do orçamento
        {over && <span className="text-red-500 ml-1">(estouro)</span>}
      </div>
    </div>
  );
};

const ChartTooltip = ({ active, payload, label }) => {
  if(!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg py-2.5 px-3.5 shadow-sm">
      <div className="text-xs text-slate-400 mb-2">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="text-xs font-medium mb-0.5" style={{ color: p.color }}>
          {p.name}: <strong>{fmt(p.value)}</strong>
        </div>
      ))}
    </div>
  );
};

// ---------- Empty form ----------

const emptyForm = {
  name:        '',
  type:        'operacional',
  budget:      '',
  description: '',
  categories:  [],
};

// ---------- Main component ----------

export default function CostCentersPage() {
  const { data: centers, create, update: updateCostCenter, remove } = useCostCenters();
  const { data: payables } = usePayables();
  const [modal,       setModal]       = useState(null); // null | 'create' | 'edit' | 'view' | 'delete'
  const [active,      setActive]      = useState(null);
  const [form,        setForm]        = useState(emptyForm);
  const [formErr,     setFormErr]     = useState('');
  const [saving,      setSaving]      = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filterName,   setFilterName]   = useState('');
  const [filterType,   setFilterType]   = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStart,  setFilterStart]  = useState('');
  const [filterEnd,    setFilterEnd]    = useState('');
  const [dateErr,      setDateErr]      = useState('');

  // Detail-modal transaction filters
  const [detailFilter, setDetailFilter] = useState('all');

  // Validate date range
  useEffect(() => {
    if(filterStart && filterEnd && filterStart > filterEnd) setDateErr('Data inicial não pode ser maior que a final.');
    else setDateErr('');
  }, [filterStart, filterEnd]);

  // ---------- Derived data ----------

  const enriched = useMemo(() =>
    centers.map(c => {
      const a = computeCostCenterAnalysis(c, payables) || { currentCost: 0, paidCost: 0, percentage: 0, status: 'within' };
      return {
        ...c,
        currentCost: a.currentCost,
        paidCost:    a.paidCost,
        percentage:  a.percentage,
        status:      a.status,
        difference:  a.currentCost - (Number(c.budget) || 0),
      };
    })
  , [centers, payables]);

  const filtered = useMemo(() => {
    if(dateErr) return enriched;
    return enriched.filter(c => {
      if(filterName && !c.name.toLowerCase().includes(filterName.toLowerCase())) return false;
      if(filterType   !== 'all' && c.type   !== filterType)   return false;
      if(filterStatus !== 'all' && c.status !== filterStatus) return false;
      return true;
    });
  }, [enriched, filterName, filterType, filterStatus, dateErr]);

  // ---------- KPIs ----------

  const totalCost  = enriched.reduce((s, c) => s + c.currentCost, 0);
  const totalBudget = enriched.reduce((s, c) => s + (Number(c.budget) || 0), 0);
  const biggest    = enriched.reduce(
    (max, c) => c.currentCost > max.currentCost ? c : max,
    { name: '—', currentCost: 0 }
  );
  const withinCount = enriched.filter(c => c.status === 'within').length;
  const adherence   = enriched.length > 0 ? (withinCount / enriched.length) * 100 : 0;
  const variation   = useMemo(() => computeCostCentersMonthlyVariation(centers, payables), [centers, payables]);

  // Ranking + alertas (diferenciais)
  const ranking = useMemo(() =>
    [...enriched].sort((a, b) => b.currentCost - a.currentCost).slice(0, 5)
  , [enriched]);

  const alerts = useMemo(() =>
    enriched.filter(c => c.status === 'over' || (c.status === 'warning' && c.percentage >= 0.9))
  , [enriched]);

  // ---------- Form helpers ----------

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const toggleCategory = (cat) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const closeModal = () => {
    setModal(null);
    setActive(null);
    setFormErr('');
    setDetailFilter('all');
  };

  const openCreate = () => {
    setForm(emptyForm);
    setFormErr('');
    setModal('create');
  };

  const openEdit = (c) => {
    setActive(c);
    setForm({
      name:        c.name,
      type:        c.type,
      budget:      String(c.budget),
      description: c.description || '',
      categories:  c.categories || [],
    });
    setFormErr('');
    setModal('edit');
  };

  const openView   = (c) => { setActive(c); setModal('view') };
  const openDelete = (c) => { setActive(c); setModal('delete') };

  // ---------- Validation ----------

  const validateForm = () => {
    if(!form.name.trim())              return 'Nome é obrigatório.';
    if(form.name.trim().length < 2)    return 'Nome deve ter ao menos 2 caracteres.';
    if(!form.type)                     return 'Tipo é obrigatório.';
    if(!form.budget || Number(form.budget) <= 0) return 'Orçamento deve ser maior que zero.';
    return null;
  };

  // ---------- Actions ----------

  const handleSave = async () => {
    const err = validateForm();
    if(err) { setFormErr(err); return; }

    setSaving(true);
    await new Promise(r => setTimeout(r, 400));

    const payload = {
      name:        form.name,
      type:        form.type,
      budget:      Number(form.budget),
      description: form.description,
      categories:  form.categories,
    };

    const result = modal === 'create'
      ? await create(payload)
      : await updateCostCenter(active.id, payload);

    setSaving(false);

    if(result.error) { setFormErr(result.error); return; }
    closeModal();
  };

  const handleDelete = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    const result = await remove(active.id);
    setSaving(false);

    if(result.error) { setFormErr(result.error); return; }
    closeModal();
  };

  const handleClearFilters = () => {
    setFilterName(''); setFilterType('all'); setFilterStatus('all');
    setFilterStart(''); setFilterEnd(''); setDateErr('');
  };

  // Detail analysis (recomputed when active or payables change)
  const analysis = useMemo(
    () => active ? computeCostCenterAnalysis(active, payables) : null,
    [active, payables]
  );

  const detailTransactions = useMemo(() => {
    if(!analysis) return [];
    if(detailFilter === 'all') return analysis.transactions;
    return analysis.transactions.filter(t => t.category === detailFilter);
  }, [analysis, detailFilter]);

  const exportAnalysis = () => {
    if(!analysis) return;
    const lines = [
      `Centro de Custo: ${analysis.center.name}`,
      `Tipo: ${TYPE_STYLE[analysis.center.type].label}`,
      `Orçamento: ${fmt(analysis.center.budget)}`,
      `Custo realizado: ${fmt(analysis.currentCost)}`,
      `% do orçamento: ${fmtPct(analysis.percentage * 100)}`,
      `Status: ${STATUS_STYLE[analysis.status].label}`,
      '',
      'TRANSAÇÕES VINCULADAS:',
      ...analysis.transactions.map(t =>
        `${fmtDate(t.date)} | ${t.origin} | ${t.category} | ${fmt(t.value)}`
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `analise-${analysis.center.name.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------- Render ----------

  return (
    <div className="flex-1 p-7 overflow-y-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text/80 leading-tight">Centro de Custos</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Classifique despesas por setor, acompanhe orçamento e tome decisões estratégicas</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exportação em desenvolvimento.')}
            className="flex items-center gap-2 py-2.5 px-4 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 font-medium cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <Upload size={15} /> Exportar
          </button>

          <button
            onClick={() => setShowFilters(s => !s)}
            className={[
              'flex items-center gap-2 py-2.5 px-4 border rounded-lg text-[13px] font-medium cursor-pointer transition-colors',
              showFilters
                ? 'bg-blue-900 text-white border-blue-900'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50',
            ].join(' ')}
          >
            <Filter size={15} /> Filtros <ChevronDown size={13} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 py-2.5 px-5 bg-blue-900 text-white rounded-lg font-bold text-[13px] cursor-pointer hover:bg-blue-800 transition-colors"
          >
            <Plus size={18} /> Novo Centro de Custo
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 mb-6 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        <SummaryCard
          label="Custo Total no Período"
          value={fmt(totalCost)}
          accent="#047FA1"
          icon={CircleDollarSign}
          sub={`Orçamento: ${fmt(totalBudget)}`}
        />
        <SummaryCard
          label="Maior Centro de Custo"
          value={biggest.name}
          accent="#925BEC"
          icon={Award}
          sub={fmt(biggest.currentCost)}
        />
        <SummaryCard
          label="Variação vs Mês Anterior"
          value={fmtPct(variation.variation)}
          accent={variation.variation >= 0 ? '#D71D2D' : '#1B9D46'}
          icon={variation.variation >= 0 ? TrendingUp : TrendingDown}
          trend={variation.previous > 0 ? `${fmt(variation.current)} vs ${fmt(variation.previous)}` : 'Sem dados anteriores'}
          positive={variation.variation < 0}
        />
        <SummaryCard
          label="Aderência ao Orçamento"
          value={fmtPct(adherence)}
          accent={adherence >= 80 ? '#1B9D46' : adherence >= 50 ? '#F0992D' : '#D71D2D'}
          icon={Target}
          sub={`${withinCount} de ${enriched.length} dentro do limite`}
        />
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-card px-5 py-4 mb-5 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className={labelClass}>Nome do centro</label>
              <input
                value={filterName}
                onChange={e => setFilterName(e.target.value)}
                placeholder="Buscar centro..."
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Tipo</label>
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className={`${fieldClass} cursor-pointer`}>
                <option value="all">Todos</option>
                {COST_CENTER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={`${fieldClass} cursor-pointer`}>
                <option value="all">Todos</option>
                <option value="within">Dentro do orçamento</option>
                <option value="warning">Próximo do limite</option>
                <option value="over">Acima do orçamento</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Período de</label>
                <input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Até</label>
                <input type="date" value={filterEnd} min={filterStart} onChange={e => setFilterEnd(e.target.value)} className={fieldClass} />
              </div>
            </div>
          </div>
          {dateErr && (
            <div className="text-xs text-red-600 mt-3 bg-red-50 border border-red-100 py-2 px-3 rounded-md">⚠ {dateErr}</div>
          )}
          <div className="flex justify-end mt-3">
            <button
              onClick={handleClearFilters}
              className="text-[12px] text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      )}

      {/* Banner de alertas (estouro / próximo do limite) */}
      {alerts.length > 0 && (
        <div className="mb-5 py-3 px-4 bg-orange-50/80 border border-orange-300/60 rounded-[10px] text-[13px] text-orange-800 flex items-center gap-2 animate-fade-in">
          <AlertTriangle size={17} className="flex-shrink-0" />
          <span>
            <strong>{alerts.length}</strong> centro{alerts.length > 1 ? 's' : ''} com risco de estouro de orçamento: {' '}
            {alerts.map(a => a.name).join(', ')}.
          </span>
        </div>
      )}

      {/* Tabela principal */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden mb-6 animate-fade-in">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-slate-500">{filtered.length} centro{filtered.length !== 1 ? 's' : ''} de custo</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Nome do Centro</th>
                <th className={thClass}>Tipo</th>
                <th className={`${thClass} text-right`}>Orçamento</th>
                <th className={`${thClass} text-right`}>Custo Atual</th>
                <th className={`${thClass} text-right`}>Diferença</th>
                <th className={thClass}>Aderência</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-10 text-text/50 text-sm">
                    Nenhum centro de custo encontrado.
                  </td>
                </tr>
              ) : filtered.map(c => {
                const isOver = c.status === 'over';
                const diffPct = c.budget > 0 ? (c.difference / c.budget) * 100 : 0;
                return (
                  <tr key={c.id} className="hover:bg-primary/10 duration-300 cursor-pointer">
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-blue-50 text-blue-700">
                          <Layers size={13} />
                        </span>
                        <div>
                          <div className="font-semibold text-text/90">{c.name}</div>
                          {c.description && <div className="text-[11px] text-slate-400 max-w-[280px] truncate">{c.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td className={tdClass}>
                      <TypeBadge type={c.type} />
                    </td>
                    <td className={`${tdClass} text-right font-semibold`}>{fmt(c.budget)}</td>
                    <td className={`${tdClass} text-right font-bold`} style={{ color: STATUS_STYLE[c.status].color }}>
                      {fmt(c.currentCost)}
                    </td>
                    <td className={`${tdClass} text-right font-semibold ${isOver ? 'text-red-600' : c.difference < 0 ? 'text-green-600' : 'text-orange-500'}`}>
                      {c.difference >= 0 ? '+' : ''}{fmt(c.difference)}
                      <div className="text-[11px] font-normal text-slate-400">
                        {diffPct >= 0 ? '+' : ''}{fmtPct(diffPct)}
                      </div>
                    </td>
                    <td className={`${tdClass} min-w-[140px]`}>
                      <ProgressBar percentage={c.percentage} status={c.status} />
                    </td>
                    <td className={tdClass}>
                      <StatusBadge status={c.status} />
                    </td>
                    <td className={`${tdClass} whitespace-nowrap`}>
                      <RowActionsMenu
                        canEdit  ={true}
                        canPay   ={false}
                        canCancel={true}
                        onView  ={() => openView(c)}
                        onEdit  ={() => openEdit(c)}
                        onCancel={() => openDelete(c)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ranking dos centros mais caros (diferencial) */}
      {ranking.length > 0 && (
        <div className={`${cardClass} mb-6 animate-fade-in`}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-[13px] font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={16} className="text-red-600" /> Ranking — Centros mais caros
            </div>
            <span className="text-[11px] text-slate-400">Top {ranking.length}</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ranking} barSize={80} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} interval={0} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => 'R$' + (v / 1000).toFixed(0) + 'k'} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="currentCost" name="Custo Atual" radius={[6, 6, 0, 0]}>
                {ranking.map((c, i) => (
                  <Cell key={i} fill={STATUS_STYLE[c.status].color} opacity={0.9} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ---------- MODAL: Criar / Editar ---------- */}
      {(modal === 'create' || modal === 'edit') && (
        <div
          onClick={e => e.target === e.currentTarget && closeModal()}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <div className="w-full max-w-[540px] bg-white rounded-[14px] pt-7 px-7 pb-6 shadow-modal animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="text-xl font-bold text-text/80">
                {modal === 'create' ? 'Novo Centro de Custo' : 'Editar Centro de Custo'}
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            {formErr && (
              <div className="text-xs text-red-600 mb-4 bg-red-50 border border-red-100 py-2 px-3 rounded-md">⚠ {formErr}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Nome do centro *</label>
                <input
                  value={form.name}
                  placeholder="Ex: Produção, Logística..."
                  onChange={e => f('name', e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Tipo *</label>
                  <select value={form.type} onChange={e => f('type', e.target.value)} className={`${fieldClass} cursor-pointer`}>
                    {COST_CENTER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Orçamento mensal (R$) *</label>
                  <input
                    type="number" min="0.01" step="0.01"
                    value={form.budget}
                    placeholder="0,00"
                    onChange={e => f('budget', e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Descrição <span className="text-slate-400 font-normal">(opcional)</span></label>
                <textarea
                  value={form.description}
                  placeholder="Descreva o propósito deste centro de custo..."
                  rows={2}
                  onChange={e => f('description', e.target.value)}
                  className={`${fieldClass} resize-none`}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Categorias vinculadas <span className="text-slate-400 font-normal">(custos de Contas a Pagar)</span>
                </label>
                <div className="flex flex-wrap gap-2 p-3 border-[1.5px] border-slate-200 rounded-[7px] bg-slate-50">
                  {PAYABLE_CATEGORIES.map(cat => {
                    const checked = form.categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={[
                          'text-[12px] font-semibold py-1.5 px-3 rounded-full border cursor-pointer transition-colors',
                          checked
                            ? 'bg-blue-900 text-white border-blue-900'
                            : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400',
                        ].join(' ')}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  As despesas com essas categorias serão somadas para calcular o custo realizado.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 mt-6">
              <button onClick={closeModal} className="py-[9px] px-[18px] bg-slate-50 border border-slate-200 rounded-[7px] text-[13px] text-gray-700 cursor-pointer hover:bg-slate-200 w-full">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="py-[9px] px-[18px] bg-green-600 rounded-[7px] text-[13px] text-white font-medium cursor-pointer hover:bg-green-700 flex items-center justify-center gap-2 w-full disabled:opacity-60"
              >
                {saving
                  ? <><RefreshCw size={14} className="animate-spin" /> Salvando...</>
                  : modal === 'create' ? <><Plus size={14} /> Criar centro</> : 'Salvar alterações'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- MODAL: Detalhes ---------- */}
      {modal === 'view' && active && analysis && (() => {
        const status = analysis.status;
        const planVsReal = [
          { label: 'Planejado', valor: Number(analysis.center.budget) || 0 },
          { label: 'Realizado', valor: analysis.currentCost },
        ];
        const usedCategories = (analysis.center.categories || []);
        return (
          <div
            onClick={e => e.target === e.currentTarget && closeModal()}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <div className="w-full max-w-[760px] bg-white rounded-[14px] pt-7 px-7 pb-6 shadow-modal animate-fade-in max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-xl font-bold text-text/80">{analysis.center.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <TypeBadge type={analysis.center.type} />
                    <StatusBadge status={status} />
                  </div>
                </div>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>

              {/* Informações gerais */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Orçamento</div>
                  <div className="text-[15px] font-extrabold text-text/80 mt-1">{fmt(analysis.center.budget)}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Custo Realizado</div>
                  <div className="text-[15px] font-extrabold mt-1" style={{ color: STATUS_STYLE[status].color }}>{fmt(analysis.currentCost)}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aderência</div>
                  <div className="text-[15px] font-extrabold text-text/80 mt-1">{fmtPct(analysis.percentage * 100)}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pago Efetivo</div>
                  <div className="text-[15px] font-extrabold text-green-600 mt-1">{fmt(analysis.paidCost)}</div>
                </div>
              </div>

              {analysis.center.description && (
                <div className="mb-5">
                  <div className="text-slate-400 font-medium text-[12px] mb-1">Descrição</div>
                  <div className="text-text/70 bg-slate-50 rounded-lg p-2.5 text-[12px]">{analysis.center.description}</div>
                </div>
              )}

              {/* Categorias vinculadas */}
              {usedCategories.length > 0 && (
                <div className="mb-5">
                  <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">Categorias vinculadas</div>
                  <div className="flex flex-wrap gap-1.5">
                    {usedCategories.map(cat => (
                      <span key={cat} className="text-[11px] font-semibold py-0.5 px-2 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Gráficos */}
              <div className="grid md:grid-cols-2 gap-4 mb-5">
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="text-[12px] font-bold text-slate-700 mb-3">Planejado vs Realizado</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={planVsReal}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => 'R$' + (v / 1000).toFixed(0) + 'k'} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="valor" name="Valor" radius={[4, 4, 0, 0]}>
                        <Cell fill="#047FA1" />
                        <Cell fill={STATUS_STYLE[status].color} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="text-[12px] font-bold text-slate-700 mb-3">Evolução de Custos</div>
                  {analysis.monthlyEvolution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={analysis.monthlyEvolution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => 'R$' + (v / 1000).toFixed(0) + 'k'} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="custo" name="Custo" stroke={STATUS_STYLE[status].color} strokeWidth={2.5} dot={{ r: 4, fill: STATUS_STYLE[status].color }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[180px] text-slate-400 text-[12px]">
                      <BarChart2 size={16} className="mr-1.5" /> Sem histórico de custos
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de transações vinculadas */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                    Transações Vinculadas ({analysis.transactions.length})
                  </div>
                  {usedCategories.length > 0 && (
                    <select
                      value={detailFilter}
                      onChange={e => setDetailFilter(e.target.value)}
                      className="text-[11px] py-1 px-2 border border-slate-200 rounded-md bg-white text-slate-600 cursor-pointer outline-none focus:border-blue-400"
                    >
                      <option value="all">Todas as categorias</option>
                      {usedCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  )}
                </div>

                {detailTransactions.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-[12px] bg-slate-50 rounded-lg border border-slate-100">
                    Nenhuma transação para o filtro selecionado.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-slate-100 max-h-[240px] overflow-y-auto">
                    <table className="w-full border-collapse">
                      <thead className="sticky top-0">
                        <tr>
                          <th className={thClass}>Data</th>
                          <th className={thClass}>Origem</th>
                          <th className={thClass}>Categoria</th>
                          <th className={`${thClass} text-right`}>Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailTransactions.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50 duration-200">
                            <td className={`${tdClass} text-[12px] text-slate-500`}>{fmtDate(t.date)}</td>
                            <td className={`${tdClass} font-semibold`}>{t.origin}</td>
                            <td className={tdClass}>
                              <span className="text-[11px] py-0.5 px-2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                {t.category}
                              </span>
                            </td>
                            <td className={`${tdClass} text-right font-bold text-text/80`}>{fmt(t.value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 mt-6">
                <button onClick={closeModal} className="py-[9px] px-[18px] bg-slate-50 border border-slate-200 rounded-[7px] text-[13px] text-gray-700 cursor-pointer hover:bg-slate-200 w-full">
                  Fechar
                </button>
                <button
                  onClick={exportAnalysis}
                  className="py-[9px] px-[18px] bg-white border border-slate-200 rounded-[7px] text-[13px] text-slate-700 font-medium cursor-pointer hover:bg-slate-50 flex items-center justify-center gap-2 w-full"
                >
                  <Upload size={14} /> Exportar análise
                </button>
                <button
                  onClick={() => { closeModal(); openEdit(active); }}
                  className="py-[9px] px-[18px] bg-blue-900 rounded-[7px] text-[13px] text-white font-medium cursor-pointer hover:bg-blue-800 flex items-center justify-center gap-2 w-full"
                >
                  Editar centro
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ---------- MODAL: Excluir ---------- */}
      {modal === 'delete' && active && (
        <div
          onClick={e => e.target === e.currentTarget && closeModal()}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <div className="w-full max-w-[420px] bg-white rounded-[14px] pt-7 px-7 pb-6 shadow-modal animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                <XCircle size={20} className="text-red-500" />
              </div>
              <div className="text-lg font-bold text-text/80">Excluir centro de custo?</div>
            </div>
            <p className="text-[13px] text-slate-500 mb-1">Você está prestes a excluir:</p>
            <p className="text-[14px] font-semibold text-text/80 mb-2 bg-slate-50 rounded-lg py-2.5 px-3">
              {active.name} — Orçamento {fmt(active.budget)}
            </p>

            {formErr && (
              <div className="text-xs text-red-600 mb-3 bg-red-50 border border-red-100 py-2 px-3 rounded-md">⚠ {formErr}</div>
            )}

            <p className="text-[12px] text-red-500 mb-5">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2.5">
              <button onClick={closeModal} className="py-[9px] px-[18px] bg-slate-50 border border-slate-200 rounded-[7px] text-[13px] text-gray-700 cursor-pointer hover:bg-slate-200 w-full">
                Voltar
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="py-[9px] px-[18px] bg-red-600 rounded-[7px] text-[13px] text-white font-semibold cursor-pointer hover:bg-red-700 flex items-center justify-center gap-2 w-full disabled:opacity-60"
              >
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />} Excluir centro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
