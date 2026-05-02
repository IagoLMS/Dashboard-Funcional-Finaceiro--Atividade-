import { useState, useMemo } from 'react';
import {
  AlertTriangle, Ban, CheckCircle2, ChevronDown, CircleDollarSign,
  Clock, Filter, Plus, RefreshCw, Upload, X, XCircle,
} from 'lucide-react';
import { computePayableStatus, PAYABLE_SUPPLIERS, PAYABLE_CATEGORIES, PAYABLE_ORIGINS } from '../utils/data';
import { usePayables } from '../hooks/usePayables.js';
import RowActionsMenu from '../components/RowActionsMenu';

// ---------- Helpers ----------

const todayStr = () => new Date().toISOString().slice(0, 10);

const fmt = (v) =>
  'R$ ' + (isNaN(v) ? 0 : Number(v)).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

const fmtDate = (str) =>
  str ? new Date(str + 'T00:00:00').toLocaleDateString('pt-BR') : '—';

// ---------- Style tokens (mirrors CashFlowPage / UsersPage) ----------

const cardClass   = 'bg-white rounded-xl py-5 px-5 mt-1 flex flex-col gap-2 shadow-card';
const thClass     = 'py-3 px-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.05em] bg-slate-50 border-b border-slate-200';
const tdClass     = 'py-3 px-4 text-[13px] text-text/80 border-b border-slate-50 align-middle';
const fieldClass  = 'w-full py-[9px] px-3 border-[1.5px] border-slate-200 rounded-[7px] text-[13px] outline-none text-text/80 bg-slate-50 transition-colors focus:border-primary';
const labelClass  = 'block text-xs font-semibold text-gray-700 mb-[5px]';

// ---------- Status styles ----------

const STATUS_STYLE = {
  paid:    { badge: 'bg-green-100 text-green-700 border border-green-200',   label: 'Pago',     icon: CheckCircle2  },
  pending: { badge: 'bg-yellow-50 text-yellow-700 border border-yellow-200', label: 'Pendente', icon: Clock         },
  overdue: { badge: 'bg-red-100   text-red-600   border border-red-200',     label: 'Atrasado', icon: AlertTriangle },
};

// ---------- Summary Card ----------

const SummaryCard = ({ label, value, accent, icon: Icon, sub }) => (
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
  </div>
);

