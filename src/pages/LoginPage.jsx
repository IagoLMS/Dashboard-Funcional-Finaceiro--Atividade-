import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const s = {
  page: {
    minHeight: '100vh', background: '#0f172a', display: 'flex',
    alignItems: 'center', justifyContent: 'center', padding: '24px',
  },
  card: {
    background: '#fff', borderRadius: 16, padding: '48px 40px',
    width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,.3)',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32,
  },
  logoIcon: {
    width: 40, height: 40, background: '#16a34a', borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 800, fontSize: 18,
  },
  logoText: { fontSize: 20, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 },
  logoSub: { fontSize: 11, color: '#94a3b8', fontWeight: 400 },
  title: { fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 4 },
  sub: { fontSize: 14, color: '#64748b', marginBottom: 32 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: {
    width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: 8, fontSize: 14, outline: 'none', transition: 'border-color .2s',
    background: '#f8fafc', color: '#0f172a',
  },
  group: { marginBottom: 18 },
  btn: {
    width: '100%', padding: '12px', background: '#16a34a', color: '#fff',
    border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15,
    cursor: 'pointer', transition: 'background .2s', marginTop: 8,
  },
  error: {
    background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626',
    borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16,
  },
  hint: {
    marginTop: 24, padding: '14px', background: '#f8fafc', borderRadius: 8,
    border: '1px solid #e2e8f0',
  },
  hintTitle: { fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 },
  hintRow: { fontSize: 12, color: '#475569', marginBottom: 4, fontFamily: 'DM Mono, monospace' },
  badge: { display: 'inline-block', fontSize: 10, background: '#dbeafe', color: '#1d4ed8', borderRadius: 4, padding: '1px 6px', marginLeft: 6, fontFamily: 'DM Sans, sans-serif' },
}

export default function LoginPage({ onLogin }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Preencha todos os campos.'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const ok = login(email, password)
    setLoading(false)
    if (!ok) setError('E-mail ou senha inválidos. Tente novamente.')
    else onLogin()
  }

  return (
    <div style={s.page}>
      <div style={s.card} className="fade-in">
        <div style={s.logo}>
          <div style={s.logoIcon}>CF</div>
          <div>
            <div style={s.logoText}>CorpFinance</div>
            <div style={s.logoSub}>Sistema Financeiro Corporativo</div>
          </div>
        </div>

        <div style={s.title}>Bem-vindo de volta</div>
        <div style={s.sub}>Acesse sua conta para continuar</div>

        {error && <div style={s.error}>⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.group}>
            <label style={s.label}>E-mail corporativo</label>
            <input
              style={s.input} type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@empresa.com"
              onFocus={e => e.target.style.borderColor = '#16a34a'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div style={s.group}>
            <label style={s.label}>Senha</label>
            <input
              style={s.input} type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onFocus={e => e.target.style.borderColor = '#16a34a'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <button
            type="submit" style={{ ...s.btn, opacity: loading ? .7 : 1 }}
            onMouseEnter={e => !loading && (e.target.style.background = '#15803d')}
            onMouseLeave={e => e.target.style.background = '#16a34a'}
          >
            {loading ? 'Autenticando...' : 'Entrar →'}
          </button>
        </form>

        <div style={s.hint}>
          <div style={s.hintTitle}>Contas de demonstração</div>
          {[
            ['admin@empresa.com', 'Administrador'],
            ['gestor@empresa.com', 'Gestor'],
            ['viewer@empresa.com', 'Visualizador'],
          ].map(([email, role]) => (
            <div key={email} style={s.hintRow}>
              {email}<span style={s.badge}>{role}</span>
            </div>
          ))}
          <div style={{ ...s.hintRow, marginTop: 6, color: '#94a3b8' }}>Senha: senha123</div>
        </div>
      </div>
    </div>
  )
}
