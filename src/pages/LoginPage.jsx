import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const DEMO_ACCOUNTS = [
  ['admin@empresa.com',  'Administrador'],
  ['gestor@empresa.com', 'Gestor'],
  ['viewer@empresa.com', 'Visualizador'],
]

const inputClass =
  'w-full py-2.5 px-3.5 border-[1.5px] border-slate-200 rounded-lg text-sm outline-none ' +
  'bg-slate-50 text-slate-900 transition-colors focus:border-green-600'

export default function LoginPage({ onLogin }) {
  const { login } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if(!email || !password) { setError('Preencha todos os campos.'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const ok = login(email, password)
    setLoading(false)
    if(!ok) setError('E-mail ou senha inválidos. Tente novamente.')
    else onLogin()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900">
      <div className="w-full max-w-[420px] px-10 py-12 bg-white rounded-2xl shadow-login animate-fade-in">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-green-600 text-white font-extrabold text-lg">
            CF
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 leading-tight">CorpFinance</div>
            <div className="text-[11px] text-slate-400 font-normal">Sistema Financeiro Corporativo</div>
          </div>
        </div>

        <div className="text-2xl font-bold text-slate-900 mb-1">Bem-vindo de volta</div>
        <div className="text-sm text-slate-500 mb-8">Acesse sua conta para continuar</div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-600 rounded-lg py-2.5 px-3.5 text-[13px] mb-4">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-[18px]">
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">E-mail corporativo</label>
            <input
              type="email"
              value={email}
              placeholder="seu@empresa.com"
              onChange={e => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="mb-[18px]">
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Senha</label>
            <input
              type="password"
              value={password}
              placeholder="••••••••"
              onChange={e => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-green-600 text-white rounded-lg font-bold text-[15px] cursor-pointer transition-colors hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Autenticando...' : 'Entrar →'}
          </button>
        </form>

        <div className="mt-6 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.05em] mb-2">
            Contas de demonstração
          </div>
          {DEMO_ACCOUNTS.map(([accEmail, role]) => (
            <div key={accEmail} className="text-xs text-slate-600 mb-1 font-mono">
              {accEmail}
              <span className="inline-block text-[10px] bg-blue-100 text-blue-700 rounded px-1.5 py-px ml-1.5 font-sans">
                {role}
              </span>
            </div>
          ))}
          <div className="text-xs text-slate-400 font-mono mt-1.5">Senha: senha123</div>
        </div>
      </div>
    </div>
  )
}
