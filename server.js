import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/consultorio'

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err))

// Modelo de Cita (MongoDB genera _id automáticamente)
const citaSchema = new mongoose.Schema({
  paciente: {
    type: String,
    required: true
  },
  fecha: {
    type: String,
    required: true
  },
  hora: {
    type: String,
    required: true
  },
  motivo: {
    type: String,
    default: 'Consulta general'
  },
  googleEventId: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Cita = mongoose.model('Cita', citaSchema)

// ============================================
// RUTAS API
// ============================================

// Obtener todas las citas
app.get('/api/citas', async (req, res) => {
  try {
    const citas = await Cita.find().sort({ fecha: 1, hora: 1 })
    res.json(citas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Crear nueva cita
app.post('/api/citas', async (req, res) => {
  try {
    const { paciente, fecha, hora, motivo, googleEventId } = req.body
    
    // Validar campos requeridos
    if (!paciente || !fecha || !hora) {
      return res.status(400).json({ error: 'Faltan campos requeridos' })
    }

    const nuevaCita = new Cita({
      paciente,
      fecha,
      hora,
      motivo,
      googleEventId
    })

    await nuevaCita.save()
    console.log('✅ Cita guardada:', nuevaCita._id)
    res.status(201).json(nuevaCita)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Eliminar cita
app.delete('/api/citas/:id', async (req, res) => {
  try {
    const cita = await Cita.findByIdAndDelete(req.params.id)
    if (!cita) {
      return res.status(404).json({ error: 'Cita no encontrada' })
    }
    console.log('🗑️ Cita eliminada:', req.params.id)
    res.json({ message: 'Cita eliminada', cita })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener citas de una fecha específica
app.get('/api/citas/fecha/:fecha', async (req, res) => {
  try {
    const citas = await Cita.find({ fecha: req.params.fecha }).sort({ hora: 1 })
    res.json(citas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Verificar disponibilidad de horario
app.post('/api/citas/disponibilidad', async (req, res) => {
  try {
    const { fecha, hora } = req.body
    const citaExistente = await Cita.findOne({ fecha, hora })
    res.json({ disponible: !citaExistente })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: '🏥 API Consultorio funcionando' })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  console.log(`📊 MongoDB: ${MONGODB_URI}`)
})
