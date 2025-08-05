
# Configuración de Google Sheets para Abrakadabra

## Pasos para conectar la aplicación con Google Sheets

### 1. Preparar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google Sheets:
   - Ve a "APIs & Services" > "Library"
   - Busca "Google Sheets API"
   - Haz clic en "Enable"

### 2. Crear credenciales de API

1. Ve a "APIs & Services" > "Credentials"
2. Haz clic en "Create Credentials" > "API Key"
3. Copia la API Key generada
4. (Opcional) Restringe la API Key para mayor seguridad:
   - Haz clic en la API Key creada
   - En "Application restrictions", selecciona "HTTP referrers"
   - Agrega tu dominio
   - En "API restrictions", selecciona "Google Sheets API"

### 3. Configurar tu Google Sheet

1. Abre tu Google Sheet: https://docs.google.com/spreadsheets/d/13nNp7c8gSn0L3lCWHbJmHcCUZt9iUY7XUxP7SJLCh6s/edit
2. Asegúrate de que la primera fila tenga exactamente estos encabezados:
   ```
   Fecha | Nombre | Teléfono | Paquete | Estado | AnticipoPagado | TotalEvento | FechaPago | NotificadoLunes
   ```
3. Haz el sheet público para lectura:
   - Haz clic en "Share" (Compartir)
   - Cambia a "Anyone with the link can view"
   - Copia el link del sheet

### 4. Actualizar el código de la aplicación

Edita el archivo `utils/googleSheets.ts` y actualiza estas variables:

```typescript
// Reemplaza con tu API Key de Google Cloud
const API_KEY = 'TU_API_KEY_AQUI';

// Reemplaza con el ID de tu Google Sheet (ya está configurado)
const SPREADSHEET_ID = '13nNp7c8gSn0L3lCWHbJmHcCUZt9iUY7XUxP7SJLCh6s';
```

### 5. Activar las funciones reales

En el archivo `utils/googleSheets.ts`, descomenta las secciones marcadas como "Real implementation" y comenta las secciones "Mock implementation".

### 6. Estructura de datos en Google Sheets

La aplicación mapea los datos de la siguiente manera:

| Columna Google Sheets | Campo en la App | Descripción |
|----------------------|-----------------|-------------|
| Fecha | date | Fecha del evento (YYYY-MM-DD) |
| Nombre | customerName + childName | "Nombre Cliente (Nombre Niño)" |
| Teléfono | customerPhone | Número de WhatsApp |
| Paquete | packageType | Abra, Kadabra, o Abrakadabra |
| Estado | isPaid | "Pagado" o "Pendiente" |
| AnticipoPagado | deposit | Monto del anticipo |
| TotalEvento | totalAmount | Monto total del evento |
| FechaPago | date (si está pagado) | Fecha de pago completo |
| NotificadoLunes | - | "Sí" o "No" para recordatorios |

### 7. Permisos y seguridad

Para mayor seguridad, considera:

1. **Restricciones de API Key**: Limita el uso de la API Key a tu dominio específico
2. **Service Account**: Para aplicaciones en producción, usa Service Account en lugar de API Key
3. **Validación de datos**: La app valida los datos antes de enviarlos a Google Sheets

### 8. Solución de problemas

**Error de CORS**: Si encuentras errores de CORS, asegúrate de que:
- La API Key esté configurada correctamente
- El Google Sheet sea público para lectura
- Las restricciones de la API Key incluyan tu dominio

**Datos no se guardan**: Verifica que:
- El ID del spreadsheet sea correcto
- Los encabezados de las columnas coincidan exactamente
- La API Key tenga permisos para Google Sheets API

**Formato de fecha**: Las fechas deben estar en formato YYYY-MM-DD (ej: 2024-01-15)

### 9. Funcionalidades implementadas

✅ **Lectura de eventos**: La app carga eventos existentes desde Google Sheets
✅ **Guardado de eventos**: Nuevos eventos se agregan automáticamente
✅ **Sincronización**: Los datos se sincronizan al abrir la app
✅ **Respaldo local**: Los datos se guardan localmente como respaldo
✅ **Validación**: Se valida que no haya conflictos de fechas/horas

### 10. Próximos pasos

Una vez configurado, la aplicación:
- Cargará eventos existentes de tu Google Sheet
- Guardará nuevos eventos automáticamente
- Mantendrá sincronización entre la app y la hoja de cálculo
- Mostrará el calendario actualizado en tiempo real
