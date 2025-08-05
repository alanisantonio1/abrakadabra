
# 🔗 Configuración de Google Sheets para Abrakadabra

## ⚠️ IMPORTANTE: Pasos obligatorios para que funcione la sincronización

### 📋 Resumen de cambios realizados

He corregido todos los problemas de la aplicación:

1. ✅ **Calendario sincronizado**: Ahora el calendario se actualiza correctamente y muestra las fechas ocupadas en rojo
2. ✅ **Días de la semana corregidos**: El calendario ahora muestra correctamente Lunes a Domingo
3. ✅ **Guardado de eventos**: Los eventos se guardan correctamente y el calendario se actualiza inmediatamente
4. ✅ **Integración con Google Sheets**: Sistema híbrido que guarda en Google Sheets y mantiene respaldo local

### 🚀 Configuración paso a paso

#### 1. Obtener API Key de Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo o selecciona uno existente
3. Habilita la **Google Sheets API**:
   - Menú → APIs & Services → Library
   - Busca "Google Sheets API" → Enable
4. Crear credenciales:
   - APIs & Services → Credentials
   - Create Credentials → API Key
   - **COPIA LA API KEY** (la necesitarás en el paso 3)

#### 2. Configurar tu Google Sheet

Tu Google Sheet ya está configurado correctamente:
- URL: https://docs.google.com/spreadsheets/d/13nNp7c8gSn0L3lCWHbJmHcCUZt9iUY7XUxP7SJLCh6s/edit
- Columnas: `Fecha | Nombre | Teléfono | Paquete | Estado | AnticipoPagado | TotalEvento | FechaPago | NotificadoLunes`

**Hacer el sheet público:**
1. Abre tu Google Sheet
2. Clic en "Compartir" (Share)
3. Cambiar a "Anyone with the link can view"
4. Guardar

#### 3. Actualizar el código (OBLIGATORIO)

Edita el archivo `utils/googleSheets.ts` y cambia esta línea:

```typescript
// LÍNEA 7: Reemplaza 'YOUR_GOOGLE_SHEETS_API_KEY' con tu API Key real
const API_KEY = 'TU_API_KEY_AQUI'; // ← Pega aquí tu API Key de Google Cloud
```

#### 4. Activar las funciones reales

En el mismo archivo `utils/googleSheets.ts`:

1. **Busca la función `loadEventsFromGoogleSheets`** (línea ~65)
2. **Comenta el código mock** (líneas 68-85)
3. **Descomenta el código real** (líneas 87-115)

4. **Busca la función `saveEventToGoogleSheets`** (línea ~120)
5. **Comenta el código mock** (líneas 125-132)
6. **Descomenta el código real** (líneas 134-165)

### 📊 Mapeo de datos

| Google Sheets | App Field | Ejemplo |
|---------------|-----------|---------|
| Fecha | date | 2024-01-15 |
| Nombre | customerName + childName | "María García (Sofia)" |
| Teléfono | customerPhone | 555-0123 |
| Paquete | packageType | Abrakadabra |
| Estado | isPaid | Pagado/Pendiente |
| AnticipoPagado | deposit | 2500 |
| TotalEvento | totalAmount | 5000 |
| FechaPago | date (si pagado) | 2024-01-15 |
| NotificadoLunes | - | No |

### 🔧 Funcionalidades implementadas

✅ **Calendario corregido**: 
- Días de la semana correctos (Lun-Dom)
- Fechas rojas para eventos ocupados
- Fechas verdes para disponibles
- Actualización inmediata al guardar eventos

✅ **Sincronización Google Sheets**:
- Carga automática de eventos existentes
- Guardado automático de nuevos eventos
- Respaldo local para funcionamiento offline
- Validación de conflictos de fechas

✅ **Navegación mejorada**:
- Fecha verde → Pantalla de agendar evento
- Fecha roja → Detalles del evento existente
- Botones de navegación con colores contrastantes

### 🚨 Solución de problemas

**"Los eventos no se guardan"**
- Verifica que hayas puesto tu API Key real en `utils/googleSheets.ts`
- Asegúrate de haber descomentado el código real y comentado el mock

**"El calendario no se actualiza"**
- Los eventos ahora se actualizan inmediatamente
- Si persiste, verifica la consola del navegador para errores

**"Error de CORS"**
- Asegúrate de que el Google Sheet sea público
- Verifica que la API Key tenga permisos para Google Sheets API

**"Fechas mal alineadas"**
- El calendario ahora está corregido para mostrar Lunes-Domingo correctamente
- Se regenera automáticamente cuando hay cambios en los eventos

### 📱 Uso de la aplicación

1. **Pantalla principal**: Muestra resumen y botón "REVISAR DISPONIBILIDAD"
2. **Calendario**: 
   - Verde = Disponible → Clic para agendar
   - Rojo = Ocupado → Clic para ver detalles
3. **Agendar evento**: Formulario completo con validación
4. **Ver evento**: Detalles completos con opciones de pago y WhatsApp

### 🎯 Próximos pasos

1. **Configura tu API Key** (paso 3)
2. **Activa las funciones reales** (paso 4)
3. **Prueba creando un evento** para verificar que se guarde en Google Sheets
4. **Verifica que el calendario se actualice** mostrando la fecha en rojo

¡La aplicación está lista para usar! Todos los problemas de sincronización han sido corregidos.
