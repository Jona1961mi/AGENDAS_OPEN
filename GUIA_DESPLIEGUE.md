# 📘 Guía Completa de Despliegue

## 🎯 Arquitectura del Proyecto

Tu proyecto necesita 3 servicios separados:

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   FRONTEND      │─────▶│     BACKEND      │─────▶│    BASE DATOS   │
│   (Vercel)      │      │    (Render)      │      │ (MongoDB Atlas) │
│   React + Vite  │      │   Express API    │      │                 │
└─────────────────┘      └──────────────────┘      └─────────────────┘
```

---

## 📦 PASO 1: Configurar MongoDB Atlas (Base de Datos)

### 1.1 Crear cuenta
1. Ve a: https://www.mongodb.com/cloud/atlas/register
2. Crea una cuenta gratuita
3. Inicia sesión

### 1.2 Crear un cluster
1. Click en **"Create"** o **"Build a Database"**
2. Selecciona **"M0 FREE"** (512MB gratis)
3. Elige región más cercana (ejemplo: AWS - N. Virginia)
4. Click en **"Create Cluster"**

### 1.3 Configurar acceso
1. **Crear usuario de base de datos:**
   - Ve a **Database Access** (menú izquierdo)
   - Click **"Add New Database User"**
   - Username: `admin` (o el que quieras)
   - Password: Genera una contraseña segura (¡GUÁRDALA!)
   - Database User Privileges: **Read and write to any database**
   - Click **"Add User"**

2. **Permitir acceso desde cualquier IP:**
   - Ve a **Network Access** (menú izquierdo)
   - Click **"Add IP Address"**
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Click **"Confirm"**

### 1.4 Obtener cadena de conexión
1. Ve a **Database** (menú izquierdo)
2. Click en **"Connect"** en tu cluster
3. Selecciona **"Drivers"**
4. Tu cadena de conexión es:
   ```
   mongodb+srv://jonathancansinoperez_db_user:<db_password>@cluster0.7b8b8e2.mongodb.net/?appName=Cluster0
   ```
5. **Reemplaza `<db_password>` con tu contraseña real**
6. **Agrega el nombre de la base de datos** (`/consultorio`) antes de `?appName`:
   ```
   mongodb+srv://jonathancansinoperez_db_user:TU_CONTRASEÑA@cluster0.7b8b8e2.mongodb.net/consultorio?appName=Cluster0
   ```
   
⚠️ **Si tu contraseña tiene caracteres especiales, codifícalos:**
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `:` → `%3A`

Ejemplo: Si tu contraseña es `Pass@123`, usa: `Pass%40123`

---

## 🚀 PASO 2: Desplegar Backend en Render

### 2.1 Crear cuenta
1. Ve a: https://render.com
2. Regístrate con tu cuenta de GitHub
3. Autoriza a Render para acceder a tus repositorios

### 2.2 Crear Web Service
1. Click en **"New +"** → **"Web Service"**
2. Conecta tu repositorio: **AGENDAS_OPEN**
3. Configura el servicio:
   - **Name**: `agendas-backend` (o el nombre que quieras)
   - **Region**: Oregon (o la más cercana)
   - **Branch**: `main`
   - **Root Directory**: Dejar vacío
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: **Free** (gratis)

### 2.3 Configurar variables de entorno
En la sección **Environment Variables**, agrega:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Tu cadena de MongoDB Atlas (del paso 1.4) |
| `PORT` | `5000` |
| `NODE_ENV` | `production` |

### 2.4 Desplegar
1. Click en **"Create Web Service"**
2. Espera 5-10 minutos mientras despliega
3. ✅ **Tu backend está en:** `https://agendas-open.onrender.com`

### 2.5 Verificar que funciona
Abre en el navegador: https://agendas-open.onrender.com/api/citas
Deberías ver un array JSON (probablemente vacío `[]`)

---

## 🌐 PASO 3: Configurar Frontend en Vercel

### 3.1 Variables de entorno en Vercel
1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto **agendas-open**
3. Ve a **Settings** → **Environment Variables**
4. Agrega estas variables:

| Variable | Valor |
|----------|-------|
| `VITE_GOOGLE_CLIENT_ID` | Tu Client ID de Google Cloud |
| `VITE_GOOGLE_API_KEY` | Tu API Key de Google |
| `VITE_API_URL` | URL de tu backend en Render |

Ejemplo:
```
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXX
VITE_API_URL=https://agendas-open.onrender.com
```

### 3.2 Actualizar código para usar la API
Necesitas actualizar tu código para usar `VITE_API_URL` en vez de `localhost:5000`

### 3.3 Redesplegar
1. Ve a tu proyecto en Vercel
2. Click en **Deployments**
3. Click en los 3 puntos de la última deployment → **Redeploy**

---

## 🔑 PASO 4: Configurar Google Calendar API

### 4.1 Google Cloud Console
1. Ve a: https://console.cloud.google.com/
2. Selecciona tu proyecto o crea uno nuevo
3. Ve a **APIs & Services** → **Credentials**

### 4.2 Actualizar URIs autorizados
En tu **OAuth 2.0 Client ID**, agrega estos URIs:

**JavaScript origins:**
```
http://localhost:5173
https://agendas-open.vercel.app
```

**Redirect URIs:**
```
http://localhost:5173
https://agendas-open.vercel.app
```

---

## ✅ VERIFICACIÓN FINAL

### Checklist:
- [ ] MongoDB Atlas funcionando y usuario creado
- [ ] Backend en Render desplegado y respondiendo
- [ ] Variables de entorno en Vercel configuradas
- [ ] Google Calendar API con dominios autorizados
- [ ] Frontend en Vercel accesible

### URLs finales:
- Frontend: `https://agendas-open.vercel.app`
- Backend: `https://agendas-open.onrender.com` ✅
- MongoDB: En la nube (MongoDB Atlas) ✅

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"
- Verifica que la IP 0.0.0.0/0 esté permitida en MongoDB Atlas
- Verifica que el usuario y contraseña sean correctos en MONGODB_URI
- Asegúrate de reemplazar `<password>` en la cadena de conexión

### Error: "API request failed"
- Verifica que VITE_API_URL esté configurado correctamente
- Verifica que el backend en Render esté corriendo (verde)
- Revisa los logs en Render → **Logs**

### Backend en Render se duerme
- El plan gratuito se duerme después de 15 minutos de inactividad
- La primera petición tomará 30-60 segundos en despertar
- Considera usar un servicio de "ping" o actualizar a plan pagado

### Error de CORS
- Verifica que el backend tenga `cors()` configurado
- En Render, asegúrate de que el servicio esté corriendo

---

## 💰 Costos

| Servicio | Plan | Costo | Límites |
|----------|------|-------|---------|
| MongoDB Atlas | M0 | **GRATIS** | 512MB storage |
| Render | Free | **GRATIS** | Se duerme tras 15min inactividad |
| Vercel | Hobby | **GRATIS** | 100GB bandwidth/mes |
| **TOTAL** | | **$0/mes** | |

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Render
2. Revisa la consola del navegador (F12)
3. Verifica que todas las variables de entorno estén configuradas
4. Consulta la documentación oficial de cada servicio

---

✨ **¡Listo! Tu aplicación estará funcionando en producción de forma gratuita.**
