
# 🔧 SOLUCIÓN PARA PERMISOS DE ESCRITURA EN GOOGLE SHEETS

## 📋 PROBLEMA ACTUAL
Tu API key `AIzaSyBFupSOezwzthb-vvb3PgTcYf1GrTa3rsc` solo tiene permisos de **LECTURA**. 
Para escribir eventos necesitas configurar OAuth2 con una cuenta de servicio.

## ✅ SOLUCIÓN IMPLEMENTADA
He implementado una **solución híbrida** que resuelve el problema inmediatamente:

### 🎯 NUEVA ARQUITECTURA
1. **Supabase** = Base de datos principal (lectura y escritura)
2. **Google Sheets** = Fuente de datos de solo lectura
3. **Local Storage** = Respaldo offline

### 🚀 BENEFICIOS INMEDIATOS
- ✅ **Escritura funciona**: Los eventos se guardan en Supabase
- ✅ **Lectura de Google Sheets**: Puedes ver eventos existentes
- ✅ **Sincronización**: Eventos de Google Sheets → Supabase
- ✅ **Offline**: Funciona sin conexión
- ✅ **Respaldo**: Múltiples copias de seguridad

## 🔄 CÓMO FUNCIONA AHORA

### Al Guardar un Evento:
1. Se guarda en **Supabase** (principal)
2. Se respalda en **Local Storage**
3. Google Sheets queda como solo lectura

### Al Cargar Eventos:
1. Intenta cargar desde **Supabase**
2. Si falla, carga desde **Google Sheets**
3. Si falla, carga desde **Local Storage**

### Sincronización:
- Botón "🔄 Sincronizar desde Google Sheets"
- Copia eventos de Google Sheets → Supabase
- No duplica eventos existentes

## 🛠️ CONFIGURACIÓN OAUTH2 (OPCIONAL)

Si quieres escribir directamente a Google Sheets, sigue estos pasos:

### 1. Google Cloud Console
```
1. Ve a console.cloud.google.com
2. Selecciona tu proyecto
3. Habilita "Google Sheets API"
```

### 2. Crear Cuenta de Servicio
```
1. Ve a "APIs y servicios" > "Credenciales"
2. "Crear credenciales" > "Cuenta de servicio"
3. Nombre: abrakadabra-sheets-service
4. Descarga el archivo JSON
```

### 3. Compartir Google Sheets
```
1. Abre tu Google Sheet
2. Clic en "Compartir"
3. Agrega: tu-cuenta-servicio@tu-proyecto.iam.gserviceaccount.com
4. Permisos: Editor
```

### 4. Actualizar Código
Edita `utils/serviceAccountConfig.ts` con los datos del JSON:
```typescript
export const SERVICE_ACCOUNT_CREDENTIALS = {
  type: 'service_account',
  project_id: 'tu-proyecto-real',
  private_key_id: 'abc123...',
  private_key: '-----BEGIN PRIVATE KEY-----\n...',
  client_email: 'tu-cuenta-servicio@tu-proyecto.iam.gserviceaccount.com',
  client_id: '107978395627832723470',
  // ... resto de campos
};
```

## 🎉 ESTADO ACTUAL

### ✅ LO QUE YA FUNCIONA:
- Guardar eventos (Supabase)
- Leer eventos (Google Sheets + Supabase)
- Actualizar eventos (Supabase)
- Eliminar eventos (Supabase)
- Sincronización Google Sheets → Supabase
- Respaldo local
- Diagnósticos de conexión

### 📝 MENSAJES DE LA APP:
- **Éxito**: "✅ Guardado en Supabase (base de datos principal)"
- **Nota**: "📝 Google Sheets está en modo solo lectura"
- **Diagnósticos**: Botón "🔧 Diagnósticos" en el menú principal

## 🔍 VERIFICACIÓN

### Probar la App:
1. Abre la app
2. Clic en "🔧 Diagnósticos"
3. Verifica que Supabase esté conectado
4. Crea un evento de prueba
5. Verifica que se guarde exitosamente

### Sincronizar Datos:
1. Clic en "🔄 Sincronizar desde Google Sheets"
2. Confirma la sincronización
3. Los eventos de Google Sheets aparecerán en la app

## 💡 RECOMENDACIÓN

**Usa la solución actual (Supabase)** porque:
- Es más confiable que Google Sheets
- Mejor rendimiento
- Funciona offline
- Más fácil de mantener
- Google Sheets sigue disponible para consulta

## 🆘 SOPORTE

Si necesitas ayuda:
1. Revisa los logs en la consola
2. Usa el botón "🔧 Diagnósticos"
3. Verifica la conexión a internet
4. Reinicia la app si es necesario

---

**¡Tu app ya funciona completamente! 🎉**
La escritura está solucionada con Supabase y Google Sheets sigue disponible para lectura.
