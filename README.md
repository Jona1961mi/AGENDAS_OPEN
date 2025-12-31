# 📅 Agenda Google Calendar

Aplicación web de agenda integrada con Google Calendar usando React.

## 🚀 Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Google Calendar API

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Habilita la **Google Calendar API**
4. Ve a **Credenciales** → **Crear credenciales** → **ID de cliente OAuth 2.0**
5. Configura la pantalla de consentimiento
6. En URIs de redirección autorizados, añade: `http://localhost:3000`
7. Copia el **Client ID** y **API Key**

### 3. Configurar variables de entorno

**⚠️ IMPORTANTE: Las claves están protegidas en variables de entorno**

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Edita `.env` y agrega tus credenciales de Google:
```env
VITE_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=tu-api-key
```

**🔒 Seguridad:**
- El archivo `.env` está en `.gitignore` y **NUNCA se sube a Git**
- Las credenciales se cargan automáticamente desde variables de entorno
- Para producción, configura estas variables en tu plataforma de hosting

### 4. Ejecutar la aplicación

```bash
npm run dev
```

La aplicación se abrirá en [http://localhost:3000](http://localhost:3000)

## ✨ Funcionalidades

- ✅ Autenticación con Google
- ✅ Ver eventos del calendario
- ✅ Crear nuevos eventos
- ✅ Eliminar eventos
- ✅ Vista mensual, semanal y diaria
- ✅ Interfaz responsive

## 🛠️ Tecnologías

- React 18
- Vite
- Google Calendar API
- FullCalendar
- date-fns

## 📝 Notas

- La aplicación sincroniza automáticamente con tu Google Calendar
- Los eventos se guardan en tu calendario de Google
- Requiere conexión a internet para funcionar
