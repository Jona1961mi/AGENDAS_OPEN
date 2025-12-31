import { useState, useEffect } from 'react'
import Login from './components/Login'
import AdminView from './components/AdminView'
import PublicView from './components/PublicView'
import './estilos.css'
import './App.css'

function App() {
  const [view, setView] = useState('public') // 'public' o 'admin'
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Verificar si hay autenticación guardada
    const adminAuth = localStorage.getItem('adminAuth')
    if (adminAuth === 'true') {
      setIsAuthenticated(true)
    }

    // Detectar ruta /admin en la URL
    if (window.location.pathname === '/admin') {
      setView('admin')
    }
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setView('public')
    window.history.pushState({}, '', '/')
  }

  // Vista Admin
  if (view === 'admin') {
    if (!isAuthenticated) {
      return <Login onLogin={handleLogin} />
    }
    return <AdminView onLogout={handleLogout} />
  }

  // Vista Pública
  return <PublicView />
}

export default App
