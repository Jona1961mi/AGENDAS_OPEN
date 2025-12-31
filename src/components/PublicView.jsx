import { useState, useEffect } from 'react'
import ChatAssistant from './ChatAssistant'
import './PublicView.css'

function PublicView() {
  const [events, setEvents] = useState([])
  const [isGoogleConnected, setIsGoogleConnected] = useState(false)

  // Verificar si admin tiene Google Calendar conectado
  useEffect(() => {
    const googleToken = localStorage.getItem('googleToken')
    setIsGoogleConnected(!!googleToken)
  }, [])

  const handleAppointmentCreated = async (appointmentData) => {
    try {
      let googleEventId = null

      // Si el admin tiene Google Calendar conectado, guardar ahí también
      if (isGoogleConnected && window.gapi?.client) {
        try {
          // Calcular hora de fin (30 minutos después)
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

          googleEventId = response.result.id
          console.log('✅ Cita guardada en Google Calendar del admin')
        } catch (error) {
          console.warn('⚠️ No se pudo guardar en Google Calendar:', error)
        }
      }

      // Guardar en MongoDB
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const response = await fetch(`${API_URL}/api/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente: appointmentData.patient,
          fecha: appointmentData.date,
          hora: appointmentData.time,
          motivo: appointmentData.reason,
          googleEventId: googleEventId
        })
      })

      if (response.ok) {
        console.log('✅ Cita guardada en el sistema')
      }
    } catch (error) {
      console.error('❌ Error guardando cita:', error)
    }
  }

  return (
    <div className="public-view">
      <div className="public-header">
        <h1>🏥 Consultorio Médico</h1>
        <p>Agenda tu cita fácilmente</p>
      </div>

      <div className="public-content">
        <div className="info-card">
          <h2>📋 ¿Cómo agendar?</h2>
          <ol>
            <li>Haz clic en el botón del chat 💬</li>
            <li>Dile al asistente tu nombre, fecha y hora</li>
            <li>Confirma tu cita</li>
          </ol>
        </div>

        <div className="schedule-card">
          <h3>🕐 Horarios de Atención</h3>
          <div className="schedule-list">
            <div className="schedule-row">
              <strong>Lunes - Sábado</strong>
              <span>8:00 AM - 8:00 PM</span>
            </div>
            <div className="schedule-row">
              <strong>Domingo</strong>
              <span>8:00 AM - 5:00 PM</span>
            </div>
          </div>
        </div>

        <div className="contact-card">
          <h3>📞 Contacto</h3>
          <p>Para urgencias o más información:</p>
          <p><strong>Teléfono:</strong> (555) 123-4567</p>
        </div>
      </div>

      {/* Chatbot para agendar */}
      <ChatAssistant 
        onCreateAppointment={handleAppointmentCreated}
        existingEvents={events}
      />
    </div>
  )
}

export default PublicView
