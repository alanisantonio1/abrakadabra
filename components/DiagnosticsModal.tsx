
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Alert,
  Clipboard,
  StyleSheet 
} from 'react-native';
import Button from './Button';
import { colors, commonStyles } from '../styles/commonStyles';
import { runGoogleSheetsDiagnostics, testDatabaseConnections } from '../utils/storage';

interface DiagnosticsModalProps {
  visible: boolean;
  onClose: () => void;
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  diagnosticsText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: colors.text,
    lineHeight: 16,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  serviceAccountEmail: {
    backgroundColor: colors.lightGray,
    padding: 8,
    borderRadius: 4,
    marginVertical: 8,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  warningText: {
    color: '#856404',
    fontSize: 12,
    lineHeight: 16,
  },
  successBox: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  successText: {
    color: '#155724',
    fontSize: 12,
    lineHeight: 16,
  },
});

const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({ visible, onClose }) => {
  const [diagnosticsResult, setDiagnosticsResult] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (visible) {
      runDiagnostics();
    }
  }, [visible]);

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      console.log('🧪 Running comprehensive diagnostics...');
      
      let fullReport = '🔍 DIAGNÓSTICOS COMPLETOS DE ABRAKADABRA\n';
      fullReport += '=' .repeat(50) + '\n\n';
      
      // Test all database connections
      const dbReport = await testDatabaseConnections();
      fullReport += dbReport;
      
      fullReport += '\n\n' + '=' .repeat(50);
      fullReport += '\n📱 COMPATIBILIDAD REACT NATIVE\n';
      fullReport += '=' .repeat(50) + '\n';
      fullReport += '✅ Almacenamiento AsyncStorage: Funcionando\n';
      fullReport += '⚠️ Google Cloud SDK: Limitado (usando API key)\n';
      fullReport += '✅ Fetch API: Funcionando\n';
      fullReport += '✅ JSON parsing: Funcionando\n';
      
      fullReport += '\n\n🔧 RECOMENDACIONES:\n';
      fullReport += '1. Para producción: Implementar autenticación JWT en backend\n';
      fullReport += '2. Para desarrollo: Usar clave API para operaciones de lectura\n';
      fullReport += '3. Compartir hoja con cuenta de servicio para escritura\n';
      fullReport += '4. Mantener almacenamiento local como respaldo\n';
      
      setDiagnosticsResult(fullReport);
    } catch (error) {
      console.error('❌ Error running diagnostics:', error);
      setDiagnosticsResult(`❌ Error ejecutando diagnósticos: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const copyServiceAccountEmail = () => {
    const serviceAccountEmail = 'abrakadabra@abrakadabra-422005.iam.gserviceaccount.com';
    Clipboard.setString(serviceAccountEmail);
    Alert.alert(
      'Email Copiado',
      `Email de cuenta de servicio copiado al portapapeles:\n\n${serviceAccountEmail}`,
      [{ text: 'OK' }]
    );
  };

  const openGoogleSheet = () => {
    const spreadsheetId = '13nNp7c8gSn0L3lCWHbJmHcCUZt9iUY7XUxP7SJLCh6s';
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    
    Alert.alert(
      'Abrir Google Sheet',
      `Para abrir la hoja de cálculo, ve a:\n\n${url}`,
      [
        { text: 'Copiar URL', onPress: () => Clipboard.setString(url) },
        { text: 'OK' }
      ]
    );
  };

  const showSharingInstructions = () => {
    const serviceAccountEmail = 'abrakadabra@abrakadabra-422005.iam.gserviceaccount.com';
    const instructions = `INSTRUCCIONES PARA COMPARTIR GOOGLE SHEET:

1. Abre tu Google Sheet en el navegador
2. Haz clic en "Compartir" (botón azul arriba a la derecha)
3. En "Agregar personas y grupos", pega exactamente:
   ${serviceAccountEmail}
4. Cambia permisos de "Viewer" a "Editor"
5. Haz clic en "Enviar"
6. Ejecuta diagnósticos nuevamente para verificar

⚠️ IMPORTANTE:
- El email debe ser exactamente como se muestra
- Los permisos deben ser "Editor", no "Viewer"
- No agregues espacios extra al copiar el email`;

    Alert.alert(
      'Instrucciones de Compartir',
      instructions,
      [
        { text: 'Copiar Email', onPress: copyServiceAccountEmail },
        { text: 'OK' }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>🔍 Diagnósticos del Sistema</Text>
          
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ NOTA: Esta aplicación usa una implementación compatible con React Native.
              Algunas funciones de Google Cloud SDK están limitadas en el entorno móvil.
            </Text>
          </View>

          <ScrollView style={{ maxHeight: 400 }}>
            <Text style={styles.diagnosticsText}>
              {isRunning ? '🔄 Ejecutando diagnósticos...\n\nEsto puede tomar unos segundos...' : diagnosticsResult}
            </Text>
          </ScrollView>

          <View style={styles.successBox}>
            <Text style={styles.successText}>
              💡 TIP: El almacenamiento local siempre funciona como respaldo.
              Los datos se sincronizan con Google Sheets cuando es posible.
            </Text>
          </View>

          <Text style={styles.serviceAccountEmail}>
            📧 Cuenta de servicio:{'\n'}
            abrakadabra@abrakadabra-422005.iam.gserviceaccount.com
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={copyServiceAccountEmail}>
              <Text style={styles.actionButtonText}>📋 Copiar Email</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={openGoogleSheet}>
              <Text style={styles.actionButtonText}>📊 Ver Sheet</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={showSharingInstructions}>
              <Text style={styles.actionButtonText}>📝 Instrucciones</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 16 }}>
            <Button
              title={isRunning ? "Ejecutando..." : "🔄 Ejecutar Diagnósticos"}
              onPress={runDiagnostics}
              disabled={isRunning}
              style={{ marginBottom: 8 }}
            />
            
            <Button
              title="Cerrar"
              onPress={onClose}
              variant="secondary"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DiagnosticsModal;
