import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle, Ban, CheckCircle2, ChevronDown, CircleDollarSign,
  Clock, Download, Eye, FileText, Filter, MoreVertical, Pencil, Plus,
  RefreshCw, TrendingDown, TrendingUp, X, XCircle,
} from 'lucide-react';
import {
  getReceivables, createReceivable, updateReceivable,
  deleteReceivable, registerPayment, computeReceivableStatus,
  RECEIVABLE_CLIENTS,
} from '../utils/data';

// -------- Helpers --------

const todayStr = () => new Date().toISOString().slice(0, 10);

const fmt = (v) =>
  'R$ ' + (isNaN(v) ? 0 : Number(v)).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

const fmtDate = (str) =>
  str ? new Date(str + 'T00:00:00').toLocaleDateString('pt-BR') : '—';

const daysUntilDue = (dueDate) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due   = new Date(dueDate + 'T00:00:00');
  return Math.round((due - today) / 86400000);
};

// -------- Style tokens (consistent with Dashboard / CashFlow / Users) --------

const cardClass  = 'bg-white rounded-xl py-5 px-5 mt-1 flex flex-col gap-2 shadow-card';
const thClass    = 'py-3 px-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.05em] bg-slate-50 border-b border-slate-200';
const tdClass    = 'py-3 px-4 text-[13px] text-text/80 border-b border-slate-50 align-middle';
const fieldClass = 'w-full py-[9px] px-3 border-[1.5px] border-slate-200 rounded-[7px] text-[13px] outline-none text-text/80 bg-slate-50 transition-colors focus:border-primary';
const labelClass = 'block text-xs font-semibold text-gray-700 mb-[5px]';

const STATUS_MAP = {
  paid:    { label: 'Pago',     badge: 'bg-green-100/30 text-green-700 border border-green-200',   icon: CheckCircle2,   accent: '#1B9D46' },
  pending: { label: 'Pendente', badge: 'bg-yellow-50/30 text-yellow-700 border border-yellow-200', icon: Clock,          accent: '#F0992D' },
  overdue: { label: 'Atrasado', badge: 'bg-red-100/30 text-red-600 border border-red-200',         icon: AlertTriangle,  accent: '#D71D2D' },
};

const METHODS = ['transferência', 'cartão', 'dinheiro', 'pix'];

// -------- Sub-components --------

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold py-0.5 px-2 rounded-full ${s.badge}`}>
      <Icon size={11} /> {s.label}
    </span>
  );
};

const SummaryCard = ({ label, value, accent, icon: Icon, sub }) => (
  <div
    className={`${cardClass} border-t-[3px] animate-fade-in transition-transform duration-200 ease-out hover:-translate-y-1`}
    style={{ borderTopColor: accent }}
  >
    <div className="flex items-start justify-between">
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.06em]">{label}</div>
      <Icon size={18} style={{ color: accent }} className="opacity-60" />
    </div>
    <div className="text-[24px] font-extrabold leading-none mt-1" style={{ color: accent }}>{value}</div>
    {sub && <div className="text-[12px] text-slate-400 font-medium">{sub}</div>}
  </div>
);

const ModalWrapper = ({ onClose, children }) => (
  <div
    onClick={e => e.target === e.currentTarget && onClose()}
    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
  >
    <div className="w-full max-w-[480px] bg-white rounded-[14px] pt-7 px-7 pb-6 shadow-modal animate-fade-in max-h-[90vh] overflow-y-auto">
      {children}
    </div>
  </div>
);

const ModalHeader = ({ title, onClose }) => (
  <div className="flex items-center justify-between mb-5">
    <div className="text-xl font-bold text-text/80">{title}</div>
    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={20} /></button>
  </div>
);

const FormField = ({ label, required, children }) => (
  <div>
    <label className={labelClass}>{label}{required && ' *'}</label>
    {children}
  </div>
);

const ErrBox = ({ msg }) =>
  msg ? <div className="text-xs text-red-600 mb-3 bg-red-50 py-2 px-3 rounded-md">⚠ {msg}</div> : null;

const BtnRow = ({ onCancel, onConfirm, confirmLabel, loading, confirmClass = 'bg-green-600 hover:bg-green-700' }) => (
  <div className="flex gap-2.5 mt-6">
    <button onClick={onCancel} className="py-[9px] px-[18px] bg-slate-50 border border-slate-200 rounded-[7px] text-[13px] text-gray-700 cursor-pointer hover:bg-slate-200 w-full">
      Cancelar
    </button>
    <button
      onClick={onConfirm}
      disabled={loading}
      className={`py-[9px] px-[18px] ${confirmClass} rounded-[7px] text-[13px] text-white font-medium cursor-pointer flex items-center justify-center gap-2 w-full disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      {loading ? <><RefreshCw size={14} className="animate-spin" /> Aguarde...</> : confirmLabel}
    </button>
  </div>
);

