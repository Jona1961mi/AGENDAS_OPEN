// Configura aquí tus credenciales de Google Cloud Console
// 1. Ve a https://console.cloud.google.com/
// 2. Crea un proyecto
// 3. Habilita Google Calendar API
// 4. Crea credenciales OAuth 2.0
// 5. Añade http://localhost:3000 a las URIs autorizadas
// 6. Agrega las credenciales al archivo .env (NO compartir .env en Git)

export const GOOGLE_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  API_KEY: import.meta.env.VITE_GOOGLE_API_KEY,
  DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
  SCOPES: 'https://www.googleapis.com/auth/calendar.events'
}
