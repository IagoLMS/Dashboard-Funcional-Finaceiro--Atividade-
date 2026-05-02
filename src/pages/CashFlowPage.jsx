import {
  ResponsiveContainer, Tooltip, XAxis, YAxis,
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart,
} from 'recharts';
import {
  ArrowDownCircle, ArrowUpCircle, BarChart2, CheckCircle2,
  ChevronDown, CircleDollarSign, Clock, Eye, Filter, Pencil,
  Plus, RefreshCw, Trash2, TrendingDown, TrendingUp, X, XCircle,
} from 'lucide-react';
import {
  deleteCashFlowEntry, CASH_FLOW_CATEGORIES,
  getCashFlow, addCashFlowEntry, updateCashFlowEntry,
} from '../utils/data';
import { useState, useMemo, useEffect } from 'react';

// ------- Helpers ------
const today = () => new Date().toISOString().slice(0, 10);

const fmt = (v) =>
  'R$ ' + (isNaN(v) ? 0 : v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

const filterByPeriod = (entries, period, customStart, customEnd) => {
  const now = new Date();
  return entries.filter(e => {
    const d = new Date(e.date + 'T00:00:00');

    if(period === 'today') return d.toDateString() === now.toDateString();
    if(period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();

    if(period === 'week') {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return d >= start;
    }

    if(period === 'custom' && customStart && customEnd) {
      const s  = new Date(customStart + 'T00:00:00');
      const en = new Date(customEnd   + 'T23:59:59');
      return d >= s && d <= en;
    }

    return true;
  });
};

// -------- Shared style tokens (same as Dashboard/UsersPage) --------

const cardClass   = 'bg-white rounded-xl py-5 px-5 mt-1 flex flex-col gap-2 shadow-card';
const thClass     = 'py-3 px-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.05em] bg-slate-50 border-b border-slate-200';
const tdClass     = 'py-3 px-4 text-[13px] text-text/80 border-b border-slate-50 align-middle';
const fieldClass  = 'w-full py-[9px] px-3 border-[1.5px] border-slate-200 rounded-[7px] text-[13px] outline-none text-text/80 bg-slate-50 transition-colors focus:border-primary';
const labelClass  = 'block text-xs font-semibold text-gray-700 mb-[5px]';

const TYPE_STYLE = {
  income:  { badge: 'bg-green-100 text-green-700 border border-green-200',  text: 'Entrada', icon: ArrowUpCircle,   color: '#1B9D46' },
  expense: { badge: 'bg-red-100   text-red-600   border border-red-200',    text: 'Saída',   icon: ArrowDownCircle, color: '#D71D2D' },
};

const STATUS_STYLE = {
  confirmed: { badge: 'bg-blue-50 text-blue-700 border border-blue-200', icon: CheckCircle2, label: 'Confirmado' },
  pending:   { badge: 'bg-yellow-50 text-yellow-700 border border-yellow-200', icon: Clock, label: 'Pendente' },
};

const PERIOD_OPTS = [
  { value: 'all',    label: 'Todos' },
  { value: 'today',  label: 'Hoje' },
  { value: 'week',   label: 'Semana' },
  { value: 'month',  label: 'Mês atual' },
  { value: 'custom', label: 'Personalizado' },
];

// -------- Sub-components --------

const CustomTooltip = ({ active, payload, label }) => {
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

const SummaryCard = ({ label, value, accent, icon: Icon, trend, positive, sub }) => (
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

const emptyForm = {
  value:       '',
  date:        today(),
  type:        'income',
  description: '',
  observation: '',
  status:      'confirmed',
  category:    CASH_FLOW_CATEGORIES[0],
};

// -------- Main Component --------

export default function CashFlowPage() {
  const [entries,     setEntries]     = useState([]);
  const [period,      setPeriod]      = useState('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd,   setCustomEnd]   = useState('');
  const [typeFilter,  setTypeFilter]  = useState('all');
  const [catFilter,   setCatFilter]   = useState('all');
  const [modal,       setModal]       = useState(null); // null | 'create' | 'edit' | 'view' | 'delete'
  const [activeEntry, setActiveEntry] = useState(null);
  const [form,        setForm]        = useState(emptyForm);
  const [formErr,     setFormErr]     = useState('');
  const [saving,      setSaving]      = useState(false);

  useEffect(() => { setEntries(getCashFlow()); }, []);

  // -------- Filtering --------

  const filtered = useMemo(() => {
    let list = filterByPeriod(entries, period, customStart, customEnd);
    if(typeFilter !== 'all') list = list.filter(e => e.type === typeFilter);
    if(catFilter  !== 'all') list = list.filter(e => e.category === catFilter);
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [entries, period, customStart, customEnd, typeFilter, catFilter]);

  // -------- KPI Calculations --------

  const totalIncome  = filtered.filter(e => e.type === 'income').reduce((s, e)  => s + (Number(e.value) || 0), 0);
  const totalExpense = filtered.filter(e => e.type === 'expense').reduce((s, e) => s + (Number(e.value) || 0), 0);
  const balance      = totalIncome - totalExpense;

  // -------- Chart data (monthly rollup from all entries) --------
  const chartData = useMemo(() => {
    const map = {};
    entries.forEach(e => {
      const d   = new Date(e.date + 'T00:00:00');
      const key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

      if(!map[key])             map[key] = { mes: key, entradas: 0, saídas: 0, saldo: 0 };
      if(e.type === 'income')   map[key].entradas += Number(e.value) || 0;
      if(e.type === 'expense')  map[key].saídas   += Number(e.value) || 0;
    });
    return Object.values(map).map(m => ({ ...m, saldo: m.entradas - m.saídas }));
  }, [entries]);

  // -------- Form helpers --------

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validateForm = () => {
    if(!form.type)     return 'Tipo é obrigatório.';
    if(!form.date)     return 'Data é obrigatória.';
    if(!form.status)   return 'Status é obrigatório.';
    if(!form.category) return 'Categoria é obrigatória.';

    if(!form.value || Number(form.value) <= 0)
      return 'Valor deve ser maior que zero.';

    if(!form.description.trim() || form.description.trim().length < 3)
      return 'Descrição deve ter pelo menos 3 caracteres.';

    return null;
  };

  const openView   = (entry) => { setActiveEntry(entry); setModal('view') };
  const openDelete = (entry) => { setActiveEntry(entry); setModal('delete') };
  const closeModal = ()      => { setModal(null); setActiveEntry(null) };

  const openCreate = () => {
    setForm(emptyForm);
    setFormErr('');
    setModal('create');
  };

  const openEdit = (entry) => {
    setActiveEntry(entry);
    setForm({
      date:        entry.date,
      type:        entry.type,
      status:      entry.status,
      category:    entry.category,
      value:       String(entry.value),
      description: entry.description,
      observation: entry.observation || '',
    });
    setFormErr('');
    setModal('edit');
  };

  const handleSave = async () => {
    const err = validateForm();
    if(err) { setFormErr(err); return }

    setSaving(true);
    await new Promise(r => setTimeout(r, 500)); // simulated loading

    const payload = {
      date:        form.date,
      type:        form.type,
      status:      form.status,
      category:    form.category,
      value:       Number(form.value),
      description: form.description.trim(),
      observation: form.observation.trim(),
    };

    if(modal === 'create') setEntries(addCashFlowEntry(payload));
    else                   setEntries(updateCashFlowEntry(activeEntry.id, payload));

    setSaving(false);
    closeModal();
  };

  const handleDelete = () => {
    setEntries(deleteCashFlowEntry(activeEntry.id));
    closeModal();
  };

  const toggleStatus = (entry) => {
    const next = entry.status === 'confirmed' ? 'pending' : 'confirmed';
    setEntries(updateCashFlowEntry(entry.id, { status: next }));
  };

  // -------- Render --------

  return (
    <div className="flex-1 min-h-0 p-7 overflow-y-auto">

      {/* -------- 1. Header -------- */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-extrabold text-text/90 leading-tight">Fluxo de Caixa</h1>
          <p className="text-[13px] text-text/50 mt-0.5">Controle de entradas e saídas financeiras</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 py-2.5 px-5 bg-blue-900 text-white rounded-lg font-bold text-[13px] cursor-pointer transition-colors hover:bg-blue-800"
        >
          <Plus size={17} /> Novo Lançamento
        </button>
      </div>

      {/* -------- Filters bar -------- */}
      <div className="flex flex-wrap gap-3 mb-6 animate-fade-in">
        {/* Period */}
        <div className="relative">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="h-9 pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-[13px] text-text/80 outline-none cursor-pointer appearance-none shadow-sm focus:border-blue-400"
          >
            {PERIOD_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {period === 'custom' && (
          <>
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
              className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-[13px] text-text/80 outline-none shadow-sm focus:border-blue-400" />
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
              className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-[13px] text-text/80 outline-none shadow-sm focus:border-blue-400" />
          </>
        )}

        {/* Type */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="h-9 pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-[13px] text-text/80 outline-none cursor-pointer appearance-none shadow-sm focus:border-blue-400"
          >
            <option value="all">Entradas + Saídas</option>
            <option value="income">Apenas Entradas</option>
            <option value="expense">Apenas Saídas</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Category */}
        <div className="relative">
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            className="h-9 pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-[13px] text-text/80 outline-none cursor-pointer appearance-none shadow-sm focus:border-blue-400"
          >
            <option value="all">Todas as categorias</option>
            {CASH_FLOW_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <div className="ml-auto flex items-center gap-1.5 text-[12px] text-slate-400">
          <Filter size={13} /> {filtered.length} lançamento{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* -------- 2. Summary cards -------- */}
      <div className="grid gap-4 mb-6 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
        <SummaryCard label="Total de Entradas"   value={fmt(totalIncome)}  accent="#1B9D46" icon={TrendingUp}        sub={`${filtered.filter(e=>e.type==='income').length} lançamentos`} />
        <SummaryCard label="Total de Saídas"     value={fmt(totalExpense)} accent="#D71D2D" icon={TrendingDown}      sub={`${filtered.filter(e=>e.type==='expense').length} lançamentos`} />
        <SummaryCard label="Saldo do Período"    value={fmt(balance)}      accent={balance >= 0 ? '#047FA1' : '#D71D2D'} icon={CircleDollarSign} positive={balance >= 0} trend={balance >= 0 ? 'Positivo' : 'Negativo'} />
        <SummaryCard label="Movimentações"       value={filtered.length}   accent="#925BEC" icon={BarChart2}         sub="no período filtrado" />
      </div>

      {/* -------- 3. Charts -------- */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`${cardClass} animate-fade-in`}>
            <div className="text-[13px] font-bold text-slate-900 mb-4">Entradas × Saídas por mês</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barGap={2} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => 'R$' + (v / 1000).toFixed(0) + 'k'} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 13 }} />
                <Bar dataKey="entradas" name="Entradas" fill="#1B9D46" radius={[4,4,0,0]} />
                <Bar dataKey="saídas"   name="Saídas"   fill="#D71D2D" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={`${cardClass} animate-fade-in`}>
            <div className="text-[13px] font-bold text-slate-900 mb-4">Evolução do Saldo</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => 'R$' + (v / 1000).toFixed(0) + 'k'} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 13 }} />
                <Line type="monotone" dataKey="saldo" name="Saldo" stroke="#047FA1" strokeWidth={2.5} dot={{ r: 4, fill: '#047FA1' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* -------- 4. Entries table -------- */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden animate-fade-in">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={thClass}>Data</th>
              <th className={thClass}>Descrição</th>
              <th className={thClass}>Categoria</th>
              <th className={thClass}>Tipo</th>
              <th className={`${thClass} text-right`}>Valor</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Origem</th>
              <th className={thClass}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-14 text-text/50 text-sm">
                  Nenhum lançamento encontrado para o período selecionado.
                </td>
              </tr>
            ) : filtered.map(entry => {
              const ts = TYPE_STYLE[entry.type]   || TYPE_STYLE.income;
              const ss = STATUS_STYLE[entry.status] || STATUS_STYLE.pending;
              const TypeIcon   = ts.icon;
              const StatusIcon = ss.icon;
              return (
                <tr key={entry.id} className="hover:bg-primary/10 duration-300 cursor-pointer">
                  <td className={`${tdClass} text-[12px] text-slate-500 whitespace-nowrap`}>
                    {new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </td>
                  <td className={`${tdClass} font-semibold max-w-[200px] truncate`}>{entry.description}</td>
                  <td className={`${tdClass} text-[12px]`}>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[11px] font-medium">
                      {entry.category}
                    </span>
                  </td>
                  <td className={tdClass}>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold py-0.5 px-2 rounded-full ${ts.badge}`}>
                      <TypeIcon size={11} /> {ts.text}
                    </span>
                  </td>
                  <td className={`${tdClass} text-right font-bold whitespace-nowrap`} style={{ color: ts.color }}>
                    {fmt(entry.value)}
                  </td>
                  <td className={tdClass}>
                    <button
                      onClick={() => toggleStatus(entry)}
                      title="Alternar status"
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold py-0.5 px-2 rounded-full cursor-pointer transition-opacity hover:opacity-70 ${ss.badge}`}
                    >
                      <StatusIcon size={11} /> {ss.label}
                    </button>
                  </td>
                  <td className={`${tdClass} text-[11px] text-slate-400`}>
                    {entry.origin === 'sistema' ? 'Sistema' : 'Manual'}
                  </td>
                  <td className={`${tdClass} whitespace-nowrap`}>
                    <div className="flex gap-1">
                      <button onClick={() => openView(entry)}
                        className="p-[8px] bg-slate-50 border border-slate-200 rounded-md text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors" title="Ver detalhes">
                        <Eye size={13} />
                      </button>
                      <button onClick={() => openEdit(entry)}
                        className="p-[8px] bg-slate-50 border border-slate-200 rounded-md text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors" title="Editar">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => openDelete(entry)}
                        className="p-[8px] bg-white border border-red-200 rounded-md text-red-500 cursor-pointer hover:bg-red-50 transition-colors" title="Excluir">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* -------- 5. Modals -------- */}

      {/* Create / Edit modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div
          onClick={e => e.target === e.currentTarget && closeModal()}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <div className="w-full max-w-[500px] bg-white rounded-[14px] pt-7 px-7 pb-6 shadow-modal animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <div className="text-xl font-bold text-text/80">
                {modal === 'create' ? 'Novo Lançamento' : 'Editar Lançamento'}
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {formErr && (
              <div className="text-xs text-red-600 mb-4 bg-red-50 py-2 px-3 rounded-md border border-red-200">
                ⚠ {formErr}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Descrição *</label>
                <input value={form.description} placeholder="Ex: Venda de produtos..." onChange={e => f('description', e.target.value)} className={fieldClass} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Valor (R$) *</label>
                  <input type="number" min="0.01" step="0.01" value={form.value} placeholder="0,00" onChange={e => f('value', e.target.value)} className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>Data *</label>
                  <input type="date" value={form.date} onChange={e => f('date', e.target.value)} className={fieldClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Tipo *</label>
                  <select value={form.type} onChange={e => f('type', e.target.value)} className={`${fieldClass} cursor-pointer`}>
                    <option value="income">Entrada</option>
                    <option value="expense">Saída</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Categoria *</label>
                  <select value={form.category} onChange={e => f('category', e.target.value)} className={`${fieldClass} cursor-pointer`}>
                    {CASH_FLOW_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Status *</label>
                <select value={form.status} onChange={e => f('status', e.target.value)} className={`${fieldClass} cursor-pointer`}>
                  <option value="confirmed">Confirmado</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Observação <span className="text-slate-400 font-normal">(opcional)</span></label>
                <textarea
                  value={form.observation}
                  placeholder="Informações adicionais..."
                  rows={2}
                  onChange={e => f('observation', e.target.value)}
                  className={`${fieldClass} resize-none`}
                />
              </div>
            </div>

            <div className="flex gap-2.5 mt-6">
              <button onClick={closeModal} className="py-[9px] px-[18px] bg-slate-50 border border-slate-200 rounded-[7px] text-[13px] text-gray-700 cursor-pointer hover:bg-slate-200 w-full">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="py-[9px] px-[18px] bg-green-600 rounded-[7px] text-[13px] text-white font-medium cursor-pointer hover:bg-green-700 flex items-center justify-center gap-2 w-full disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? <><RefreshCw size={15} className="animate-spin" /> Salvando...</> : modal === 'create' ? <><Plus size={15} /> Criar lançamento</> : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View detail modal */}
      {modal === 'view' && activeEntry && (() => {
        const ts = TYPE_STYLE[activeEntry.type]    || TYPE_STYLE.income;
        const ss = STATUS_STYLE[activeEntry.status] || STATUS_STYLE.pending;
        const TypeIcon = ts.icon;
        return (
          <div
            onClick={e => e.target === e.currentTarget && closeModal()}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <div className="w-full max-w-[440px] bg-white rounded-[14px] pt-7 px-7 pb-6 shadow-modal animate-fade-in">
              <div className="flex items-center justify-between mb-5">
                <div className="text-xl font-bold text-text/80">Detalhes do Lançamento</div>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>

              <div className="space-y-3">
                {[
                  ['Descrição',  activeEntry.description],
                  ['Data',       new Date(activeEntry.date + 'T00:00:00').toLocaleDateString('pt-BR')],
                  ['Categoria',  activeEntry.category],
                  ['Origem',     activeEntry.origin === 'sistema' ? 'Sistema' : 'Manual'],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-[13px] border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-medium">{label}</span>
                    <span className="text-text/80 font-semibold">{val}</span>
                  </div>
                ))}

                <div className="flex justify-between text-[13px] border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-medium">Tipo</span>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold py-0.5 px-2 rounded-full ${ts.badge}`}>
                    <TypeIcon size={11} /> {ts.text}
                  </span>
                </div>

                <div className="flex justify-between text-[13px] border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-medium">Valor</span>
                  <span className="font-extrabold text-[16px]" style={{ color: ts.color }}>{fmt(activeEntry.value)}</span>
                </div>

                <div className="flex justify-between text-[13px] border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-medium">Status</span>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold py-0.5 px-2 rounded-full ${ss.badge}`}>
                    {ss.label}
                  </span>
                </div>

                {activeEntry.observation && (
                  <div className="text-[13px] pt-1">
                    <div className="text-slate-400 font-medium mb-1">Observação</div>
                    <div className="text-text/70 bg-slate-50 rounded-lg p-2.5 text-[12px]">{activeEntry.observation}</div>
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 mt-6">
                <button onClick={closeModal}
                  className="py-[9px] px-[18px] bg-slate-50 border border-slate-200 rounded-[7px] text-[13px] text-gray-700 cursor-pointer hover:bg-slate-200 w-full">
                  Fechar
                </button>
                <button onClick={() => { closeModal(); openEdit(activeEntry); }}
                  className="py-[9px] px-[18px] bg-blue-900 rounded-[7px] text-[13px] text-white font-medium cursor-pointer hover:bg-blue-800 flex items-center justify-center gap-2 w-full">
                  <Pencil size={14} /> Editar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Delete confirm modal */}
      {modal === 'delete' && activeEntry && (
        <div
          onClick={e => e.target === e.currentTarget && closeModal()}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <div className="w-full max-w-[400px] bg-white rounded-[14px] pt-7 px-7 pb-6 shadow-modal animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                <XCircle size={20} className="text-red-500" />
              </div>
              <div className="text-lg font-bold text-text/80">Excluir lançamento?</div>
            </div>
            <p className="text-[13px] text-slate-500 mb-1">
              Você está prestes a excluir o lançamento:
            </p>
            <p className="text-[14px] font-semibold text-text/80 mb-6 bg-slate-50 rounded-lg py-2.5 px-3">
              "{activeEntry.description}" — {fmt(activeEntry.value)}
            </p>
            <p className="text-[12px] text-red-500 mb-5">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2.5">
              <button onClick={closeModal}
                className="py-[9px] px-[18px] bg-slate-50 border border-slate-200 rounded-[7px] text-[13px] text-gray-700 cursor-pointer hover:bg-slate-200 w-full">
                Cancelar
              </button>
              <button onClick={handleDelete}
                className="py-[9px] px-[18px] bg-red-600 rounded-[7px] text-[13px] text-white font-semibold cursor-pointer hover:bg-red-700 flex items-center justify-center gap-2 w-full">
                <Trash2 size={14} /> Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
