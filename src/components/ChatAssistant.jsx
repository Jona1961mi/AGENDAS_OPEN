import { useState } from 'react'
import './ChatAssistant.css'

function ChatAssistant({ onCreateAppointment, existingEvents }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: '¡Hola! Soy tu asistente virtual del consultorio. Puedo ayudarte a:\n• Agendar citas\n• Ver horarios disponibles\n• Consultar citas agendadas\n\n🏥 Horarios:\nLun-Sáb: 8:00 AM - 8:00 PM\nDomingo: 8:00 AM - 5:00 PM\n\n¿En qué puedo ayudarte?' 
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const isTimeAvailable = (date, time) => {
    const dayOfWeek = new Date(date).getDay()
    const [hours] = time.split(':').map(Number)
    
    // Verificar horarios de atención
    if (dayOfWeek === 0) { // Domingo
      if (hours < 8 || hours >= 17) return false
    } else { // Lunes-Sábado
      if (hours < 8 || hours >= 20) return false
    }
    
    // Verificar si ya hay cita en ese horario
    const appointmentDateTime = `${date}T${time}`
    const hasConflict = existingEvents.some(event => {
      const eventStart = event.start.split('T')[0] + 'T' + event.start.split('T')[1].substring(0, 5)
      return eventStart === appointmentDateTime
    })
    
    return !hasConflict
  }

  const getAvailableSlots = (date) => {
    const dayOfWeek = new Date(date).getDay()
    const endHour = dayOfWeek === 0 ? 17 : 20 // Domingo hasta 5pm, resto hasta 8pm
    
    const slots = []
    for (let h = 8; h < endHour; h++) {
      for (let m = 0; m < 60; m += 30) {
        const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        if (isTimeAvailable(date, time)) {
          slots.push(time)
        }
      }
    }
    return slots
  }

  const parseAppointment = (text) => {
    const lowerText = text.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remover acentos
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim()
    
    // ============================================
    // EXTRAER FECHA - MÁS FLEXIBLE
    // ============================================
    let date = new Date()
    let fechaEncontrada = false
    
    // Palabras clave para fechas relativas (con variaciones)
    if (/\b(hoy|horita|ahorita)\b/.test(lowerText)) {
      fechaEncontrada = true
    } else if (/\b(manana|mañana|man̄ana)\b/.test(lowerText)) {
      date.setDate(date.getDate() + 1)
      fechaEncontrada = true
    } else if (/\b(pasado\s*(manana|mañana)|pasadomañana)\b/.test(lowerText)) {
      date.setDate(date.getDate() + 2)
      fechaEncontrada = true
    } else if (/\b(siguiente\s*semana|proxima\s*semana|la\s*otra\s*semana)\b/.test(lowerText)) {
      date.setDate(date.getDate() + 7)
      fechaEncontrada = true
    }
    
    // Días de la semana con variaciones y errores comunes
    const diasSemana = {
      'lunes': 1, 'lune': 1, 'lu': 1,
      'martes': 2, 'marte': 2, 'ma': 2,
      'miercoles': 3, 'miercole': 3, 'mierco': 3, 'mx': 3, 'mi': 3,
      'jueves': 4, 'jueve': 4, 'jue': 4, 'ju': 4,
      'viernes': 5, 'vierne': 5, 'vier': 5, 'vi': 5,
      'sabado': 6, 'sabad': 6, 'sab': 6, 'sa': 6,
      'domingo': 0, 'domin': 0, 'dom': 0, 'do': 0
    }
    
    for (const [dia, num] of Object.entries(diasSemana)) {
      if (new RegExp(`\\b${dia}\\b`).test(lowerText)) {
        const today = date.getDay()
        let diff = num - today
        if (diff <= 0) diff += 7
        date.setDate(date.getDate() + diff)
        fechaEncontrada = true
        break
      }
    }
    
    // Detectar meses con variaciones
    const meses = {
      'enero': 0, 'ene': 0,
      'febrero': 1, 'feb': 1, 'febrer': 1,
      'marzo': 2, 'mar': 2,
      'abril': 3, 'abr': 3,
      'mayo': 4, 'may': 4,
      'junio': 5, 'jun': 5,
      'julio': 6, 'jul': 6,
      'agosto': 7, 'ago': 7, 'agost': 7,
      'septiembre': 8, 'sep': 8, 'sept': 8, 'setiembre': 8,
      'octubre': 9, 'oct': 9,
      'noviembre': 10, 'nov': 10,
      'diciembre': 11, 'dic': 11
    }
    
    // Formato: "15 de enero", "20 marzo", "5 de feb"
    for (const [mes, num] of Object.entries(meses)) {
      const regex = new RegExp(`(\\d{1,2})\\s*(?:de)?\\s*${mes}`, 'i')
      const match = text.match(regex)
      if (match) {
        const day = parseInt(match[1])
        date = new Date()
        date.setMonth(num)
        date.setDate(day)
        if (date < new Date()) {
          date.setFullYear(date.getFullYear() + 1)
        }
        fechaEncontrada = true
        break
      }
    }
    
    // Formato: DD/MM, DD-MM, DD.MM
    const dateMatch = text.match(/\b(\d{1,2})[\/\-\.](\d{1,2})\b/)
    if (dateMatch && !fechaEncontrada) {
      const day = parseInt(dateMatch[1])
      const month = parseInt(dateMatch[2]) - 1
      if (day <= 31 && month <= 11) {
        date = new Date()
        date.setMonth(month)
        date.setDate(day)
        if (date < new Date()) {
          date.setFullYear(date.getFullYear() + 1)
        }
        fechaEncontrada = true
      }
    }
    
    // Solo número como día (evitar confundir con hora)
    if (!fechaEncontrada) {
      const onlyDayMatch = text.match(/\b(?:el|dia)?\s*(\d{1,2})\b(?!\s*(?:pm|am|horas?|:|de\s*la))/i)
      if (onlyDayMatch) {
        const day = parseInt(onlyDayMatch[1])
        if (day >= 1 && day <= 31) {
          date = new Date()
          date.setDate(day)
          if (date < new Date()) {
            date.setMonth(date.getMonth() + 1)
          }
          fechaEncontrada = true
        }
      }
    }
    
    // ============================================
    // EXTRAER HORA - SUPER MEJORADO Y FLEXIBLE
    // ============================================
    let hora = '09:00'
    let horaEncontrada = false
    
    // PASO 1: Detectar formato "X de la tarde/mañana/noche" - MÁXIMA PRIORIDAD
    const periodoMatch = text.match(/\b(?:a\s*las?|las?|sobre\s*las?|tipo|como)?\s*(\d{1,2})\s*(?:y\s*(?:media|cuarto|treinta|quince|45|30|15|cuarenta\s*y\s*cinco))?\s*(?:de\s*la\s*)?(tarde|manana|mañana|noche|madrugada)/i)
    if (periodoMatch && !horaEncontrada) {
      let h = parseInt(periodoMatch[1])
      let m = '00'
      const periodo = periodoMatch[2].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      const minutos = periodoMatch[0]
      
      // Detectar minutos
      if (/media|30|treinta/.test(minutos)) m = '30'
      else if (/cuarto|15|quince/.test(minutos)) m = '15'
      else if (/45|cuarenta/.test(minutos)) m = '45'
      
      // Convertir según periodo
      if (periodo === 'tarde') {
        if (h >= 1 && h <= 11) h += 12
        else if (h === 12) h = 12 // mediodía
      } else if (periodo === 'noche') {
        if (h >= 6 && h <= 11) h += 12
        else if (h >= 1 && h <= 5) h += 12
        else if (h === 12) h = 0 // medianoche
      } else if (periodo === 'manana') {
        if (h === 12) h = 0
        // 1-11 queda igual
      } else if (periodo === 'madrugada') {
        if (h === 12) h = 0
        else if (h >= 1 && h <= 5) {} // 1-5am queda igual
      }
      
      hora = `${h.toString().padStart(2, '0')}:${m}`
      horaEncontrada = true
    }
    
    // PASO 2: Formato con : (14:30, 9:00)
    if (!horaEncontrada) {
      const colonMatch = text.match(/\b(\d{1,2}):(\d{2})\s*(am|pm)?/i)
      if (colonMatch) {
        let h = parseInt(colonMatch[1])
        let m = colonMatch[2]
        
        if (colonMatch[3]) {
          const ampm = colonMatch[3].toLowerCase()
          if (ampm === 'pm' && h < 12) h += 12
          if (ampm === 'am' && h === 12) h = 0
        }
        
        hora = `${h.toString().padStart(2, '0')}:${m}`
        horaEncontrada = true
      }
    }
    
    // PASO 3: Formato AM/PM (3pm, 10am, 5 pm)
    if (!horaEncontrada) {
      const ampmMatch = text.match(/\b(\d{1,2})\s*(am|pm)/i)
      if (ampmMatch) {
        let h = parseInt(ampmMatch[1])
        const ampm = ampmMatch[2].toLowerCase()
        
        if (ampm === 'pm' && h < 12) h += 12
        if (ampm === 'am' && h === 12) h = 0
        
        hora = `${h.toString().padStart(2, '0')}:00`
        horaEncontrada = true
      }
    }
    
    // PASO 4: Palabras especiales
    if (!horaEncontrada) {
      if (/\b(mediodia|medio\s*dia|12\s*del\s*dia)\b/.test(lowerText)) {
        hora = '12:00'
        horaEncontrada = true
      } else if (/\b(medianoche|12\s*de\s*la\s*noche)\b/.test(lowerText)) {
        hora = '00:00'
        horaEncontrada = true
      }
    }
    
    // PASO 5: Formato "a las X" o "las X" sin más contexto
    if (!horaEncontrada) {
      const alasMatch = text.match(/\b(?:a\s*las?|las?|sobre\s*las?|como\s*a\s*las?)\s*(\d{1,2})\s*(?:y\s*(?:media|cuarto|treinta|quince|45|30|15))?(?!\s*(?:pm|am|de\s*la))/i)
      if (alasMatch) {
        let h = parseInt(alasMatch[1])
        let m = '00'
        
        if (/media|30|treinta/.test(alasMatch[0])) m = '30'
        else if (/cuarto|15|quince/.test(alasMatch[0])) m = '15'
        else if (/45/.test(alasMatch[0])) m = '45'
        
        // Heurística inteligente
        if (h >= 1 && h <= 7) {
          h += 12 // 1-7 probablemente son PM
        } else if (h === 12) {
          h = 12 // mediodía
        }
        // 8-11 pueden ser AM o PM, dejar como están
        // 13-23 ya son formato 24h
        
        hora = `${h.toString().padStart(2, '0')}:${m}`
        horaEncontrada = true
      }
    }
    
    // PASO 6: Solo número + "horas"
    if (!horaEncontrada) {
      const horasMatch = text.match(/\b(\d{1,2})\s*horas?/i)
      if (horasMatch) {
        let h = parseInt(horasMatch[1])
        if (h < 8 && h !== 0) h += 12
        hora = `${h.toString().padStart(2, '0')}:00`
        horaEncontrada = true
      }
    }
    
    // ============================================
    // EXTRAER NOMBRE - MUY MEJORADO
    // ============================================
    let paciente = 'Paciente'
    
    // Lista de palabras a excluir
    const palabrasExcluir = [
      'el', 'la', 'las', 'los', 'un', 'una', 'unos', 'unas',
      'manana', 'mañana', 'tarde', 'noche', 'hoy', 'ayer',
      'lunes', 'martes', 'miercoles', 'miércoles', 'jueves', 'viernes', 'sabado', 'sábado', 'domingo',
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
      'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
      'cita', 'hora', 'turno', 'agendar', 'revision', 'control', 'consulta',
      'ala', 'alas', 'tipo', 'sobre', 'como'
    ]
    
    // Patrones mejorados para nombres (más específicos)
    const nombrePatterns = [
      // "para Juan", "cita para Juan el 31"
      /(?:para|cita\s+para)\s+([A-Za-záéíóúñÁÉÍÓÚÑ]{3,}(?:\s+[A-Za-záéíóúñÁÉÍÓÚÑ]{3,})?)\s+(?:el|mañana|hoy|lunes|martes|a\s*las)/i,
      // "paciente: Juan", "paciente Juan"
      /\bpaciente:?\s+([A-Za-záéíóúñÁÉÍÓÚÑ]{3,}(?:\s+[A-Za-záéíóúñÁÉÍÓÚÑ]{3,})?)\b/i,
      // "cita de Juan"
      /\bcita\s+de\s+([A-Za-záéíóúñÁÉÍÓÚÑ]{3,}(?:\s+[A-Za-záéíóúñÁÉÍÓÚÑ]{3,})?)\b/i,
      // Al inicio: "Juan necesita cita"
      /^([A-Za-záéíóúñÁÉÍÓÚÑ]{3,}(?:\s+[A-Za-záéíóúñÁÉÍÓÚÑ]{3,})?)\s+(?:necesita|quiere|solicita)\s+(?:una\s+)?cita/i,
      // Apellido + nombre: "Pérez Juan"
      /\b([A-Za-záéíóúñÁÉÍÓÚÑ]{3,}\s+[A-Za-záéíóúñÁÉÍÓÚÑ]{3,})\s+(?:el|a\s*las|mañana|hoy|para)/i
    ]
    
    for (const pattern of nombrePatterns) {
      const match = text.match(pattern)
      if (match) {
        const nombreTemp = match[1].trim()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Sin acentos para comparar
        
        // Verificar que no sea palabra excluida
        const palabrasNombre = nombreTemp.toLowerCase().split(/\s+/)
        const esValido = palabrasNombre.every(palabra => 
          !palabrasExcluir.includes(palabra) && palabra.length >= 2
        )
        
        if (esValido && nombreTemp.length >= 3) {
          // Capitalizar nombre correctamente
          paciente = match[1].trim().split(/\s+/).map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ')
          break
        }
      }
    }
    
    // Si no encontró nombre, buscar cualquier palabra capitalizada que no esté excluida
    if (paciente === 'Paciente') {
      const palabrasTexto = text.split(/\s+/)
      for (const palabra of palabrasTexto) {
        const palabraLimpia = palabra.replace(/[^\wáéíóúñÁÉÍÓÚÑ]/g, '')
        if (palabraLimpia.length >= 3 && 
            /^[A-ZÁÉÍÓÚÑ]/.test(palabraLimpia) &&
            !palabrasExcluir.includes(palabraLimpia.toLowerCase())) {
          paciente = palabraLimpia.charAt(0).toUpperCase() + palabraLimpia.slice(1).toLowerCase()
          break
        }
      }
    }
    
    // ============================================
    // EXTRAER MOTIVO/TIPO DE CONSULTA
    // ============================================
    let motivo = 'Consulta general'
    
    const motivosKeywords = {
      'revisión': 'Revisión médica',
      'revision': 'Revisión médica',
      'control': 'Control',
      'urgencia': 'Urgencia',
      'urgente': 'Urgencia',
      'consulta': 'Consulta general',
      'seguimiento': 'Seguimiento',
      'chequeo': 'Chequeo general',
      'examen': 'Examen médico',
      'análisis': 'Análisis',
      'analisis': 'Análisis',
      'vacuna': 'Vacunación',
      'inyección': 'Inyección',
      'dolor': 'Consulta por dolor',
      'fiebre': 'Consulta por fiebre'
    }
    
    for (const [keyword, tipo] of Object.entries(motivosKeywords)) {
      if (lowerText.includes(keyword)) {
        motivo = tipo
        break
      }
    }
    
    return {
      date: date.toISOString().split('T')[0],
      time: hora,
      patient: paciente,
      reason: motivo
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userInput = input // Guardar antes de limpiar
    const userMessage = { role: 'user', content: userInput }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simular procesamiento
    setTimeout(() => {
      const lowerInput = userInput.toLowerCase()
      let response = ''

      // PRIORIDAD 0: Completar cita pendiente con nombre
      const lastMessage = messages[messages.length - 1]
      if (lastMessage?.pendingAppointment) {
        // El usuario está respondiendo con el nombre
        const nombreMatch = userInput.match(/([A-Za-záéíóúñÁÉÍÓÚÑ]{3,}(?:\s+[A-Za-záéíóúñÁÉÍÓÚÑ]{3,})?)/i)
        if (nombreMatch) {
          const nombre = nombreMatch[1].trim().split(/\s+/).map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ')
          
          const appointment = {
            ...lastMessage.pendingAppointment,
            patient: nombre
          }
          
          response = `✅ Perfecto! Tenemos disponibilidad:\n\n` +
                    `👤 Paciente: ${nombre}\n` +
                    `📅 Fecha: ${appointment.date}\n` +
                    `🕐 Hora: ${appointment.time}\n` +
                    `📋 Motivo: ${appointment.reason}\n\n` +
                    `¿Confirmo esta cita? (Responde "sí" para confirmar)`
          
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: response,
            appointmentData: appointment
          }])
          setIsTyping(false)
          return
        }
      }

      // PRIORIDAD 1: Confirmar cita pendiente
      if (lowerInput.includes('sí') || lowerInput.includes('si') || 
          lowerInput.includes('confirmar') || lowerInput.includes('confirmo') ||
          lowerInput.includes('ok') || lowerInput.includes('dale')) {
        
        const lastAppointment = [...messages].reverse().find(m => m.appointmentData)
        if (lastAppointment) {
          onCreateAppointment(lastAppointment.appointmentData)
          response = '✅ ¡Cita confirmada y guardada!\n\n' +
                    '📧 Se ha agendado la cita exitosamente.\n\n' +
                    '¿Necesitas agendar otra cita?'
          setMessages(prev => [...prev, { role: 'assistant', content: response }])
          setIsTyping(false)
          return
        }
      }

      // PRIORIDAD 2: Agendar cita (detectar números, fechas, horas)
      const tieneNumeros = /\d/.test(userInput)
      const tienePalabrasClave = /agendar|cita|hora|turno|reserva|para|paciente/i.test(userInput)
      const tieneFecha = /hoy|mañana|manana|lunes|martes|miercoles|miércoles|jueves|viernes|sabado|sábado|domingo|\d+\/\d+|\d+\s*de/i.test(userInput)
      
      if ((tienePalabrasClave && (tieneNumeros || tieneFecha)) || 
          (tieneNumeros && tieneFecha)) {
        
        try {
          const appointment = parseAppointment(userInput)
          
          // Si no detectó nombre válido, preguntar
          if (appointment.patient === 'Paciente') {
            response = '👤 ¿Cuál es el nombre del paciente?\n\n' +
                      `He detectado:\n` +
                      `📅 Fecha: ${appointment.date}\n` +
                      `🕐 Hora: ${appointment.time}\n` +
                      `📋 Motivo: ${appointment.reason}`
            
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: response,
              pendingAppointment: appointment // Guardar para completar después
            }])
            setIsTyping(false)
            return
          }
          
          // Verificar si el horario está disponible
          if (!isTimeAvailable(appointment.date, appointment.time)) {
            const availableSlots = getAvailableSlots(appointment.date)
            
            if (availableSlots.length === 0) {
              response = '❌ Lo siento, no hay horarios disponibles para ese día.\n\n' +
                        '¿Te gustaría ver disponibilidad para otro día?'
            } else {
              response = `⚠️ El horario ${appointment.time} no está disponible.\n\n` +
                        `✅ Horarios disponibles para ${appointment.date}:\n` +
                        availableSlots.slice(0, 8).map(slot => `• ${slot}`).join('\n') +
                        (availableSlots.length > 8 ? '\n\n...y más horarios disponibles' : '')
            }
            setMessages(prev => [...prev, { role: 'assistant', content: response }])
            setIsTyping(false)
            return
          }
          
          response = `✅ Perfecto! Tenemos disponibilidad:\n\n` +
                    `👤 Paciente: ${appointment.patient}\n` +
                    `📅 Fecha: ${appointment.date}\n` +
                    `🕐 Hora: ${appointment.time}\n` +
                    `📋 Motivo: ${appointment.reason}\n\n` +
                    `¿Confirmo esta cita? (Responde "sí" para confirmar)`
          
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: response,
            appointmentData: appointment
          }])
          setIsTyping(false)
          return
        } catch (error) {
          response = 'Lo siento, no pude entender los detalles de la cita. ¿Podrías especificar:\n• Nombre del paciente\n• Fecha (ej: "mañana", "lunes", "31")\n• Hora (ej: "3pm", "15:00", "2 de la tarde")\n\nEjemplo: "Cita para Juan mañana a las 10am"'
        }
        
        setMessages(prev => [...prev, { role: 'assistant', content: response }])
        setIsTyping(false)
        return
      } 
      
      // PRIORIDAD 3: Consultar disponibilidad
      if (lowerInput.includes('disponibilidad') || lowerInput.includes('disponible') ||
          (lowerInput.includes('horario') && !tienePalabrasClave)) {
        
        // Extraer fecha si se menciona
        let date = new Date()
        if (lowerInput.includes('mañana')) {
          date.setDate(date.getDate() + 1)
        } else if (lowerInput.includes('hoy')) {
          // Mantener fecha actual
        }
        
        const dateStr = date.toISOString().split('T')[0]
        const availableSlots = getAvailableSlots(dateStr)
        
        if (availableSlots.length === 0) {
          response = '❌ No hay horarios disponibles para ese día.\n\n' +
                    '🏥 Horarios de atención:\n' +
                    '• Lun-Sáb: 8:00 AM - 8:00 PM\n' +
                    '• Domingo: 8:00 AM - 5:00 PM\n\n' +
                    '¿Te gustaría consultar otro día?'
        } else {
          const dayName = date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
          response = `📅 Horarios disponibles para ${dayName}:\n\n` +
                    availableSlots.slice(0, 12).map((slot, idx) => {
                      const hour = parseInt(slot.split(':')[0])
                      const period = hour < 12 ? 'AM' : 'PM'
                      const displayHour = hour > 12 ? hour - 12 : hour
                      return `${idx + 1}. ${displayHour}:${slot.split(':')[1]} ${period}`
                    }).join('\n') +
                    (availableSlots.length > 12 ? '\n\n...y más horarios disponibles' : '') +
                    '\n\n¿Cuál prefieres?'
        }
        
        setMessages(prev => [...prev, { role: 'assistant', content: response }])
        setIsTyping(false)
        return
      } 
      
      // PRIORIDAD 4: Cancelar cita
      if (lowerInput.includes('cancelar') || lowerInput.includes('eliminar')) {
        response = '❌ Para cancelar una cita:\n\n' +
                  '1. Ve a la lista de citas en la pantalla principal\n' +
                  '2. Haz clic en el botón de eliminar (🗑️) de la cita\n\n' +
                  '¿Necesitas ayuda con algo más?'
        setMessages(prev => [...prev, { role: 'assistant', content: response }])
        setIsTyping(false)
        return
      } 
      
      // PRIORIDAD 5: Ver citas agendadas
      if (lowerInput.includes('citas') && (lowerInput.includes('agendadas') || 
                 lowerInput.includes('tengo') || lowerInput.includes('hay'))) {
        const today = new Date().toISOString().split('T')[0]
        const upcomingAppointments = existingEvents
          .filter(event => event.start.split('T')[0] >= today)
          .slice(0, 5)
        
        if (upcomingAppointments.length === 0) {
          response = '📋 No tienes citas próximas agendadas.\n\n¿Quieres agendar una nueva cita?'
        } else {
          response = '📋 Próximas citas:\n\n' +
                    upcomingAppointments.map((event, idx) => {
                      const date = new Date(event.start)
                      const dateStr = date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })
                      const timeStr = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
                      return `${idx + 1}. ${event.title}\n   📅 ${dateStr} a las ${timeStr}`
                    }).join('\n\n')
        }
        
        setMessages(prev => [...prev, { role: 'assistant', content: response }])
        setIsTyping(false)
        return
      } 
      
      // PRIORIDAD 6: Saludos
      if (lowerInput.includes('hola') || lowerInput.includes('buenos') || lowerInput.includes('buenas')) {
        response = '¡Hola! 👋 ¿En qué puedo ayudarte hoy?\n\n' +
                  'Puedo:\n' +
                  '• Agendar citas\n' +
                  '• Mostrar horarios disponibles\n' +
                  '• Consultar citas agendadas'
        setMessages(prev => [...prev, { role: 'assistant', content: response }])
        setIsTyping(false)
        return
      } 
      
      // PRIORIDAD 7: Agradecimientos
      if (lowerInput.includes('gracias')) {
        response = '¡De nada! 😊 Estoy aquí para ayudarte.\n\n¿Necesitas algo más?'
        setMessages(prev => [...prev, { role: 'assistant', content: response }])
        setIsTyping(false)
        return
      } 
      
      // DEFAULT: Ayuda general
      response = '💡 Puedo ayudarte con:\n\n' +
                '• "Agendar cita para [nombre] [día] a las [hora]"\n' +
                '• "¿Qué disponibilidad hay mañana?"\n' +
                '• "¿Qué citas tengo agendadas?"\n\n' +
                '🏥 Horarios de atención:\n' +
                '• Lunes a Sábado: 8:00 AM - 8:00 PM\n' +
                '• Domingo: 8:00 AM - 5:00 PM'

      setMessages(prev => [...prev, { role: 'assistant', content: response }])
      setIsTyping(false)
    }, 1000)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <button 
        className="chat-fab"
        onClick={() => setIsOpen(!isOpen)}
        title="Asistente Virtual"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Ventana del chat */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div>
              <h3>🤖 Asistente Virtual</h3>
              <p>Consultorio Médico</p>
            </div>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <div className="message-bubble">
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message assistant">
                <div className="message-bubble typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
            />
            <button onClick={handleSend} disabled={!input.trim()}>
              Enviar
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatAssistant
