
# 📱☁️ Guía de Sincronización de Eventos a la Nube

## ¿Qué es la Sincronización?

La sincronización te permite subir todos tus eventos guardados localmente en tu dispositivo a la nube de Supabase. Esto te da:

- ✅ **Respaldo en la nube**: Tus eventos están seguros aunque pierdas tu dispositivo
- ✅ **Acceso desde múltiples dispositivos**: Accede a tus eventos desde cualquier lugar
- ✅ **Sincronización automática**: Los eventos nuevos se guardan automáticamente en la nube
- ✅ **Sin duplicados**: El sistema detecta eventos existentes y no los duplica

## 📋 Pasos para Sincronizar

### 1. Configurar Supabase (Solo la Primera Vez)

Si aún no has configurado Supabase:

1. Ve a la pantalla principal de la app
2. Presiona el botón **"🛠️ Herramientas"**
3. Selecciona **"☁️ Configurar Supabase"**
4. Sigue las instrucciones en pantalla:
   - Copia el script SQL
   - Pégalo en el SQL Editor de Supabase
   - Ejecuta el script
   - Verifica la configuración

### 2. Sincronizar Eventos Locales

Una vez que Supabase está configurado, tienes dos opciones para sincronizar:

#### Opción A: Desde el Modal de Configuración

1. Ve a **"🛠️ Herramientas"** → **"☁️ Configurar Supabase"**
2. Presiona **"☁️ Sincronizar Eventos a la Nube"**
3. Confirma la sincronización
4. Espera a que termine el proceso

#### Opción B: Desde el Menú de Herramientas

1. Ve a **"🛠️ Herramientas"**
2. Presiona **"🔄 Sincronizar a la Nube"**
3. Confirma la sincronización
4. Espera a que termine el proceso

## 🔍 ¿Qué Sucede Durante la Sincronización?

El proceso de sincronización:

1. **Lee todos los eventos** guardados en tu almacenamiento local
2. **Verifica** cuáles eventos ya existen en Supabase
3. **Sube solo los eventos nuevos** que no están en la nube
4. **Omite los eventos existentes** para evitar duplicados
5. **Muestra un resumen** con:
   - ✅ Eventos sincronizados exitosamente
   - ⏭️ Eventos que ya existían (omitidos)
   - ❌ Errores (si los hay)

## 📊 Interpretando los Resultados

Después de la sincronización, verás un mensaje como:

```
✅ Sincronización Completa

✅ 15 evento(s) sincronizado(s)
⏭️ 3 evento(s) ya existían
```

Esto significa:
- **15 eventos nuevos** se subieron a la nube
- **3 eventos** ya estaban en Supabase y se omitieron
- **No hubo errores**

## ⚠️ Solución de Problemas

### "No se pudo conectar a Supabase"

**Solución:**
1. Verifica tu conexión a internet
2. Asegúrate de que Supabase está configurado correctamente
3. Ve a **"🛠️ Herramientas"** → **"🧪 Probar Conexión"**

### "Error: Tabla no configurada"

**Solución:**
1. Ve a **"🛠️ Herramientas"** → **"☁️ Configurar Supabase"**
2. Sigue las instrucciones para crear la tabla
3. Ejecuta el script SQL en Supabase
4. Verifica la configuración

### "Algunos eventos no se sincronizaron"

**Solución:**
1. Revisa el mensaje de error para ver qué eventos fallaron
2. Verifica que los eventos tengan todos los datos requeridos
3. Intenta sincronizar nuevamente
4. Si el problema persiste, contacta soporte

## 🔄 Sincronización Automática

Una vez configurado Supabase:

- ✅ **Eventos nuevos** se guardan automáticamente en la nube
- ✅ **Actualizaciones** se sincronizan automáticamente
- ✅ **Eliminaciones** se reflejan en la nube
- ✅ **No necesitas** sincronizar manualmente cada vez

## 💡 Consejos

1. **Sincroniza regularmente** si tienes muchos eventos locales
2. **Verifica la conexión** antes de sincronizar eventos importantes
3. **Usa diagnósticos** si tienes problemas de sincronización
4. **Mantén la app actualizada** para las últimas mejoras

## 🎯 Preguntas Frecuentes

### ¿Se duplicarán mis eventos?

No. El sistema verifica cada evento por su ID único y omite los que ya existen en Supabase.

### ¿Puedo sincronizar sin internet?

No. Necesitas conexión a internet para sincronizar con Supabase.

### ¿Qué pasa si falla la sincronización?

Los eventos permanecen en tu almacenamiento local. Puedes intentar sincronizar nuevamente cuando quieras.

### ¿Puedo deshacer una sincronización?

No puedes deshacer automáticamente, pero puedes eliminar eventos individualmente desde la nube si es necesario.

### ¿Cuánto tiempo tarda la sincronización?

Depende de la cantidad de eventos:
- 10-20 eventos: ~5 segundos
- 50-100 eventos: ~15 segundos
- 200+ eventos: ~30 segundos

## 📞 Soporte

Si tienes problemas con la sincronización:

1. Usa **"🛠️ Herramientas"** → **"🔍 Diagnósticos"** para ver el estado del sistema
2. Usa **"🧪 Probar Conexión"** para verificar la conectividad
3. Revisa los mensajes de error para más detalles
4. Contacta al equipo de soporte con los detalles del error

---

**Última actualización:** Diciembre 2024
**Versión de la app:** 1.0.0
