import { createPortal } from 'react-dom';
import { useState, useRef, useEffect } from 'react';
import { Ban, CircleDollarSign, Eye, MoreVertical, Pencil } from 'lucide-react';

const MENU_WIDTH = 210;
const MENU_GAP   = 6;

/**
 * Dropdown de ações para linhas de tabela (Contas a Receber / Pagar / etc).
 *
 * - Botão "Ver detalhes" sempre visível.
 * - Botão "Mais opções" abre um menu (Editar, Registrar pagamento, Cancelar conta)
 *   ancorado à direita do botão e expandindo para a esquerda quando necessário.
 * - Renderizado via React Portal em `document.body` para evitar clipping
 *   por containers com `overflow-hidden` ou `overflow-x-auto`.
 */
const RowActionsMenu = (
  { onView, onEdit, onPay, onCancel, canEdit, canPay, canCancel }
) => {
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
    const handleEscape   = (e) => { if(e.key === 'Escape') setOpen(false) };
    const handleViewport = ()  => setOpen(false);

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

export default RowActionsMenu;
