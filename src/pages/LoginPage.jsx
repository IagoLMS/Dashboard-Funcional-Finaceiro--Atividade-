import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, LogIn, Mail, ShieldCheck, TrendingUp, User, Wallet } from 'lucide-react';

import logo from '../assets/logotype/logo_reduced.png';
import logoLight from '../assets/logotype/logo_reduced_light.png';

const DEMO_ACCOUNTS = [
  ['admin@empresa.com',  'Administrador'],
  ['gestor@empresa.com', 'Gestor'],
  ['viewer@empresa.com', 'Visualizador'],
]

const FEATURES = [
  { icon: Wallet,      title: 'Controle financeiro em tempo real',       desc: 'Receitas, despesas e lucro em um só lugar.' },
  { icon: TrendingUp,  title: 'Indicadores e relatórios estratégicos',   desc: 'Tome decisões com dados confiáveis.' },
  { icon: ShieldCheck, title: 'Acesso seguro com perfis personalizados', desc: 'Permissões por papel: admin, gestor e viewer.' },
]

const Brand = ({ size = 'md', tone = 'light' }) => {
  const box   = size === 'lg' ? 'w-12 h-12 text-lg rounded-xl' : 'w-10 h-10 text-base rounded-lg'
  const wrap  = tone === 'light' ? 'bg-white text-primary'     : 'bg-primary text-white'
  const title = tone === 'light' ? 'text-white'                : 'text-text'
  const sub   = tone === 'light' ? 'text-white/70'             : 'text-text/50'

  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center justify-center font-extrabold ${box} ${wrap}`}>CF</div>
      <div>
        <div className={`text-lg font-bold leading-tight ${title}`}>CorpFinance</div>
        <div className={`text-[11px] font-medium ${sub}`}>Sistema Financeiro Corporativo</div>
      </div>
    </div>
  )
}

const Field = ({ icon: Icon, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text/40 pointer-events-none" />
    <input
      {...props}
      className="w-full h-12 pl-[calc(0.875rem+1.25rem+0.5rem)] pr-4 bg-white/60 border-b-2 border-text/10 rounded-md text-sm text-text placeholder:text-text/40 outline-none transition-colors focus:border-primary focus:bg-white"
    />
  </div>
)

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
    <div className="min-h-screen w-full flex bg-smoke text-text justify-center items-center">
      <div className="container flex w-full max-w-[70%] h-[750px] rounded-3xl shadow-2xl overflow-hidden">

        {/* ---------------- Coluna esquerda: boas-vindas (60%) ---------------- */}
        <aside className="relative hidden lg:flex lg:w-[57%] flex-col justify-between p-12 xl:p-16 text-white bg-blue-900 h-full gap-12 overflow-hidden">
          <div className="pointer-events-none absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-dark-cyan/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -left-24 w-[480px] h-[480px] rounded-full bg-cyan/20 blur-3xl" />

          <div className="z-10">
            <img src={logoLight} className='h-14' alt="Start Solidarium Logotype" />
          </div>

          <div className="relative z-10">
            <div className="max-w-xl">
              <h1 className="text-5xl xl:text-6xl font-semibold text-white/90 leading-[1.05] tracking-tight">
                Gestão<br /> <span className='text-7xl font-bold text-white'>Financeira</span>
              </h1>
              <p className="mt-6 text-base xl:text-lg text-white/80 leading-relaxed">
                Acompanhe a saúde financeira da sua empresa com painéis claros,
                indicadores estratégicos e relatórios prontos para decisão — tudo em um só lugar.
              </p>
            </div>

            <ul className="flex justify-between gap-4 mt-8 mb-10">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <li key={title} className="flex flex-col h-full border border-white/10 hover:border-white/40 hover:bg-white/10 transition-all duration-300 rounded-lg gap-4 p-3">
                  <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15">
                    <Icon className="w-5 h-5 text-cyan" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white mb-0.5">{title}</div>
                    <div className="text-[13px] text-white/70">{desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ---------------- Coluna direita: formulário (40%) ---------------- */}
        <main className="flex flex-col justify-between w-full lg:w-[43%] px-8 sm:px-16 py-10 bg-white">
          <div className="w-full flex flex-col justify-between h-full mx-auto py-4 animate-fade-in">
            <div>
              <img src={logo} className='h-14' alt="Start Solidarium Logotype" />
            </div>

            <div className="">
              <h2 className="text-3xl font-bold text-text/80">
                Bem-vindo(a) de volta!
              </h2>
              <p className="mt-2 text-sm text-text/60">
                Acesse sua conta para continuar.
              </p>

              {error && (
                <div className="mt-6 py-2.5 px-3.5 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700">
                  ⚠ {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="mt-10 space-y-8">
                <div className='space-y-4'>
                  <div>
                    <label htmlFor="email" className="block text-[13px] font-semibold text-text/80 mb-1.5">
                      E-mail corporativo
                    </label>
                    <Field
                      icon={User}
                      id="email"
                      type="email"
                      value={email}
                      placeholder="seu@empresa.com"
                      onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-[13px] font-semibold text-text/80 mb-1.5">
                      Senha
                    </label>
                    <Field
                      icon={Lock}
                      id="password"
                      type="password"
                      value={password}
                      placeholder="••••••••"
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 mt-12 inline-flex items-center justify-center gap-2 bg-blue-900 text-white rounded-xl font-semibold text-sm cursor-pointer transition-colors hover:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Autenticando...' : <>Entrar <LogIn className="w-4 h-4" /></>}
                </button>
              </form>
            </div>

            <div className="flex flex-col gap-1 p-3.5 rounded-lg border border-slate-300">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.05em] mb-2">
                Contas de demonstração
              </div>

              <div>
                {DEMO_ACCOUNTS.map(([accEmail, role]) => (
                  <div key={accEmail} className="text-xs text-slate-600 mb-1 font-mono">
                    {accEmail}
                    <span className="inline-block text-[10px] bg-blue-100 text-blue-700 rounded px-1.5 py-px ml-1.5 font-sans">
                      {role}
                    </span>
                  </div>
                ))}
                <div className="text-xs text-slate-400 font-mono mt-1">Senha: senha123</div>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-text/40 lg:hidden">
            © {new Date().getFullYear()} CorpFinance
          </div>
        </main>
      </div> 
    </div>
  )
}
