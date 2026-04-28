import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'

function AppShell() {
  const { user, logout } = useAuth()
  const [page, setPage] = useState('dashboard')
  const [loggedIn, setLoggedIn] = useState(!!user)

  const handleLogin = () => setLoggedIn(true)
  const handleLogout = () => { logout(); setLoggedIn(false); setPage('dashboard') }

  if (!loggedIn || !user) return <LoginPage onLogin={handleLogin} />

  // Access control: viewer and gestor can't see users page
  const safePage = (page === 'users' && user.role !== 'admin') ? 'dashboard' : page

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar page={safePage} setPage={setPage} onLogout={handleLogout} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Topbar page={safePage} />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {safePage === 'dashboard' && <DashboardPage key="dash" />}
          {safePage === 'users' && user.role === 'admin' && <UsersPage key="users" />}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
