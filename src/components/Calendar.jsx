import { useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { format } from 'date-fns'

function Calendar({ events, setEvents, onDateClick }) {
  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 50,
        orderBy: 'startTime'
      })

      const items = response.result.items
      const formattedEvents = items.map(event => ({
        id: event.id,
        title: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        description: event.description
      }))

      setEvents(formattedEvents)
    } catch (error) {
      console.error('Error al cargar eventos:', error)
    }
  }

  const handleEventClick = async (clickInfo) => {
    if (window.confirm(`¿Eliminar el evento '${clickInfo.event.title}'?`)) {
      try {
        await window.gapi.client.calendar.events.delete({
          calendarId: 'primary',
          eventId: clickInfo.event.id
        })
        
        clickInfo.event.remove()
        setEvents(events.filter(e => e.id !== clickInfo.event.id))
      } catch (error) {
        console.error('Error al eliminar evento:', error)
      }
    }
  }

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        locale="es"
        events={events}
        dateClick={onDateClick}
        eventClick={handleEventClick}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        height="auto"
      />
    </div>
  )
}

export default Calendar
