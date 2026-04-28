import { useState, useEffect } from 'react'
import { getUsers, saveUsers, ROLE_LABELS, DEPT_LIST } from '../utils/data'

const ROLES = ['admin', 'gestor', 'viewer']

const s = {
  page: { padding: 28, flex: 1, overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  addBtn: {
    padding: '10px 18px', background: '#16a34a', color: '#fff',
    border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
    cursor: 'pointer', transition: 'background .2s',
  },
  card: { background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.07)', overflow: 'hidden', marginBottom: 24 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em', padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '12px 16px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f8fafc', verticalAlign: 'middle' },
  roleBadge: (role) => {
    const map = { admin: ['#dbeafe','#1d4ed8'], gestor: ['#dcfce7','#16a34a'], viewer: ['#f3f4f6','#374151'] }
    const [bg, color] = map[role] || map.viewer
    return { background: bg, color, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, display: 'inline-block' }
  },
  editBtn: {
    padding: '5px 12px', background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 6, fontSize: 12, cursor: 'pointer', marginRight: 6, color: '#374151',
    transition: 'all .15s',
  },
  delBtn: {
    padding: '5px 12px', background: '#fff', border: '1px solid #fca5a5',
    borderRadius: 6, fontSize: 12, cursor: 'pointer', color: '#dc2626',
    transition: 'all .15s',
  },
  // Modal
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: '#fff', borderRadius: 14, padding: '28px 28px 24px',
    width: '100%', maxWidth: 440, boxShadow: '0 20px 50px rgba(0,0,0,.25)',
  },
  modalTitle: { fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 20 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 },
  input: {
    width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0',
    borderRadius: 7, fontSize: 13, outline: 'none', color: '#0f172a',
    background: '#f8fafc', marginBottom: 12, transition: 'border-color .2s',
  },
  select: {
    width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0',
    borderRadius: 7, fontSize: 13, outline: 'none', color: '#0f172a',
    background: '#f8fafc', marginBottom: 12, cursor: 'pointer',
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  modalFooter: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn: {
    padding: '9px 18px', background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 7, fontSize: 13, cursor: 'pointer', color: '#374151',
  },
  saveBtn: {
    padding: '9px 18px', background: '#16a34a', border: 'none',
    borderRadius: 7, fontSize: 13, cursor: 'pointer', color: '#fff', fontWeight: 600,
  },
  errMsg: { fontSize: 12, color: '#dc2626', marginBottom: 10, background: '#fee2e2', padding: '8px 12px', borderRadius: 6 },
  avatar: (role) => {
    const colors = { admin: '#1d4ed8', gestor: '#16a34a', viewer: '#6b7280' }
    return {
      width: 32, height: 32, borderRadius: '50%', background: colors[role] || '#6b7280',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: 12, marginRight: 10,
    }
  },
  nameCell: { display: 'flex', alignItems: 'center' },
  empty: { textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: 14 },
}

const emptyForm = { name: '', email: '', password: '', role: 'viewer', department: 'TI' }

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [modal, setModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [err, setErr] = useState('')

  useEffect(() => { setUsers(getUsers()) }, [])

  const openCreate = () => { setEditUser(null); setForm(emptyForm); setErr(''); setModal(true) }
  const openEdit = (u) => { setEditUser(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, department: u.department }); setErr(''); setModal(true) }
  const close = () => setModal(false)

  const validate = () => {
    if (!form.name.trim()) return 'Nome é obrigatório.'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'E-mail inválido.'
    if (!editUser && !form.password.trim()) return 'Senha é obrigatória.'
    if (!form.role) return 'Função é obrigatória.'
    if (!form.department) return 'Departamento é obrigatório.'
    if (!editUser && users.find(u => u.email === form.email)) return 'E-mail já cadastrado.'
    return null
  }

  const save = () => {
    const e = validate()
    if (e) { setErr(e); return }
    let updated
    if (editUser) {
      updated = users.map(u => u.id === editUser.id ? { ...u, name: form.name, email: form.email, role: form.role, department: form.department, ...(form.password ? { password: form.password } : {}) } : u)
    } else {
      updated = [...users, { id: Date.now(), name: form.name, email: form.email, password: form.password, role: form.role, department: form.department }]
    }
    setUsers(updated); saveUsers(updated); close()
  }

  const del = (id) => {
    if (!confirm('Excluir este usuário?')) return
    const updated = users.filter(u => u.id !== id)
    setUsers(updated); saveUsers(updated)
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <div style={{ fontSize: 13, color: '#64748b' }}>{users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}</div>
        </div>
        <button
          style={s.addBtn}
          onClick={openCreate}
          onMouseEnter={e => e.target.style.background = '#15803d'}
          onMouseLeave={e => e.target.style.background = '#16a34a'}
        >
          + Novo Usuário
        </button>
      </div>

      <div style={s.card} className="fade-in">
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Usuário</th>
              <th style={s.th}>E-mail</th>
              <th style={s.th}>Função</th>
              <th style={s.th}>Departamento</th>
              <th style={s.th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={5} style={s.empty}>Nenhum usuário encontrado.</td></tr>
            ) : users.map(u => (
              <tr key={u.id}>
                <td style={s.td}>
                  <div style={s.nameCell}>
                    <span style={s.avatar(u.role)}>{u.name?.[0]?.toUpperCase()}</span>
                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ ...s.td, fontFamily: 'DM Mono, monospace', fontSize: 12 }}>{u.email}</td>
                <td style={s.td}><span style={s.roleBadge(u.role)}>{ROLE_LABELS[u.role]}</span></td>
                <td style={s.td}>{u.department}</td>
                <td style={s.td}>
                  <button
                    style={s.editBtn} onClick={() => openEdit(u)}
                    onMouseEnter={e => e.target.style.background = '#e2e8f0'}
                    onMouseLeave={e => e.target.style.background = '#f8fafc'}
                  >✎ Editar</button>
                  <button
                    style={s.delBtn} onClick={() => del(u.id)}
                    onMouseEnter={e => { e.target.style.background = '#fee2e2' }}
                    onMouseLeave={e => { e.target.style.background = '#fff' }}
                  >✕ Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && close()}>
          <div style={s.modal} className="fade-in">
            <div style={s.modalTitle}>{editUser ? 'Editar Usuário' : 'Novo Usuário'}</div>
            {err && <div style={s.errMsg}>⚠ {err}</div>}
            <label style={s.label}>Nome completo</label>
            <input style={s.input} value={form.name} onChange={e => f('name', e.target.value)} placeholder="João da Silva"
              onFocus={e => e.target.style.borderColor = '#16a34a'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            <div style={s.row}>
              <div>
                <label style={s.label}>E-mail</label>
                <input style={s.input} type="email" value={form.email} onChange={e => f('email', e.target.value)} placeholder="joao@empresa.com"
                  onFocus={e => e.target.style.borderColor = '#16a34a'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>
              <div>
                <label style={s.label}>Senha {editUser && <span style={{ color: '#94a3b8', fontWeight: 400 }}>(opcional)</span>}</label>
                <input style={s.input} type="password" value={form.password} onChange={e => f('password', e.target.value)} placeholder="••••••••"
                  onFocus={e => e.target.style.borderColor = '#16a34a'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>
            </div>
            <div style={s.row}>
              <div>
                <label style={s.label}>Função</label>
                <select style={s.select} value={form.role} onChange={e => f('role', e.target.value)}>
                  {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Departamento</label>
                <select style={s.select} value={form.department} onChange={e => f('department', e.target.value)}>
                  {DEPT_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.cancelBtn} onClick={close}>Cancelar</button>
              <button style={s.saveBtn} onClick={save}>{editUser ? 'Salvar alterações' : 'Criar usuário'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