// -------- Row actions dropdown --------

const MENU_WIDTH = 210;
const MENU_GAP   = 6;

const RowActionsMenu = ({ onView, onEdit, onPay, onCancel, canEdit, canPay, canCancel }) => {
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState({ top: 0, left: 0 });
  const btnRef  = useRef(null);
  const menuRef = useRef(null);

  const hasMoreOptions = canEdit || canPay || canCancel;

  const computePosition = () => {
    if(!btnRef.current) return;

    const rect = btnRef.current.getBoundingClientRect();
    const left = Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8));
    const top  = rect.bottom + MENU_GAP;
    setPos({ top, left });
  };

  const toggle = () => {
    if(!open) computePosition();
    setOpen(v => !v);
  };

  useEffect(() => {
    if(!open) return;

    const handleClickOutside = (e) => {
      if(menuRef.current?.contains(e.target)) return;
      if(btnRef.current?.contains(e.target))  return;
      setOpen(false);
    };
    const handleEscape    = (e) => { if(e.key === 'Escape') setOpen(false) };
    const handleViewport  = ()  => setOpen(false);

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown',   handleEscape);
    window.addEventListener('resize',      handleViewport);
    window.addEventListener('scroll',      handleViewport, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown',   handleEscape);
      window.removeEventListener('resize',      handleViewport);
      window.removeEventListener('scroll',      handleViewport, true);
    };
  }, [open]);

  const runAndClose = (fn) => () => { setOpen(false); fn() };

  const itemBase = 'w-full flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-medium cursor-pointer transition-colors text-left';

  return (
    <div className="flex justify-end items-center gap-1">
      <button
        title="Ver detalhes"
        onClick={onView}
        className="p-[8px] rounded-md bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors"
      >
        <Eye size={13} />
      </button>

      {hasMoreOptions && (
        <>
          <button
            ref={btnRef}
            onClick={toggle}
            title="Mais opções"
            aria-haspopup="menu"
            aria-expanded={open}
            className={`p-[8px] z-50 rounded-md border cursor-pointer transition-colors ${
              open
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-slate-50 border-slate-200 text-gray-600 hover:bg-slate-200'
            }`}
          >
            <MoreVertical size={13} />
          </button>

          {/* Renderização do menu usando React Portal */}
          {open && createPortal(
            <div
              ref={menuRef}
              role="menu"
              style={{ top: pos.top, left: pos.left, width: MENU_WIDTH }}
              className="fixed z-[9999] bg-white border border-slate-200 rounded-lg shadow-lg py-1 animate-fade-in"
            >
              {canEdit && (
                <button
                  role="menuitem"
                  onClick={runAndClose(onEdit)}
                  className={`${itemBase} text-text/80 hover:bg-slate-50`}
                >
                  <Pencil size={13} className="text-slate-500" /> Editar
                </button>
              )}
              {canPay && (
                <button
                  role="menuitem"
                  onClick={runAndClose(onPay)}
                  className={`${itemBase} text-blue-700 hover:bg-blue-50`}
                >
                  <CircleDollarSign size={13} /> Registrar pagamento
                </button>
              )}
              {canCancel && (
                <button
                  role="menuitem"
                  onClick={runAndClose(onCancel)}
                  className={`${itemBase} text-red-600 hover:bg-red-50`}
                >
                  <Ban size={13} /> Cancelar conta
                </button>
              )}
            </div>,
            document.body 
          )}
        </>
      )}
    </div>
  );
};

