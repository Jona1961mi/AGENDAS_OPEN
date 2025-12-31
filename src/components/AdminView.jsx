import { useState, useEffect } from 'react'
import GoogleAuth from './GoogleAuth'
import ChatAssistant from './ChatAssistant'
import './AdminView.css'

const API_URL = 'http://localhost:5000/api'

function AdminView({ onLogout }) {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarCitas()
  }, [])

  const cargarCitas = async () => {
    try {
      const response = await fetch(`${API_URL}/citas`)
      const citas = await response.json()
      
      const eventosFormateados = citas.map(cita => ({
        id: cita._id,
        title: `${cita.paciente} - ${cita.motivo}`,
        start: `${cita.fecha}T${cita.hora}:00`,
        end: `${cita.fecha}T${cita.hora}:00`,
        description: cita.motivo,
        googleEventId: cita.googleEventId,
        paciente: cita.paciente,
        fecha: cita.fecha,
        hora: cita.hora
      }))
      
      setEvents(eventosFormateados)
      setLoading(false)
      console.log('✅ Citas cargadas:', eventosFormateados.length)
    } catch (error) {
      console.error('❌ Error cargando citas:', error)
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('¿Estás seguro de cancelar esta cita?')) return

    try {
      const evento = events.find(e => e.id === eventId)
      
      // Eliminar de Google Calendar PRIMERO (si está conectado)
      if (isSignedIn && evento?.googleEventId) {
        try {
          await window.gapi.client.calendar.events.delete({
            calendarId: 'primary',
            eventId: evento.googleEventId
          })
          console.log('✅ Eliminado de Google Calendar')
        } catch (error) {
          console.warn('⚠️ No se pudo eliminar de Google Calendar:', error)
        }
      }

      // Eliminar de MongoDB
      const response = await fetch(`${API_URL}/citas/${eventId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Error eliminando cita')

      setEvents(events.filter(e => e.id !== eventId))
      console.log('✅ Cita cancelada completamente')
    } catch (error) {
      console.error('Error al cancelar cita:', error)
      alert('Error al cancelar la cita')
    }
  }

  const handleAppointmentFromChat = async (appointmentData) => {
    try {
      // 1. Guardar en MongoDB PRIMERO (siempre)
      const citaData = {
        paciente: appointmentData.patient,
        fecha: appointmentData.date,
        hora: appointmentData.time,
        motivo: appointmentData.reason
      }

      const response = await fetch(`${API_URL}/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(citaData)
      })

      const citaGuardada = await response.json()
      console.log('✅ Cita guardada en MongoDB:', citaGuardada._id)

      // 2. Si está conectado a Google, también guardar ahí
      if (isSignedIn) {
        const googleEventId = await createGoogleEvent(appointmentData)
        
        if (googleEventId) {
          // Actualizar MongoDB con el ID de Google
          await fetch(`${API_URL}/citas/${citaGuardada._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ googleEventId })
          })
          console.log('✅ Cita sincronizada con Google Calendar')
        }
      } else {
        console.log('ℹ️ Cita guardada solo en MongoDB (Google Calendar no conectado)')
      }

      await cargarCitas()
    } catch (error) {
      console.error('❌ Error guardando cita:', error)
      alert('Error al guardar la cita')
    }
  }

  const createGoogleEvent = async (appointmentData) => {
    try {
      // Calcular hora de fin (30 minutos después)
      const [hours, minutes] = appointmentData.time.split(':')
      const startDate = new Date(`${appointmentData.date}T${appointmentData.time}:00`)
      const endDate = new Date(startDate.getTime() + 30 * 60000) // +30 minutos
      
      const endHours = endDate.getHours().toString().padStart(2, '0')
      const endMinutes = endDate.getMinutes().toString().padStart(2, '0')
      const endTime = `${endHours}:${endMinutes}`

      const event = {
        summary: `${appointmentData.patient} - ${appointmentData.reason}`,
        description: `Paciente: ${appointmentData.patient}\nMotivo: ${appointmentData.reason}`,
        start: {
          dateTime: `${appointmentData.date}T${appointmentData.time}:00`,
          timeZone: 'America/Mexico_City'
        },
        end: {
          dateTime: `${appointmentData.date}T${endTime}:00`,
          timeZone: 'America/Mexico_City'
        }
      }

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      })

      console.log('✅ Cita sincronizada con Google Calendar')
      return response.result.id
    } catch (error) {
      console.error('Error al guardar en Google Calendar:', error)
      return null
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    onLogout()
  }

  return (
    <div className="admin-view">
      <header className="admin-header">
        <div className="admin-title">
          <h1>🔐 Panel de Administración</h1>
          <p>Gestión de citas del consultorio</p>
        </div>
        <div className="admin-actions">
          <GoogleAuth 
            isSignedIn={isSignedIn} 
            setIsSignedIn={setIsSignedIn}
          />
          <button onClick={handleLogout} className="logout-btn">
            🚪 Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="admin-main">
        {/* Información si no está conectado a Google */}
        {!isSignedIn && (
          <div className="info-banner">
            <span className="info-icon">💡</span>
            <div className="info-content">
              <strong>Google Calendar (Opcional)</strong>
              <p>Conecta tu cuenta de Google para sincronizar las citas con tu calendario. Las citas se guardan automáticamente en el sistema.</p>
            </div>
          </div>
        )}

        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>Total Citas</h3>
              <p className="stat-number">{events.length}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <h3>Hoy</h3>
              <p className="stat-number">
                {events.filter(e => e.fecha === new Date().toISOString().split('T')[0]).length}
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Esta Semana</h3>
              <p className="stat-number">
                {events.filter(e => {
                  const eventDate = new Date(e.fecha)
                  const today = new Date()
                  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                  return eventDate >= today && eventDate <= weekFromNow
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="appointments-section">
          <h2>📋 Todas las Citas</h2>
          
          {loading ? (
            <div className="loading-state">Cargando citas...</div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <p>No hay citas agendadas</p>
              <p>👉 Las citas aparecerán aquí cuando los pacientes agenden</p>
            </div>
          ) : (
            <div className="appointments-grid">
              {events
                .sort((a, b) => new Date(a.start) - new Date(b.start))
                .map(event => {
                  const date = new Date(event.start)
                  const dateStr = date.toLocaleDateString('es-MX', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })
                  const timeStr = date.toLocaleTimeString('es-MX', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
                  
                  const isPast = date < new Date()
                  
                  return (
                    <div key={event.id} className={`appointment-card ${isPast ? 'past' : ''}`}>
                      <div className="appointment-header">
                        <h3>{event.paciente}</h3>
                        <button 
                          onClick={() => handleDeleteEvent(event.id)}
                          className="delete-btn"
                          title="Cancelar cita"
                        >
                          🗑️
                        </button>
                      </div>
                      <p className="appointment-date">📅 {dateStr}</p>
                      <p className="appointment-time">🕐 {timeStr}</p>
                      <p className="appointment-description">📋 {event.description}</p>
                      {isPast && <span className="past-badge">Pasada</span>}
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        <div className="schedule-info">
          <h3>🏥 Horarios de Atención</h3>
          <div className="schedule-grid">
            <div className="schedule-item">
              <strong>Lunes - Sábado</strong>
              <span>8:00 AM - 8:00 PM</span>
            </div>
            <div className="schedule-item">
              <strong>Domingo</strong>
              <span>8:00 AM - 5:00 PM</span>
            </div>
          </div>
        </div>
      </main>

      <ChatAssistant 
        onCreateAppointment={handleAppointmentFromChat}
        existingEvents={events}
      />
    </div>
  )
}

export default AdminView
