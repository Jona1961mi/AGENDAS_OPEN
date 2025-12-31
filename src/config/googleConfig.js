// Configura aquí tus credenciales de Google Cloud Console
// 1. Ve a https://console.cloud.google.com/
// 2. Crea un proyecto
// 3. Habilita Google Calendar API
// 4. Crea credenciales OAuth 2.0
// 5. Añade http://localhost:3000 a las URIs autorizadas

export const GOOGLE_CONFIG = {
  CLIENT_ID: '1003444819986-83tfgpp1l26o1sepvent1o4kphfbblqh.apps.googleusercontent.com',
  API_KEY: 'AIzaSyAOyOfzjv-hQ8AJIW6auNd-Jnj3sGH1QfE',
  DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
  SCOPES: 'https://www.googleapis.com/auth/calendar.events'
}