// -------- Modals --------

function CreateModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    client: RECEIVABLE_CLIENTS[0],
    origin: '',
    totalValue: '',
    dueDate: '',
    installments: '1',
    observation: '',
  });
  const [err,  setErr]  = useState('');
  const [busy, setBusy] = useState(false);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    if (!form.client)                      return 'Cliente é obrigatório.';
    if (!form.totalValue || Number(form.totalValue) <= 0) return 'Valor deve ser maior que zero.';
    if (!form.dueDate)                     return 'Data de vencimento é obrigatória.';
    if (form.dueDate < todayStr())         return 'Data de vencimento não pode ser no passado.';
    if (Number(form.installments) < 1)     return 'Número de parcelas inválido.';
    return null;
  };

  const handleSave = async () => {
    const e = validate();
    if (e) { setErr(e); return; }
    setBusy(true);
    await new Promise(r => setTimeout(r, 400));
    onSave(form);
    setBusy(false);
  };

  const isInstallment = Number(form.installments) > 1;

  return (
    <ModalWrapper onClose={onClose}>
      <ModalHeader title="Nova Conta a Receber" onClose={onClose} />
      <ErrBox msg={err} />
      <div className="space-y-4">
        <FormField label="Cliente" required>
          <select value={form.client} onChange={e => f('client', e.target.value)} className={`${fieldClass} cursor-pointer`}>
            {RECEIVABLE_CLIENTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>

        <FormField label="Origem da venda (opcional)">
          <input value={form.origin} placeholder="Ex: Pedido #1099, NF-e 4210" onChange={e => f('origin', e.target.value)} className={fieldClass} />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Valor total" required>
            <input type="number" min="0.01" step="0.01" value={form.totalValue} placeholder="0,00" onChange={e => f('totalValue', e.target.value)} className={fieldClass} />
          </FormField>
          <FormField label="Vencimento" required>
            <input type="date" value={form.dueDate} min={todayStr()} onChange={e => f('dueDate', e.target.value)} className={fieldClass} />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Parcelas">
            <input type="number" min="1" max="60" value={form.installments} onChange={e => f('installments', e.target.value)} className={fieldClass} />
          </FormField>
          <div className="flex items-end pb-[1px]">
            {isInstallment && (
              <div className="text-[12px] text-slate-500 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 w-full">
                {form.installments}× de {form.totalValue ? fmt(Number(form.totalValue) / Number(form.installments)) : '—'}
              </div>
            )}
          </div>
        </div>

        <FormField label="Observação">
          <textarea value={form.observation} placeholder="Informações adicionais..." rows={2} onChange={e => f('observation', e.target.value)} className={`${fieldClass} resize-none`} />
        </FormField>
      </div>
      <BtnRow onCancel={onClose} onConfirm={handleSave} confirmLabel={<><Plus size={14} /> Criar conta{isInstallment ? `s (${form.installments}×)` : ''}</>} loading={busy} />
    </ModalWrapper>
  );
}

