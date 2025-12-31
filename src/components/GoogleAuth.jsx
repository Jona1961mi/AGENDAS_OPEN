import { useEffect, useState } from 'react'
import { GOOGLE_CONFIG } from '../config/googleConfig'

// Variable global para el token
let tokenClient = null
let gapiInited = false
let gisInited = false

function GoogleAuth({ isSignedIn, setIsSignedIn }) {
  const [userEmail, setUserEmail] = useState('')
  
  useEffect(() => {
    // Inicializar GAPI
    const gapiLoaded = () => {
      window.gapi.load('client', async () => {
        await window.gapi.client.init({
          apiKey: GOOGLE_CONFIG.API_KEY,
          discoveryDocs: GOOGLE_CONFIG.DISCOVERY_DOCS,
        })
        gapiInited = true
        console.log('✅ GAPI inicializado')
        
        // Verificar si hay token guardado
        const savedToken = localStorage.getItem('googleToken')
        const savedEmail = localStorage.getItem('googleEmail')
        if (savedToken) {
          window.gapi.client.setToken({ access_token: savedToken })
          setIsSignedIn(true)
          setUserEmail(savedEmail || '')
          console.log('✅ Sesión de Google restaurada')
        }
      })
    }

    // Inicializar GIS (Google Identity Services)
    const gisLoaded = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CONFIG.CLIENT_ID,
        scope: GOOGLE_CONFIG.SCOPES,
        callback: async (response) => {
          if (response.access_token) {
            localStorage.setItem('googleToken', response.access_token)
            setIsSignedIn(true)
            
            // Obtener información del usuario
            try {
              const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${response.access_token}` }
              })
              const data = await userInfo.json()
              setUserEmail(data.email)
              localStorage.setItem('googleEmail', data.email)
              console.log('✅ Conectado como:', data.email)
            } catch (error) {
              console.error('Error obteniendo usuario:', error)
            }
          }
        },
      })
      gisInited = true
      console.log('✅ GIS inicializado')
    }

    // Esperar a que los scripts se carguen
    if (window.gapi) {
      gapiLoaded()
    } else {
      window.addEventListener('load', gapiLoaded)
    }

    if (window.google) {
      gisLoaded()
    } else {
      window.addEventListener('load', gisLoaded)
    }

    return () => {
      window.removeEventListener('load', gapiLoaded)
      window.removeEventListener('load', gisLoaded)
    }
  }, [setIsSignedIn])

  const handleAuthClick = () => {
    if (isSignedIn) {
      // Desconectar Google Calendar
      const token = window.gapi.client.getToken()
      if (token !== null) {
        window.google.accounts.oauth2.revoke(token.access_token)
        window.gapi.client.setToken('')
      }
      localStorage.removeItem('googleToken')
      localStorage.removeItem('googleEmail')
      setIsSignedIn(false)
      setUserEmail('')
      console.log('🔓 Google Calendar desconectado')
    } else {
      // Conectar Google Calendar
      if (tokenClient && gapiInited && gisInited) {
        tokenClient.requestAccessToken({ prompt: 'consent' })
      } else {
        alert('Cargando Google API... Espera un momento e intenta de nuevo.')
      }
    }
  }

  return (
    <div className="google-auth-container">
      {isSignedIn && userEmail && (
        <div className="google-user-info">
          <span className="google-email">📧 {userEmail}</span>
        </div>
      )}
      <button className="auth-button" onClick={handleAuthClick}>
        {isSignedIn ? '🔌 Desconectar Google Calendar' : '🔗 Conectar Google Calendar'}
      </button>
    </div>
  )
}

export default GoogleAuth
