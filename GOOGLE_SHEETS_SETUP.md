
# Google Sheets Setup - Problema de Permisos de Escritura

## Problema Actual

La aplicación puede **leer** eventos desde Google Sheets pero **no puede escribir** nuevos eventos. Esto se debe a que la API key actual (`AIzaSyBFupSOezwzthb-vvb3PgTcYf1GrTa3rsc`) solo tiene permisos de lectura.

## Error que aparece

```
Response status 401: API key no tiene permisos de escritura
```

## ¿Por qué sucede esto?

Las API keys de Google Sheets solo permiten acceso de **lectura** a hojas públicas. Para **escribir** datos, Google requiere autenticación más segura.

## Soluciones Posibles

### Opción 1: Cuenta de Servicio (Recomendada)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google Sheets
4. Ve a "Credenciales" → "Crear credenciales" → "Cuenta de servicio"
5. Descarga el archivo JSON de credenciales
6. En tu Google Sheet, comparte la hoja con el email de la cuenta de servicio
7. Actualiza el código para usar las credenciales de servicio

### Opción 2: OAuth 2.0

1. Configura OAuth 2.0 en Google Cloud Console
2. Implementa el flujo de autenticación en la app
3. Los usuarios deberán autorizar el acceso a sus hojas

### Opción 3: Usar Google Apps Script (Alternativa)

1. Crea un Google Apps Script que actúe como API
2. El script puede escribir a la hoja
3. La app hace llamadas HTTP al script

## Estado Actual

- ✅ **Lectura**: Funciona perfectamente
- ❌ **Escritura**: Bloqueada por permisos
- ✅ **Almacenamiento local**: Funciona como respaldo

## Mientras tanto...

Los eventos se guardan **localmente** en el dispositivo y se pueden leer desde Google Sheets. Cuando se resuelva el problema de permisos, los eventos locales se pueden sincronizar con la hoja.

## Archivos Afectados

- `utils/googleSheets.ts` - Manejo de la API
- `utils/storage.ts` - Lógica de respaldo local
- `app/schedule.tsx` - Interfaz de guardado
- `app/index.tsx` - Diagnósticos

## Diagnósticos

Usa el botón "🔧 Probar Conexión" en la app para ver el estado actual de Google Sheets.