function EditModal({ receivable, onClose, onSave }) {
  const [form, setForm] = useState({
    client:     receivable.client,
    origin:     receivable.origin || '',
    totalValue: String(receivable.totalValue),
    dueDate:    receivable.dueDate,
    observation: receivable.observation || '',
  });
  const [err, setErr] = useState('');

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    if (!form.client)                         return 'Cliente é obrigatório.';
    if (!form.totalValue || Number(form.totalValue) <= 0) return 'Valor deve ser maior que zero.';
    if (!form.dueDate)                        return 'Data de vencimento é obrigatória.';
    return null;
  };

  const handleSave = () => {
    const e = validate();
    if (e) { setErr(e); return; }
    onSave({ ...form, totalValue: Number(form.totalValue) });
  };

  return (
    <ModalWrapper onClose={onClose}>
      <ModalHeader title="Editar Conta a Receber" onClose={onClose} />
      <ErrBox msg={err} />
      <div className="space-y-4">
        <FormField label="Cliente" required>
          <select value={form.client} onChange={e => f('client', e.target.value)} className={`${fieldClass} cursor-pointer`}>
            {RECEIVABLE_CLIENTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField label="Origem da venda">
          <input value={form.origin} onChange={e => f('origin', e.target.value)} className={fieldClass} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Valor total" required>
            <input type="number" min="0.01" step="0.01" value={form.totalValue} onChange={e => f('totalValue', e.target.value)} className={fieldClass} />
          </FormField>
          <FormField label="Vencimento" required>
            <input type="date" value={form.dueDate} onChange={e => f('dueDate', e.target.value)} className={fieldClass} />
          </FormField>
        </div>
        <FormField label="Observação">
          <textarea value={form.observation} rows={2} onChange={e => f('observation', e.target.value)} className={`${fieldClass} resize-none`} />
        </FormField>
      </div>
      <BtnRow onCancel={onClose} onConfirm={handleSave} confirmLabel={<><Pencil size={14} /> Salvar alterações</>} />
    </ModalWrapper>
  );
}

function PaymentModal({ receivable, onClose, onSave }) {
  const balance = (Number(receivable.totalValue) || 0) - (Number(receivable.paidValue) || 0);
  const [form, setForm] = useState({ amount: String(balance.toFixed(2)), date: todayStr(), method: 'transferência' });
  const [err, setErr]   = useState('');
  const [busy, setBusy] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    const amt = Number(form.amount);
    if (!amt || amt <= 0) { setErr('Valor deve ser maior que zero.'); return; }
    if (amt > balance)    { setErr('Valor não pode ultrapassar o saldo restante (' + fmt(balance) + ').'); return; }
    if (!form.date)       { setErr('Data é obrigatória.'); return; }
    setBusy(true);
    await new Promise(r => setTimeout(r, 400));
    onSave(form);
    setBusy(false);
  };

  return (
    <ModalWrapper onClose={onClose}>
      <ModalHeader title="Registrar Pagamento" onClose={onClose} />
      <div className="bg-slate-50 rounded-lg px-4 py-3 mb-4 text-[13px]">
        <div className="text-slate-500 mb-1 font-medium">{receivable.client}</div>
        <div className="flex gap-6">
          <span className="text-slate-400">Total: <strong className="text-text/80">{fmt(receivable.totalValue)}</strong></span>
          <span className="text-slate-400">Saldo: <strong className="text-amber-600">{fmt(balance)}</strong></span>
        </div>
      </div>
      <ErrBox msg={err} />
      <div className="space-y-4">
        <FormField label="Valor pago" required>
          <input type="number" min="0.01" step="0.01" max={balance} value={form.amount} onChange={e => f('amount', e.target.value)} className={fieldClass} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Data" required>
            <input type="date" value={form.date} max={todayStr()} onChange={e => f('date', e.target.value)} className={fieldClass} />
          </FormField>
          <FormField label="Método">
            <select value={form.method} onChange={e => f('method', e.target.value)} className={`${fieldClass} cursor-pointer`}>
              {METHODS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
            </select>
          </FormField>
        </div>
      </div>
      <BtnRow onCancel={onClose} onConfirm={handleSave} confirmLabel={<><CircleDollarSign size={14} /> Registrar pagamento</>} loading={busy} confirmClass="bg-blue-900 hover:bg-blue-800" />
    </ModalWrapper>
  );
}