// ---------- Status Badge ----------

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold py-0.5 px-2.5 rounded-full ${s.badge}`}>
      <Icon size={10} /> {s.label}
    </span>
  );
};

// ---------- Empty forms ----------

const emptyPayableForm = {
  supplier:    '',
  origin:      'Compra',
  category:    PAYABLE_CATEGORIES[0],
  totalValue:  '',
  dueDate:     '',
  installments: false,
  numInstallments: 2,
  observation: '',
};

const emptyPaymentForm = {
  amount: '',
  date:   todayStr(),
  method: 'transferência',
};

// ---------- Main Component ----------

export default function PayablesPage() {
  const { data: payables, create, update: updatePayable, remove, registerPayment: registerPayablePayment } = usePayables();
  const [modal,       setModal]       = useState(null); // null | 'create' | 'edit' | 'view' | 'payment' | 'cancel'
  const [active,      setActive]      = useState(null);
  const [form,        setForm]        = useState(emptyPayableForm);
  const [payForm,     setPayForm]     = useState(emptyPaymentForm);
  const [formErr,     setFormErr]     = useState('');
  const [payErr,      setPayErr]      = useState('');
  const [saving,      setSaving]      = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus,   setFilterStatus]   = useState('all');
  const [filterStart,    setFilterStart]    = useState('');
  const [filterEnd,      setFilterEnd]      = useState('');

  // ---------- Derived data ----------

  const enriched = useMemo(() =>
    payables.map(p => ({ ...p, status: computePayableStatus(p) }))
  , [payables]);

  const filtered = useMemo(() => {
    return enriched.filter(p => {
      if(filterSupplier && !p.supplier.toLowerCase().includes(filterSupplier.toLowerCase())) return false;
      if(filterCategory !== 'all' && p.category !== filterCategory) return false;
      if(filterStatus   !== 'all' && p.status   !== filterStatus)   return false;
      if(filterStart && p.dueDate < filterStart) return false;
      if(filterEnd   && p.dueDate > filterEnd)   return false;
      return true;
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [enriched, filterSupplier, filterCategory, filterStatus, filterStart, filterEnd]);

  // ---------- KPIs ----------

  const kpiTotal   = enriched.reduce((s, p) => s + (Number(p.totalValue) || 0), 0);
  const kpiOpen    = enriched.filter(p => p.status === 'pending').reduce((s, p) => s + ((Number(p.totalValue) || 0) - (Number(p.paidValue) || 0)), 0);
  const kpiOverdue = enriched.filter(p => p.status === 'overdue').reduce((s, p) => s + ((Number(p.totalValue) || 0) - (Number(p.paidValue) || 0)), 0);

  const now = new Date();
  const kpiPaidMonth = enriched
    .filter(p => p.status === 'paid')
    .reduce((s, p) => {
      const paid = (p.payments || []).filter(pay => {
        const d = new Date(pay.date + 'T00:00:00');
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).reduce((a, pay) => a + (Number(pay.amount) || 0), 0);
      return s + paid;
    }, 0);

  // Expiring soon (next 7 days)
  const expiringSoon = enriched.filter(p => {
    if(p.status !== 'pending') return false;
    const due = new Date(p.dueDate + 'T00:00:00');
    const diff = (due - now) / 86400000;
    return diff >= 0 && diff <= 7;
  });

  // ---------- Helpers ----------

  const f  = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const pf = (k, v) => setPayForm(prev => ({ ...prev, [k]: v }));

  const closeModal = () => { setModal(null); setActive(null); setFormErr(''); setPayErr(''); };

  const openCreate = () => {
    setForm(emptyPayableForm);
    setFormErr('');
    setModal('create');
  };

  const openEdit = (p) => {
    setActive(p);
    setForm({
      supplier:    p.supplier,
      origin:      p.origin,
      category:    p.category,
      totalValue:  p.totalValue,
      dueDate:     p.dueDate,
      installments: false,
      numInstallments: 2,
      observation: p.observation || '',
    });
    setFormErr('');
    setModal('edit');
  };

  const openView = (p) => { setActive(p); setModal('view'); };

  const openPayment = (p) => {
    setActive(p);
    setPayForm({ ...emptyPaymentForm, date: todayStr() });
    setPayErr('');
    setModal('payment');
  };

  const openCancel = (p) => { setActive(p); setModal('cancel'); };

  // ---------- Validation ----------

  const validateForm = () => {
    if(!form.supplier)            return 'Fornecedor é obrigatório.';
    if(!form.totalValue || Number(form.totalValue) <= 0) return 'Valor deve ser maior que zero.';
    if(!form.dueDate)             return 'Data de vencimento é obrigatória.';
    if(modal === 'create' && form.dueDate < todayStr()) return 'Data de vencimento não pode ser no passado.';
    if(form.installments && (Number(form.numInstallments) < 2 || Number(form.numInstallments) > 24))
      return 'Número de parcelas deve ser entre 2 e 24.';
    return null;
  };

  // ---------- Actions ----------

  const handleSave = async () => {
    const err = validateForm();
    if(err) { setFormErr(err); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));

    if(modal === 'create') {
      await create({
        supplier:     form.supplier,
        origin:       form.origin,
        category:     form.category,
        totalValue:   Number(form.totalValue),
        dueDate:      form.dueDate,
        observation:  form.observation,
        installments: form.installments ? Number(form.numInstallments) : 1,
      });
    } else {
      await updatePayable(active.id, {
        supplier:    form.supplier,
        origin:      form.origin,
        category:    form.category,
        totalValue:  Number(form.totalValue),
        dueDate:     form.dueDate,
        observation: form.observation,
      });
    }

    setSaving(false);
    closeModal();
  };

  const handleRegisterPayment = async () => {
    const amt = Number(payForm.amount);
    const bal = (Number(active.totalValue) || 0) - (Number(active.paidValue) || 0);

    if(!amt || amt <= 0) { setPayErr('Valor deve ser maior que zero.'); return; }
    if(amt > bal)        { setPayErr('Valor não pode ultrapassar o saldo restante.'); return; }
    if(!payForm.date)    { setPayErr('Data do pagamento é obrigatória.'); return; }

    setSaving(true);
    await new Promise(r => setTimeout(r, 350));

    const result = await registerPayablePayment(active.id, {
      amount: amt,
      date:   payForm.date,
      method: payForm.method,
    });
    setSaving(false);

    if(result.error) { setPayErr(result.error); return; }
    closeModal();
  };

  const handleCancel = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    await remove(active.id);
    setSaving(false);
    closeModal();
  };

  // ---------- Render ----------

  return (
    <div className="flex-1 p-7 overflow-y-auto">

      {/* Expiring soon banner */}
      {expiringSoon.length > 0 && (
        <div className="mb-5 py-3 px-4 bg-orange-50 border border-orange-300/60 rounded-[10px] text-[13px] text-orange-800 flex items-center gap-2 animate-fade-in">
          <AlertTriangle size={17} className="flex-shrink-0" />
          <span>
            <strong>{expiringSoon.length}</strong> conta{expiringSoon.length > 1 ? 's' : ''} vencendo nos próximos 7 dias —{' '}
            {expiringSoon.map(p => p.supplier).join(', ')}.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text/80 leading-tight">Contas a Pagar</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Obrigações financeiras, fornecedores e controle de vencimentos</p>
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
            <Plus size={18} /> Nova Conta a Pagar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 mb-6 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
        <SummaryCard label="Total a Pagar"  value={fmt(kpiTotal)}    accent="#047FA1" icon={CircleDollarSign} sub={`${enriched.length} contas`} />
        <SummaryCard label="Em Aberto"      value={fmt(kpiOpen)}     accent="#F0992D" icon={Clock}           sub={`${enriched.filter(p => p.status === 'pending').length} pendentes`} />
        <SummaryCard label="Atrasado"       value={fmt(kpiOverdue)}  accent="#D71D2D" icon={AlertTriangle}   sub={`${enriched.filter(p => p.status === 'overdue').length} contas`} />
        <SummaryCard label="Pago no Mês"    value={fmt(kpiPaidMonth)} accent="#1B9D46" icon={CheckCircle2}   sub={`${enriched.filter(p => p.status === 'paid').length} quitadas`} />
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-card px-5 py-4 mb-5 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className={labelClass}>Fornecedor</label>
              <input
                value={filterSupplier}
                onChange={e => setFilterSupplier(e.target.value)}
                placeholder="Buscar fornecedor..."
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Categoria</label>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={`${fieldClass} cursor-pointer`}>
                <option value="all">Todas</option>
                {PAYABLE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={`${fieldClass} cursor-pointer`}>
                <option value="all">Todos</option>
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="overdue">Atrasado</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>De</label>
                <input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Até</label>
                <input type="date" value={filterEnd} min={filterStart} onChange={e => setFilterEnd(e.target.value)} className={fieldClass} />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button
              onClick={() => { setFilterSupplier(''); setFilterCategory('all'); setFilterStatus('all'); setFilterStart(''); setFilterEnd(''); }}
              className="text-[12px] text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden mb-6 animate-fade-in">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-slate-500">{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Fornecedor</th>
                <th className={thClass}>Origem</th>
                <th className={thClass}>Categoria</th>
                <th className={`${thClass} text-right`}>Valor Total</th>
                <th className={`${thClass} text-right`}>Valor Pago</th>
                <th className={`${thClass} text-right`}>Saldo</th>
                <th className={thClass}>Emissão</th>
                <th className={thClass}>Vencimento</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center p-10 text-text/50 text-sm">
                    Nenhuma conta encontrada.
                  </td>
                </tr>
              ) : filtered.map(p => {
                const balance = (Number(p.totalValue) || 0) - (Number(p.paidValue) || 0);
                const isOverdue = p.status === 'overdue';
                const isPaid    = p.status === 'paid';
                const canEdit   = !isPaid;
                const canCancel = (p.payments || []).length === 0;

                return (
                  <tr key={p.id} className="hover:bg-primary/10 duration-300 cursor-pointer">
                    <td className={tdClass}>
                      <span className="font-semibold text-text/90">{p.supplier}</span>
                    </td>
                    <td className={tdClass}>
                      <span className="inline-block text-[11px] font-semibold py-0.5 px-2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {p.origin}
                      </span>
                    </td>
                    <td className={`${tdClass} text-text/60`}>{p.category}</td>
                    <td className={`${tdClass} text-right font-semibold`}>{fmt(p.totalValue)}</td>
                    <td className={`${tdClass} text-right text-green-600 font-semibold`}>{fmt(p.paidValue || 0)}</td>
                    <td className={`${tdClass} text-right font-bold ${isOverdue ? 'text-red-600' : isPaid ? 'text-green-600' : 'text-orange-500'}`}>
                      {fmt(balance)}
                    </td>
                    <td className={`${tdClass} text-text/50 text-[12px]`}>{fmtDate(p.issueDate)}</td>
                    <td className={`${tdClass} text-[12px] font-semibold ${isOverdue ? 'text-red-500' : 'text-text/70'}`}>
                      {fmtDate(p.dueDate)}
                      {isOverdue && <span className="ml-1 text-[10px] text-red-400">(vencida)</span>}
                    </td>
                    <td className={tdClass}>
                      <StatusBadge status={p.status} />
                    </td>
                    <td className={`${tdClass} whitespace-nowrap`}>
                      <RowActionsMenu
                        canEdit  ={canEdit}
                        canPay   ={!isPaid}
                        canCancel={canCancel}
                        onView  ={() => openView(p)}
                        onEdit  ={() => openEdit(p)}
                        onPay   ={() => openPayment(p)}
                        onCancel={() => openCancel(p)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- MODAL: Create / Edit ---------- */}
      {(modal === 'create' || modal === 'edit') && (
        <div
          onClick={e => e.target === e.currentTarget && closeModal()}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <div className="w-full max-w-[520px] bg-white rounded-[14px] pt-7 px-7 pb-6 shadow-modal animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="text-xl font-bold text-text/80">
                {modal === 'create' ? 'Nova Conta a Pagar' : 'Editar Conta'}
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            {formErr && (
              <div className="text-xs text-red-600 mb-4 bg-red-50 border border-red-100 py-2 px-3 rounded-md">⚠ {formErr}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Fornecedor *</label>
                <select value={form.supplier} onChange={e => f('supplier', e.target.value)} className={`${fieldClass} cursor-pointer`}>
                  <option value="">Selecione o fornecedor...</option>
                  {PAYABLE_SUPPLIERS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Origem *</label>
                  <select value={form.origin} onChange={e => f('origin', e.target.value)} className={`${fieldClass} cursor-pointer`}>
                    {PAYABLE_ORIGINS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Categoria de custo *</label>
                  <select value={form.category} onChange={e => f('category', e.target.value)} className={`${fieldClass} cursor-pointer`}>
                    {PAYABLE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Valor total (R$) *</label>
                  <input
                    type="number" min="0.01" step="0.01"
                    value={form.totalValue}
                    placeholder="0,00"
                    onChange={e => f('totalValue', e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Data de vencimento *</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={e => f('dueDate', e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>

              {modal === 'create' && (
                <div className="border border-slate-200 rounded-[7px] p-3 bg-slate-50">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[13px] font-semibold text-text/80">
                    <input
                      type="checkbox"
                      checked={form.installments}
                      onChange={e => f('installments', e.target.checked)}
                      className="accent-blue-800"
                    />
                    Parcelado
                  </label>
                  {form.installments && (
                    <div className="mt-2.5">
                      <label className={labelClass}>Número de parcelas</label>
                      <input
                        type="number" min="2" max="24"
                        value={form.numInstallments}
                        onChange={e => f('numInstallments', e.target.value)}
                        className={fieldClass}
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Serão geradas {form.numInstallments} contas de {fmt(Number(form.totalValue) / Number(form.numInstallments) || 0)} mensalmente.
                      </p>
                    </div>
                  )}
                </div>
              )}

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
                className="py-[9px] px-[18px] bg-green-600 rounded-[7px] text-[13px] text-white font-medium cursor-pointer hover:bg-green-700 flex items-center justify-center gap-2 w-full disabled:opacity-60"
              >
                {saving
                  ? <><RefreshCw size={14} className="animate-spin" /> Salvando...</>
                  : modal === 'create' ? <><Plus size={14} /> Criar conta</> : 'Salvar alterações'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- MODAL: Registrar Pagamento ---------- */}
      {modal === 'payment' && active && (() => {
        const balance = (Number(active.totalValue) || 0) - (Number(active.paidValue) || 0);
        return (
          <div
            onClick={e => e.target === e.currentTarget && closeModal()}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <div className="w-full max-w-[440px] bg-white rounded-[14px] pt-7 px-7 pb-6 shadow-modal animate-fade-in">
              <div className="flex items-center justify-between mb-5">
                <div className="text-xl font-bold text-text/80">Registrar Pagamento</div>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>

              <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-[13px]">
                <div className="font-semibold text-text/80">{active.supplier}</div>
                <div className="text-slate-400 text-[12px] mt-0.5">{active.category} · Vence {fmtDate(active.dueDate)}</div>
                <div className="flex justify-between mt-2 pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Saldo restante</span>
                  <span className="font-bold text-orange-600">{fmt(balance)}</span>
                </div>
              </div>

              {payErr && (
                <div className="text-xs text-red-600 mb-3 bg-red-50 border border-red-100 py-2 px-3 rounded-md">⚠ {payErr}</div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Valor pago (R$) *</label>
                    <input
                      type="number" min="0.01" step="0.01" max={balance}
                      value={payForm.amount}
                      placeholder="0,00"
                      onChange={e => pf('amount', e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Data do pagamento *</label>
                    <input type="date" value={payForm.date} onChange={e => pf('date', e.target.value)} className={fieldClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Método de pagamento</label>
                  <select value={payForm.method} onChange={e => pf('method', e.target.value)} className={`${fieldClass} cursor-pointer`}>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="transferência">Transferência</option>
                    <option value="boleto">Boleto</option>
                    <option value="cartão">Cartão</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 mt-6">
                <button onClick={closeModal} className="py-[9px] px-[18px] bg-slate-50 border border-slate-200 rounded-[7px] text-[13px] text-gray-700 cursor-pointer hover:bg-slate-200 w-full">
                  Cancelar
                </button>
                <button
                  onClick={handleRegisterPayment}
                  disabled={saving}
                  className="py-[9px] px-[18px] bg-green-600 rounded-[7px] text-[13px] text-white font-semibold cursor-pointer hover:bg-green-700 flex items-center justify-center gap-2 w-full disabled:opacity-60"
                >
                  {saving ? <><RefreshCw size={14} className="animate-spin" /> Registrando...</> : <><CircleDollarSign size={14} /> Confirmar pagamento</>}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ---------- MODAL: Detalhes ---------- */}
      {modal === 'view' && active && (() => {
        const balance = (Number(active.totalValue) || 0) - (Number(active.paidValue) || 0);
        const status  = computePayableStatus(active);
        return (
          <div
            onClick={e => e.target === e.currentTarget && closeModal()}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <div className="w-full max-w-[480px] bg-white rounded-[14px] pt-7 px-7 pb-6 shadow-modal animate-fade-in max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <div className="text-xl font-bold text-text/80">Detalhes da Conta</div>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>

              <div className="space-y-2.5 mb-5">
                {[
                  ['Fornecedor',    active.supplier],
                  ['Origem',        active.origin],
                  ['Categoria',     active.category],
                  ['Emissão',       fmtDate(active.issueDate)],
                  ['Vencimento',    fmtDate(active.dueDate)],
                ].map(([lbl, val]) => (
                  <div key={lbl} className="flex justify-between text-[13px] border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-medium">{lbl}</span>
                    <span className="text-text/80 font-semibold">{val}</span>
                  </div>
                ))}

                <div className="flex justify-between text-[13px] border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-medium">Status</span>
                  <StatusBadge status={status} />
                </div>

                <div className="flex justify-between text-[13px] border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-medium">Valor total</span>
                  <span className="font-extrabold text-[16px] text-text/80">{fmt(active.totalValue)}</span>
                </div>

                <div className="flex justify-between text-[13px] border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-medium">Valor pago</span>
                  <span className="font-bold text-green-600">{fmt(active.paidValue || 0)}</span>
                </div>

                <div className="flex justify-between text-[13px] border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-medium">Saldo restante</span>
                  <span className={`font-bold text-[15px] ${balance > 0 ? 'text-orange-500' : 'text-green-600'}`}>{fmt(balance)}</span>
                </div>

                {active.observation && (
                  <div className="pt-1">
                    <div className="text-slate-400 font-medium text-[13px] mb-1">Observação</div>
                    <div className="text-text/70 bg-slate-50 rounded-lg p-2.5 text-[12px]">{active.observation}</div>
                  </div>
                )}
              </div>

              {/* Payment history */}
              {(active.payments || []).length > 0 && (
                <div className="mt-4">
                  <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">Histórico de Pagamentos</div>
                  <div className="space-y-1.5">
                    {active.payments.map((pay, i) => (
                      <div key={pay.id || i} className="flex items-center justify-between text-[12px] bg-green-50 border border-green-100 rounded-md py-1.5 px-3">
                        <span className="text-green-700 font-medium">{fmtDate(pay.date)} · {pay.method}</span>
                        <span className="font-bold text-green-700">{fmt(pay.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2.5 mt-6">
                <button onClick={closeModal} className="py-[9px] px-[18px] bg-slate-50 border border-slate-200 rounded-[7px] text-[13px] text-gray-700 cursor-pointer hover:bg-slate-200 w-full">
                  Fechar
                </button>
                {status !== 'paid' && (
                  <button
                    onClick={() => { closeModal(); openPayment(active); }}
                    className="py-[9px] px-[18px] bg-blue-900 rounded-[7px] text-[13px] text-white font-medium cursor-pointer hover:bg-blue-800 flex items-center justify-center gap-2 w-full"
                  >
                    <CircleDollarSign size={14} /> Registrar Pagamento
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ---------- MODAL: Cancelar ---------- */}
      {modal === 'cancel' && active && (
        <div
          onClick={e => e.target === e.currentTarget && closeModal()}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <div className="w-full max-w-[400px] bg-white rounded-[14px] pt-7 px-7 pb-6 shadow-modal animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                <XCircle size={20} className="text-red-500" />
              </div>
              <div className="text-lg font-bold text-text/80">Cancelar conta?</div>
            </div>
            <p className="text-[13px] text-slate-500 mb-1">Você está prestes a cancelar:</p>
            <p className="text-[14px] font-semibold text-text/80 mb-2 bg-slate-50 rounded-lg py-2.5 px-3">
              {active.supplier} — {fmt(active.totalValue)}
            </p>
            <p className="text-[12px] text-red-500 mb-5">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2.5">
              <button onClick={closeModal} className="py-[9px] px-[18px] bg-slate-50 border border-slate-200 rounded-[7px] text-[13px] text-gray-700 cursor-pointer hover:bg-slate-200 w-full">
                Voltar
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="py-[9px] px-[18px] bg-red-600 rounded-[7px] text-[13px] text-white font-semibold cursor-pointer hover:bg-red-700 flex items-center justify-center gap-2 w-full disabled:opacity-60"
              >
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Ban size={14} />} Cancelar conta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
