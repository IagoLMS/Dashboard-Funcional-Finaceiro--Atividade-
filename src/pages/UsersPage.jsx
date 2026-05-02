import { useState, useEffect } from 'react';
import { getUsers, saveUsers, ROLE_LABELS, DEPT_LIST } from '../utils/data';
import { Plus, Users } from 'lucide-react';

const ROLES = ['admin', 'gestor', 'viewer'];

const ROLE_BADGE = {
  admin:  'bg-blue-100 text-blue-700 border border-blue-700/10',
  gestor: 'bg-green-100 text-green-600 border border-green-600/10',
  viewer: 'bg-gray-100 text-gray-700 border border-gray-700/10',
};

const ROLE_AVATAR = {
  admin:  'bg-blue-700/20 border border-blue-700/20 text-blue-700',
  gestor: 'bg-green-600/20 border border-green-600/20 text-green-600',
  viewer: 'bg-gray-500/20 border border-gray-500/20 text-gray-500',
};

const fieldClass =
  'w-full py-[9px] px-3 border-[1.5px] border-slate-200 rounded-[7px] text-[13px] outline-none ' +
  'text-text/80 bg-slate-50 mb-3 transition-colors focus:border-green-600';

const thClass =
  'py-4 px-4 text-left text-[12px] font-bold text-text/60 uppercase tracking-[0.05em] ' +
  'bg-slate-50 border-b border-slate-200';

const tdClass = 'py-4 px-4 text-[14px] text-text/80 border-b border-slate-50 align-middle';

const emptyForm = { 
  name:       '', 
  email:      '', 
  password:   '', 
  department: 'TI',
  role:       'viewer', 
};

export default function UsersPage() {
  const [users,    setUsers]    = useState([]);
  const [modal,    setModal]    = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form,     setForm]     = useState(emptyForm);
  const [err,      setErr]      = useState('');

  useEffect(() => { setUsers(getUsers()) }, []);

  const close = () => setModal(false);

  const openCreate = () => { 
    setEditUser(null); 
    setForm(emptyForm); 

    setErr(''); 
    setModal(true); 
  };

  const openEdit = (u) => {
    setEditUser(u)
    setForm({ 
      name:       u.name, 
      email:      u.email, 
      role:       u.role, 
      department: u.department,
      password:   '', 
    });
    
    setErr('');
    setModal(true);
  };

  const validate = () => {
    if(!form.name.trim()) 
      return 'Nome é obrigatório.';

    if(!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) 
      return 'E-mail inválido.';

    if(!editUser && !form.password.trim()) 
      return 'Senha é obrigatória.';

    if(!form.role) 
      return 'Função é obrigatória.';

    if(!form.department) 
      return 'Departamento é obrigatório.';

    if(!editUser && users.find(u => u.email === form.email)) 
      return 'E-mail já cadastrado.';

    return null;
  }

  const save = () => {
    const e = validate();
    if(e) { setErr(e); return }

    let updated;

    if(editUser) {
      updated = users.map(u => u.id === editUser.id
        ? { ...u, name: form.name, email: form.email, role: form.role, department: form.department, ...(form.password ? { password: form.password } : {}) }
        : u);
    } else {
      updated = [...users, { id: Date.now(), name: form.name, email: form.email, password: form.password, role: form.role, department: form.department }];
    }

    setUsers(updated); saveUsers(updated); 
    close();
  }

  const del = (id) => {
    if(!confirm('Excluir este usuário?')) return;

    const updated = users.filter(u => u.id !== id);

    setUsers(updated); 
    saveUsers(updated);
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="flex-1 p-7 overflow-y-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="text-[13px] font-medium text-text/70 px-2 rounded-md flex items-end gap-2">
            <Users size={20}/>
            {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
          </div>
        </div>
        <button
          onClick={openCreate}
          className="py-2.5 flex gap-2 items-center px-5 bg-blue-900 text-white rounded-lg font-bold text-[13px] cursor-pointer transition-colors hover:bg-blue-800"
        >
          <Plus size={20}/> Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden mb-6 animate-fade-in">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={thClass}>Usuário</th>
              <th className={thClass}>E-mail</th>
              <th className={thClass}>Função</th>
              <th className={thClass}>Departamento</th>
              <th className={thClass}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-10 text-text/80 text-sm">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : users.map(u => (
              <tr key={u.id} className='hover:bg-primary/10 duration-500 cursor-pointer'>
                <td className={tdClass}>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm mr-2.5 ${ROLE_AVATAR[u.role] || ROLE_AVATAR.viewer}`}>
                      {u.name?.[0]?.toUpperCase()}
                    </span>

                    <span className="font-semibold">{u.name}</span>
                  </div>
                </td>
                <td className={`${tdClass} text-xs`}>{u.email}</td>
                <td className={tdClass}>
                  <span className={`inline-block text-[11px] font-semibold py-0 px-2.5 rounded-full ${ROLE_BADGE[u.role] || ROLE_BADGE.viewer}`}>
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td className={tdClass}>{u.department}</td>
                <td className={tdClass}>
                  <button
                    onClick={() => openEdit(u)}
                    className="py-[5px] px-3 mr-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-gray-700 cursor-pointer transition-all hover:bg-slate-200"
                  >
                    ✎ Editar
                  </button>
                  <button
                    onClick={() => del(u.id)}
                    className="py-[5px] px-3 bg-white border border-red-300 rounded-md text-xs text-red-600 cursor-pointer transition-all hover:bg-red-100"
                  >
                    ✕ Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div
          onClick={e => e.target === e.currentTarget && close()}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <div className="w-full max-w-[440px] bg-white rounded-[14px] pt-7 px-7 pb-6 shadow-modal animate-fade-in">
            <div className="text-lg font-bold text-text/80 mb-5">
              {editUser ? 'Editar Usuário' : 'Novo Usuário'}
            </div>

            {err && (
              <div className="text-xs text-red-600 mb-2.5 bg-red-100 py-2 px-3 rounded-md">
                ⚠ {err}
              </div>
            )}

            <label className="block text-xs font-semibold text-gray-700 mb-[5px]">Nome completo</label>
            <input
              value={form.name}
              placeholder="João da Silva"
              onChange={e => f('name', e.target.value)}
              className={fieldClass}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-[5px]">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  placeholder="joao@empresa.com"
                  onChange={e => f('email', e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-[5px]">
                  Senha {editUser && <span className="text-text/80 font-normal">(opcional)</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  placeholder="••••••••"
                  onChange={e => f('password', e.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-[5px]">Função</label>
                <select
                  value={form.role}
                  onChange={e => f('role', e.target.value)}
                  className={`${fieldClass} cursor-pointer`}
                >
                  {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-[5px]">Departamento</label>
                <select
                  value={form.department}
                  onChange={e => f('department', e.target.value)}
                  className={`${fieldClass} cursor-pointer`}
                >
                  {DEPT_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-2">
              <button
                onClick={close}
                className="py-[9px] px-[18px] bg-slate-50 border border-slate-200 rounded-[7px] text-[13px] text-gray-700 cursor-pointer transition-colors hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                className="py-[9px] px-[18px] bg-green-600 rounded-[7px] text-[13px] text-white font-semibold cursor-pointer transition-colors hover:bg-green-700"
              >
                {editUser ? 'Salvar alterações' : 'Criar usuário'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
