# 🏥 Sistema de Agenda - Instrucciones de Uso

## 📋 Cómo funciona

### 🔓 Vista Pública (Pacientes)
**URL:** `http://localhost:3000/`

- Los pacientes pueden agendar citas SIN cuenta
- Solo usan el chatbot
- No ven las citas de otros pacientes
- Solo escriben su nombre, fecha y hora
- Las citas se guardan automáticamente en el sistema

### 🔐 Vista Admin (Tú)
**URL:** `http://localhost:3000/admin`

- Requiere contraseña: `123456789`
- Ves TODAS las citas agendadas (conectado o no a Google)
- Puedes cancelar citas
- Estadísticas: Total citas, hoy, esta semana
- **Google Calendar es OPCIONAL**: las citas se guardan en el sistema automáticamente

---

## 🔗 Conexión con Google Calendar (OPCIONAL)

### 📌 Las citas se guardan SIEMPRE en el sistema

- **Sin Google Calendar:** Las citas se guardan en MongoDB y las ves en el panel
- **Con Google Calendar:** Además se sincronizan con tu calendario de Google

### Conectar Google Calendar:

1. Inicia sesión como admin (contraseña: 123456789)
2. Haz clic en **"Conectar Google Calendar"**
3. Selecciona tu cuenta de Google
4. Acepta los permisos
5. ✅ Verás tu email conectado: `📧 tucorreo@gmail.com`

### ⚡ Persistencia de sesión:

- **Sesión de Admin:** Se cierra al hacer clic en "Cerrar Sesión Admin"
- **Sesión de Google:** Se mantiene hasta hacer clic en "Desconectar Google Calendar"
- Puedes cerrar sesión de admin y la conexión de Google se mantiene
- Al volver a entrar como admin, Google seguirá conectado

### Botones:

- **🔌 Desconectar Google Calendar**: Solo desconecta Google, sigues como admin
- **🚪 Cerrar Sesión Admin**: Sales del panel admin (Google queda conectado)

---

## 🚀 Iniciar el sistema

### Paso 1: Iniciar MongoDB
- Abre **MongoDB Compass**
- Conéctate a: `mongodb://localhost:27017`
- Se creará automáticamente la base `consultorio`

### Paso 2: Iniciar Backend
```bash
npm run server
```

### Paso 3: Iniciar Frontend (en otra terminal)
```bash
npm run dev
```

### O ambos a la vez:
```bash
npm run dev:full
```

---

## 🔑 Contraseña de administrador

**Contraseña:** `123456789`

Esta contraseña está configurada en el sistema y no se muestra en la pantalla de login por seguridad.

---

## 📊 Base de datos MongoDB

**Ubicación:** `consultorio.citas`

**Estructura de cada cita:**
```json
{
  "_id": "ObjectId automático",
  "paciente": "Nombre del paciente",
  "fecha": "2025-12-31",
  "hora": "14:00",
  "motivo": "Consulta general",
  "googleEventId": "ID de Google Calendar (opcional)",
  "createdAt": "2025-12-31T10:00:00Z"
}
```

---

## ✅ Funcionalidades

### Pacientes pueden:
- ✅ Agendar citas usando IA
- ✅ Ver horarios disponibles
- ✅ Escribir en lenguaje natural ("cita para Juan mañana a las 2pm")

### Admin puede:
- ✅ Ver todas las citas (con o sin Google)
- ✅ Cancelar citas
- ✅ Ver estadísticas
- ✅ Sincronizar opcionalmente con Google Calendar
- ✅ Usar chatbot para agendar también

---

## 🌐 Compartir con pacientes

### En tu computadora (localhost):
1. Comparte: `http://localhost:3000/`
2. Solo funciona en tu red local

### Para compartir en internet:

#### Opción A: ngrok (Más fácil - Gratis)
```bash
# Instalar ngrok: https://ngrok.com/download
ngrok http 3000
```
Te dará una URL pública: `https://abc123.ngrok.io`
Comparte esa URL con tus pacientes

#### Opción B: Vercel/Netlify (Deploy completo)
```bash
npm run build
# Subir a Vercel o Netlify
```

---

## 📞 URLs importantes

| Ruta | Descripción | Requiere login |
|------|-------------|----------------|
| `/` | Vista pública para pacientes | ❌ No |
| `/admin` | Panel de administración | ✅ Sí |
