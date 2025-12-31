import { useState } from 'react'

function EventModal({ selectedDate, onClose, onEventCreated }) {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '10:00'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    const event = {
      summary: eventData.title,
      description: eventData.description,
      start: {
        dateTime: `${selectedDate.dateStr}T${eventData.startTime}:00`,
        timeZone: 'America/Mexico_City'
      },
      end: {
        dateTime: `${selectedDate.dateStr}T${eventData.endTime}:00`,
        timeZone: 'America/Mexico_City'
      }
    }

    try {
      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      })

      onEventCreated({
        id: response.result.id,
        title: eventData.title,
        start: event.start.dateTime,
        end: event.end.dateTime,
        description: eventData.description
      })

      alert('¡Evento creado exitosamente!')
    } catch (error) {
      console.error('Error al crear evento:', error)
      alert('Error al crear el evento')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Crear Evento</h2>
        <p className="modal-date">📅 {selectedDate.dateStr}</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título *</label>
            <input
              type="text"
              required
              value={eventData.title}
              onChange={(e) => setEventData({...eventData, title: e.target.value})}
              placeholder="Título del evento"
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={eventData.description}
              onChange={(e) => setEventData({...eventData, description: e.target.value})}
              placeholder="Descripción del evento"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Hora inicio *</label>
              <input
                type="time"
                required
                value={eventData.startTime}
                onChange={(e) => setEventData({...eventData, startTime: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Hora fin *</label>
              <input
                type="time"
                required
                value={eventData.endTime}
                onChange={(e) => setEventData({...eventData, endTime: e.target.value})}
              />
            </div>
          </div>

          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              Crear Evento
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventModal
