
# Configuración de Google Sheets para Abrakadabra

## Pasos para configurar la integración con Google Sheets

### 1. Preparar la Hoja de Cálculo

Tu hoja de Google Sheets debe tener exactamente estas columnas en la primera fila (fila 1):

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Fecha | Nombre | Teléfono | Paquete | Estado | AnticipoPagado | TotalEvento | FechaPago | NotificadoLunes |

**Importante:** Los nombres de las columnas deben ser exactamente como se muestran arriba.

### 2. Hacer la Hoja Pública

1. Abre tu hoja de Google Sheets
2. Haz clic en "Compartir" (botón azul en la esquina superior derecha)
3. En "Obtener enlace", cambia de "Restringido" a "Cualquier persona con el enlace"
4. Asegúrate de que el permiso sea "Lector" (no "Editor")
5. Copia el enlace compartido

### 3. Obtener el ID de la Hoja

Del enlace de tu hoja, extrae el ID. Por ejemplo:
- Enlace: `https://docs.google.com/spreadsheets/d/13nNp7c8gSn0L3lCWHbJmHcCUZt9iUY7XUxP7SJLCh6s/edit`
- ID: `13nNp7c8gSn0L3lCWHbJmHcCUZt9iUY7XUxP7SJLCh6s`

### 4. Configurar la API Key

**IMPORTANTE:** La API key que proporcionaste (`8aff616a2f0872fb097d6217fa4685715601daf5`) no parece ser una API key válida de Google. 

Para obtener una API key válida:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google Sheets:
   - Ve a "APIs y servicios" > "Biblioteca"
   - Busca "Google Sheets API"
   - Haz clic en "Habilitar"
4. Crea credenciales:
   - Ve a "APIs y servicios" > "Credenciales"
   - Haz clic en "Crear credenciales" > "Clave de API"
   - Copia la clave generada

### 5. Verificar la Configuración

Una vez que tengas la API key correcta, actualiza el archivo `utils/googleSheets.ts`:

```typescript
const API_KEY = 'TU_API_KEY_AQUI'; // Reemplaza con tu API key real
```

### 6. Probar la Conexión

1. Abre la aplicación
2. Ve a "REVISAR DISPONIBILIDAD"
3. Intenta agendar un evento
4. Verifica que aparezca en tu hoja de Google Sheets

### Formato de Datos en la Hoja

Los datos se guardarán en este formato:

- **Fecha**: YYYY-MM-DD (ej: 2024-01-15)
- **Nombre**: "Nombre Cliente (Nombre Niño)" (ej: "María García (Sofia)")
- **Teléfono**: Número de teléfono del cliente
- **Paquete**: Abra, Kadabra, o Abrakadabra
- **Estado**: Pendiente o Pagado
- **AnticipoPagado**: Cantidad numérica del anticipo
- **TotalEvento**: Cantidad numérica total del evento
- **FechaPago**: Fecha de pago (si está pagado)
- **NotificadoLunes**: No (por defecto)

### Solución de Problemas

Si la sincronización no funciona:

1. **Verifica que la hoja sea pública** - Debe ser accesible con el enlace
2. **Confirma la API key** - Debe ser una clave válida de Google Cloud
3. **Revisa los nombres de columnas** - Deben coincidir exactamente
4. **Verifica la consola** - Busca errores en los logs de la aplicación

### Limitaciones Actuales

- La aplicación puede leer y escribir datos
- Para eliminar eventos, se limpia el contenido de la fila (no se elimina la fila)
- Los datos se sincronizan cuando abres la aplicación
- Se mantiene una copia local como respaldo

### Próximos Pasos

Una vez que la API key esté configurada correctamente, la aplicación debería:
1. Cargar eventos existentes de la hoja al abrir
2. Guardar nuevos eventos automáticamente
3. Mostrar el estado correcto en el calendario (verde/rojo)
