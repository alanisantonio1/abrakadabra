
# Configuración OAuth2 para Google Sheets

## Problema Actual
Tu API key actual (`AIzaSyBFupSOezwzthb-vvb3PgTcYf1GrTa3rsc`) solo tiene permisos de **lectura**. Para escribir datos a Google Sheets necesitas configurar OAuth2 con una cuenta de servicio.

## Tu OAuth2 Client ID
Tienes el Client ID: `107978395627832723470`

## Pasos para Configurar OAuth2 Completo

### 1. Ir a Google Cloud Console
- Ve a [Google Cloud Console](https://console.cloud.google.com)
- Selecciona tu proyecto o crea uno nuevo

### 2. Habilitar APIs
- Ve a "APIs y servicios" > "Biblioteca"
- Busca y habilita "Google Sheets API"
- Busca y habilita "Google Drive API" (opcional, para mejor integración)

### 3. Crear Cuenta de Servicio
- Ve a "APIs y servicios" > "Credenciales"
- Haz clic en "Crear credenciales" > "Cuenta de servicio"
- Completa los detalles:
  - Nombre: `abrakadabra-sheets-service`
  - ID: `abrakadabra-sheets-service`
  - Descripción: `Cuenta de servicio para escribir eventos en Google Sheets`

### 4. Generar Clave JSON
- Una vez creada la cuenta de servicio, haz clic en ella
- Ve a la pestaña "Claves"
- Haz clic en "Agregar clave" > "Crear nueva clave"
- Selecciona "JSON" y descarga el archivo

### 5. Compartir Google Sheets
- Abre tu Google Sheet: `EVENTO`
- Haz clic en "Compartir"
- Agrega el email de la cuenta de servicio (se ve así):
  ```
  abrakadabra-sheets-service@tu-proyecto.iam.gserviceaccount.com
  ```
- Dale permisos de "Editor"

### 6. Configurar Credenciales en la App

El archivo JSON descargado contiene algo así:
```json
{
  "type": "service_account",
  "project_id": "tu-proyecto-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "abrakadabra-sheets-service@tu-proyecto.iam.gserviceaccount.com",
  "client_id": "107978395627832723470",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
}
```

### 7. Actualizar Configuración
Necesitas proporcionar estos valores del archivo JSON:
- `project_id`
- `private_key_id`
- `private_key`
- `client_email`

## Alternativa Temporal: Supabase
Mientras configuras OAuth2, puedes usar Supabase como base de datos:
- Es más fácil de configurar
- Tiene mejor control de permisos
- Funciona offline
- Se puede sincronizar con Google Sheets después

## Verificación
Una vez configurado, la app podrá:
- ✅ Leer eventos desde Google Sheets
- ✅ Escribir nuevos eventos
- ✅ Actualizar eventos existentes
- ✅ Eliminar eventos

## Seguridad
- Las credenciales de servicio deben mantenerse seguras
- No las subas a repositorios públicos
- Usa variables de entorno en producción
