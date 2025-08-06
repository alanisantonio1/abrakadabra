
# Configuración de Cuenta de Servicio para Google Sheets

## ✅ Estado Actual

La aplicación ya está configurada con las credenciales de la cuenta de servicio:

- **Email de cuenta de servicio**: `abrakadabra@abrakadabra-422005.iam.gserviceaccount.com`
- **Proyecto**: `abrakadabra-422005`
- **Client ID**: `107978395627832723470`

## 🔧 Pasos para Habilitar Escritura

### Opción 1: Compartir Google Sheet (Recomendado para React Native)

1. **Abre tu Google Sheet** en el navegador
2. **Haz clic en "Compartir"** (botón azul en la esquina superior derecha)
3. **Agrega el email de la cuenta de servicio**:
   ```
   abrakadabra@abrakadabra-422005.iam.gserviceaccount.com
   ```
4. **Selecciona "Editor"** en los permisos (no solo "Visualizador")
5. **Haz clic en "Enviar"**

### Opción 2: Backend con Autenticación JWT (Más Seguro)

Si prefieres máxima seguridad, puedes implementar un backend:

1. **Crear servidor backend** (Node.js, Python, etc.)
2. **Implementar autenticación JWT** usando la clave privada
3. **Hacer llamadas a Google Sheets** desde el backend
4. **Conectar React Native** al backend en lugar de directamente a Google Sheets

## 🔍 Verificar Configuración

Usa el botón "Probar Conexión Google Sheets" en la aplicación para verificar:

- ✅ Configuración de cuenta de servicio
- ✅ Conexión básica
- ✅ Acceso de lectura
- ⚠️ Permisos de escritura (requiere compartir la hoja)

## 🚨 Limitaciones de React Native

React Native no puede hacer autenticación JWT directamente por razones de seguridad:

- **No se puede firmar JWT** con claves privadas en el cliente
- **Las claves privadas** no deben estar en aplicaciones móviles
- **La autenticación JWT** debe hacerse en un servidor backend

## 💡 Solución Actual

La aplicación usa un enfoque híbrido:

1. **Lectura**: Funciona con API key de respaldo
2. **Escritura**: Requiere compartir la hoja con la cuenta de servicio
3. **Respaldo**: Almacenamiento local para cuando Google Sheets no esté disponible

## 🔐 Seguridad

- Las credenciales están configuradas en el código
- Para producción, considera mover las credenciales a variables de entorno
- La clave privada está incluida pero solo se usa para identificación, no para firmar JWT

## 📞 Soporte

Si tienes problemas:

1. Verifica que el email de la cuenta de servicio esté agregado a tu Google Sheet
2. Asegúrate de que tenga permisos de "Editor"
3. Usa los diagnósticos en la aplicación para identificar problemas
4. Revisa los logs de la consola para más detalles

## 🎯 Resultado Esperado

Después de compartir la hoja correctamente:

- ✅ Lectura de eventos desde Google Sheets
- ✅ Escritura de nuevos eventos
- ✅ Actualización de eventos existentes
- ✅ Eliminación de eventos
- ✅ Sincronización bidireccional