function DetailsModal({ receivable, onClose, onPay, onEdit }) {
  const status  = computeReceivableStatus(receivable);
  const balance = (Number(receivable.totalValue) || 0) - (Number(receivable.paidValue) || 0);
  const days    = daysUntilDue(receivable.dueDate);
  const pct     = Math.min(100, ((Number(receivable.paidValue) || 0) / (Number(receivable.totalValue) || 1)) * 100);

  return (
    <ModalWrapper onClose={onClose}>
      <ModalHeader title="Detalhes da Conta" onClose={onClose} />

      {/* Status + progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <StatusBadge status={status} />
          <span className="text-[12px] font-semibold text-slate-500">{pct.toFixed(0)}% pago</span>
        </div>
        <div className="bg-slate-100 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: STATUS_MAP[status]?.accent || '#1B9D46' }}
          />
        </div>
      </div>

      {/* Info grid */}
      <div className="space-y-2.5 mb-4">
        {[
          ['Cliente',       receivable.client],
          ['Origem',        receivable.origin || '—'],
          ['Emissão',       fmtDate(receivable.issueDate)],
          ['Vencimento',    fmtDate(receivable.dueDate)],
          ['Valor total',   fmt(receivable.totalValue)],
          ['Valor pago',    fmt(receivable.paidValue)],
          ['Saldo restante', fmt(balance)],
        ].map(([label, val]) => (
          <div key={label} className="flex justify-between text-[13px] border-b border-slate-50 pb-2">
            <span className="text-slate-400 font-medium">{label}</span>
            <span className="text-text/80 font-semibold">{val}</span>
          </div>
        ))}
        {status !== 'paid' && (
          <div className="flex justify-between text-[13px] border-b border-slate-50 pb-2">
            <span className="text-slate-400 font-medium">Prazo</span>
            <span className={`font-semibold text-[12px] py-0.5 px-2 rounded-full ${days < 0 ? 'bg-red-100 text-red-600' : days <= 5 ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
              {days < 0 ? `${Math.abs(days)} dias em atraso` : days === 0 ? 'Vence hoje' : `${days} dias restantes`}
            </span>
          </div>
        )}
      </div>

      {/* Observation */}
      {receivable.observation && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-slate-400 mb-1">Observação</div>
          <div className="text-[12px] text-text/70 bg-slate-50 rounded-lg p-2.5">{receivable.observation}</div>
        </div>
      )}

      {/* Payment timeline */}
      {receivable.payments?.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Histórico de pagamentos</div>
          <div className="space-y-2">
            {receivable.payments.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                <CheckCircle2 size={14} className="text-green-600 flex-shrink-0" />
                <div className="flex-1 text-[12px]">
                  <span className="font-semibold text-green-700">{fmt(p.amount)}</span>
                  <span className="text-slate-400 mx-2">·</span>
                  <span className="text-slate-500">{fmtDate(p.date)}</span>
                  <span className="text-slate-400 mx-2">·</span>
                  <span className="text-slate-500 capitalize">{p.method}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2.5 mt-4">
        <button onClick={onClose} className="py-[9px] px-[18px] bg-slate-50 border border-slate-200 rounded-[7px] text-[13px] text-gray-700 cursor-pointer hover:bg-slate-200 flex-1">
          Fechar
        </button>
        {status !== 'paid' && (
          <>
            <button onClick={onEdit} className="py-[9px] px-[18px] bg-slate-100 border border-slate-300 rounded-[7px] text-[13px] text-gray-700 font-medium cursor-pointer hover:bg-slate-200 flex items-center gap-1.5">
              <Pencil size={13} /> Editar
            </button>
            <button onClick={onPay} className="py-[9px] px-[18px] bg-blue-900 rounded-[7px] text-[13px] text-white font-medium cursor-pointer hover:bg-blue-800 flex items-center gap-1.5 flex-1">
              <CircleDollarSign size={14} /> Pagar
            </button>
          </>
        )}
      </div>
    </ModalWrapper>
  );
}

function CancelModal({ receivable, onClose, onConfirm }) {
  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 flex-shrink-0">
          <XCircle size={20} className="text-red-500" />
        </div>
        <div className="text-lg font-bold text-text/80">Cancelar conta a receber?</div>
      </div>
      <p className="text-[13px] text-slate-500 mb-2">Você está prestes a cancelar:</p>
      <p className="text-[14px] font-semibold text-text/80 mb-4 bg-slate-50 rounded-lg py-2.5 px-3">
        {receivable.client} — {fmt(receivable.totalValue)}
      </p>
      <p className="text-[12px] text-red-500 mb-5">Esta ação não pode ser desfeita.</p>
      <div className="flex gap-2.5">
        <button onClick={onClose} className="py-[9px] px-[18px] bg-slate-50 border border-slate-200 rounded-[7px] text-[13px] text-gray-700 cursor-pointer hover:bg-slate-200 w-full">
          Voltar
        </button>
        <button onClick={onConfirm} className="py-[9px] px-[18px] bg-red-600 rounded-[7px] text-[13px] text-white font-semibold cursor-pointer hover:bg-red-700 flex items-center justify-center gap-2 w-full">
          <Ban size={14} /> Cancelar conta
        </button>
      </div>
    </ModalWrapper>
  );
}

// -------- Main Component --------

export default function ReceivablesPage() {
  const [list,      setList]      = useState([]);
  const [modal,     setModal]     = useState(null); // 'create'|'edit'|'pay'|'view'|'cancel'
  const [active,    setActive]    = useState(null);

  // Filters
  const [search,    setSearch]    = useState('');
  const [statusF,   setStatusF]   = useState('all');
  const [dateFrom,  setDateFrom]  = useState('');
  const [dateTo,    setDateTo]    = useState('');
  const [dateErr,   setDateErr]   = useState('');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => { setList(getReceivables()); }, []);

  // -------- Derived data --------

  const enriched = useMemo(() =>
    list.map(r => ({ ...r, _status: computeReceivableStatus(r) })),
  [list]);

  const filtered = useMemo(() => {
    return enriched.filter(r => {
      if (search && !r.client.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusF !== 'all' && r._status !== statusF) return false;
      if (dateFrom && r.dueDate < dateFrom) return false;
      if (dateTo   && r.dueDate > dateTo)   return false;
      return true;
    }).sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
  }, [enriched, search, statusF, dateFrom, dateTo]);

  // -------- KPIs --------

  const totalReceivable = enriched.reduce((s, r) => s + (Number(r.totalValue) || 0), 0);
  const totalOpen       = enriched.filter(r => r._status !== 'paid').reduce((s, r) => {
    return s + Math.max(0, (Number(r.totalValue) || 0) - (Number(r.paidValue) || 0));
  }, 0);
  const totalOverdue    = enriched.filter(r => r._status === 'overdue').reduce((s, r) => {
    return s + Math.max(0, (Number(r.totalValue) || 0) - (Number(r.paidValue) || 0));
  }, 0);

  const thisMonth = new Date();
  const totalReceivedMonth = enriched.reduce((s, r) => {
    return s + (r.payments || []).filter(p => {
      const d = new Date(p.date + 'T00:00:00');
      return d.getMonth() === thisMonth.getMonth() && d.getFullYear() === thisMonth.getFullYear();
    }).reduce((ps, p) => ps + (Number(p.amount) || 0), 0);
  }, 0);

  const overdueCount = enriched.filter(r => r._status === 'overdue').length;
  const defaultRate  = enriched.length > 0 ? ((overdueCount / enriched.length) * 100).toFixed(1) : '0.0';

  // Alert: due within 5 days
  const dueSoon = enriched.filter(r => {
    if (r._status !== 'pending') return false;
    const d = daysUntilDue(r.dueDate);
    return d >= 0 && d <= 5;
  });

  // -------- Handlers --------

  const closeModal = () => { setModal(null); setActive(null); };

  const handleCreate = (data) => {
    setList(createReceivable(data));
    closeModal();
  };

  const handleEdit = (data) => {
    setList(updateReceivable(active.id, data));
    closeModal();
  };

  const handlePay = (data) => {
    const { updated, error } = registerPayment(active.id, data);
    if (!error) { setList(updated); closeModal(); }
  };

  const handleCancel = () => {
    setList(deleteReceivable(active.id));
    closeModal();
  };

  const handleDateFrom = (v) => {
    setDateFrom(v);
    if (dateTo && v > dateTo) setDateErr('Data inicial não pode ser maior que a final.');
    else setDateErr('');
  };
  const handleDateTo = (v) => {
    setDateTo(v);
    if (dateFrom && v < dateFrom) setDateErr('Data final não pode ser menor que a inicial.');
    else setDateErr('');
  };

  // -------- Row action guards --------

  const canEdit   = (r) => r._status !== 'paid';
  const canCancel = (r) => (r.payments || []).length === 0;
  const canPay    = (r) => r._status !== 'paid';

  // -------- Render --------

  return (
    <div className="flex-1 min-h-0 p-7 overflow-y-auto">

      {/* -------- Alert banner -------- */}
      {dueSoon.length > 0 && (
        <div className="mb-5 py-3 px-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-3 animate-fade-in">
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
          <span className="text-[13px] text-amber-800">
            <strong>{dueSoon.length} conta{dueSoon.length > 1 ? 's' : ''}</strong> vence{dueSoon.length > 1 ? 'm' : ''} nos próximos 5 dias.{' '}
            {dueSoon.map(r => r.client).join(', ')}.
          </span>
        </div>
      )}

      {/* -------- Header -------- */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-[22px] font-extrabold text-text/80 leading-tight">Contas a Receber</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Controle de recebíveis, inadimplência e pagamentos de clientes</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowFilter(v => !v)}
            className={`flex items-center gap-2 py-2.5 px-4 border rounded-lg text-[13px] font-semibold cursor-pointer transition-colors ${showFilter ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-gray-700 hover:bg-slate-50'}`}
          >
            <Filter size={15} /> Filtros {showFilter ? <ChevronDown size={13} className="rotate-180" /> : <ChevronDown size={13} />}
          </button>
          <button
            className="flex items-center gap-2 py-2.5 px-4 bg-white border border-slate-200 text-gray-700 rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-slate-50 transition-colors"
            title="Exportar (mock)"
          >
            <Download size={15} /> Exportar
          </button>
          <button
            onClick={() => setModal('create')}
            className="flex items-center gap-2 py-2.5 px-5 bg-blue-900 text-white rounded-lg text-[13px] font-bold cursor-pointer hover:bg-blue-800 transition-colors"
          >
            <Plus size={16} /> Nova Conta a Receber
          </button>
        </div>
      </div>

      {/* -------- KPI Cards -------- */}
      <div className="grid gap-4 mb-5 grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
        <SummaryCard label="Total a Receber"    value={fmt(totalReceivable)}    accent="#047FA1" icon={FileText}       sub={`${enriched.length} contas`} />
        <SummaryCard label="Em Aberto"          value={fmt(totalOpen)}          accent="#F0992D" icon={Clock}          sub={`${enriched.filter(r => r._status !== 'paid').length} pendentes`} />
        <SummaryCard label="Em Atraso"          value={fmt(totalOverdue)}       accent="#D71D2D" icon={TrendingDown}   sub={`Inadimplência: ${defaultRate}%`} />
        <SummaryCard label="Recebido no Mês"    value={fmt(totalReceivedMonth)} accent="#1B9D46" icon={TrendingUp}     sub="pagamentos confirmados" />
      </div>

      {/* -------- Filters panel -------- */}
      {showFilter && (
        <div className="bg-white rounded-xl shadow-card px-5 py-4 mb-5 animate-fade-in">
          <div className="grid grid-cols-[1fr_auto_1fr_1fr] gap-3 items-end">
            <div>
              <label className={labelClass}>Buscar cliente</label>
              <input
                value={search}
                placeholder="Nome do cliente..."
                onChange={e => setSearch(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={statusF} onChange={e => setStatusF(e.target.value)} className={`${fieldClass} cursor-pointer`}>
                <option value="all">Todos</option>
                <option value="paid">Pago</option>
                <option value="pending">Pendente</option>
                <option value="overdue">Atrasado</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Vencimento — de</label>
              <input type="date" value={dateFrom} onChange={e => handleDateFrom(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Vencimento — até</label>
              <input type="date" value={dateTo} onChange={e => handleDateTo(e.target.value)} className={fieldClass} />
            </div>
          </div>
          {dateErr && <p className="text-[12px] text-red-500 mt-2">⚠ {dateErr}</p>}
          <div className="flex justify-end mt-3">
            <button
              onClick={() => { setSearch(''); setStatusF('all'); setDateFrom(''); setDateTo(''); setDateErr(''); }}
              className="text-[12px] text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      )}

      {/* -------- Table -------- */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div className="text-[13px] font-semibold text-slate-500">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </div>
          {overdueCount > 0 && (
            <div className="text-[12px] font-semibold text-red-600 bg-red-50/50 border border-red-200 px-3 py-1 rounded-full flex items-center gap-1.5">
              <AlertTriangle size={12} /> {overdueCount} cliente{overdueCount > 1 ? 's' : ''} inadimplente{overdueCount > 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[860px]">
            <thead>
              <tr>
                <th className={thClass}>Cliente</th>
                <th className={thClass}>Origem</th>
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
                  <td colSpan={9} className="text-center p-12 text-text/60 text-sm">
                    Nenhuma conta encontrada com os filtros aplicados.
                  </td>
                </tr>
              ) : filtered.map(r => {
                const balance = Math.max(0, (Number(r.totalValue) || 0) - (Number(r.paidValue) || 0));
                const days    = daysUntilDue(r.dueDate);
                return (
                  <tr key={r.id} className="hover:bg-primary/10 duration-300 cursor-pointer">
                    <td className={tdClass}>
                      <div className="font-semibold text-text/80">{r.client}</div>
                      {r._status === 'overdue' && (
                        <div className="text-[11px] text-red-400 font-medium">
                          {Math.abs(days)} dias em atraso
                        </div>
                      )}
                      {r._status === 'pending' && days >= 0 && days <= 5 && (
                        <div className="text-[11px] text-amber-600 font-medium">
                          Vence em {days === 0 ? 'hoje' : `${days}d`}
                        </div>
                      )}
                    </td>
                    <td className={`${tdClass} text-text/60 text-[12px]`}>{r.origin || '—'}</td>
                    <td className={`${tdClass} text-right font-semibold`}>{fmt(r.totalValue)}</td>
                    <td className={`${tdClass} text-right text-green-600 font-semibold`}>{fmt(r.paidValue)}</td>
                    <td className={`${tdClass} text-right font-bold ${balance > 0 ? (r._status === 'overdue' ? 'text-red-600' : 'text-amber-600') : 'text-slate-400'}`}>
                      {fmt(balance)}
                    </td>
                    <td className={`${tdClass} text-[12px]`}>{fmtDate(r.issueDate)}</td>
                    <td className={`${tdClass} text-[12px]`}>{fmtDate(r.dueDate)}</td>
                    <td className={tdClass}><StatusBadge status={r._status} /></td>
                    <td className={`${tdClass} whitespace-nowrap`}>
                      <RowActionsMenu
                        canPay   ={canPay(r)}
                        canEdit  ={canEdit(r)}
                        canCancel={canCancel(r)}
                        onView  ={() => { setActive(r); setModal('view') }}
                        onEdit  ={() => { setActive(r); setModal('edit') }}
                        onPay   ={() => { setActive(r); setModal('pay') }}
                        onCancel={() => { setActive(r); setModal('cancel') }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* -------- Modals -------- */}
      {modal === 'create' && (
        <CreateModal onClose={closeModal} onSave={handleCreate} />
      )}
      {modal === 'edit' && active && (
        <EditModal receivable={active} onClose={closeModal} onSave={handleEdit} />
      )}
      {modal === 'pay' && active && (
        <PaymentModal receivable={active} onClose={closeModal} onSave={handlePay} />
      )}
      {modal === 'view' && active && (
        <DetailsModal
          receivable={active}
          onClose={closeModal}
          onPay={() => setModal('pay')}
          onEdit={() => setModal('edit')}
        />
      )}
      {modal === 'cancel' && active && (
        <CancelModal receivable={active} onClose={closeModal} onConfirm={handleCancel} />
      )}
    </div>
  );
}
