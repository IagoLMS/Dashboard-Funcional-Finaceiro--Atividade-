import { createContext, useContext, useState, useEffect } from 'react'

const MOCK_USERS = [
  { id: 1, email: 'admin@empresa.com', password: 'senha123', role: 'admin', name: 'Ana Rodrigues', department: 'TI' },
  { id: 2, email: 'gestor@empresa.com', password: 'senha123', role: 'gestor', name: 'Carlos Mendes', department: 'Compras' },
  { id: 3, email: 'viewer@empresa.com', password: 'senha123', role: 'viewer', name: 'Beatriz Lima', department: 'RH' },
]

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cf_user')) } catch { return null }
  })

  const login = (email, password) => {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password)
    if (!found) return false
    const safe = { id: found.id, email: found.email, role: found.role, name: found.name, department: found.department }
    localStorage.setItem('cf_user', JSON.stringify(safe))
    setUser(safe)
    return true
  }

  const logout = () => {
    localStorage.removeItem('cf_user')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
