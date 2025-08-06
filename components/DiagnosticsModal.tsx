
import Button from './Button';
import { colors, commonStyles } from '../styles/commonStyles';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Alert,
  StyleSheet 
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { 
  testDatabaseConnections, 
  runGoogleSheetsDiagnostics,
  syncGoogleSheetsToLocal 
} from '../utils/storage';
import { runHealthCheck, formatHealthReport } from '../utils/healthCheck';

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
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
    width: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: colors.primary,
  },
  diagnosticsText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 16,
    color: '#333',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    flexWrap: 'wrap',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minWidth: 120,
  },
  closeButton: {
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  infoText: {
    fontSize: 14,
    color: '#2e7d32',
    lineHeight: 20,
  },
  warningBox: {
    backgroundColor: '#fff3e0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  warningText: {
    fontSize: 14,
    color: '#f57c00',
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    fontSize: 14,
    color: '#c62828',
    lineHeight: 20,
  },
});

const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({ visible, onClose }) => {
  const [diagnosticsResult, setDiagnosticsResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTest, setCurrentTest] = useState<string>('general');
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      runGeneralDiagnostics();
    }
  }, [visible]);

  const runGeneralDiagnostics = async () => {
    setIsLoading(true);
    setCurrentTest('general');
    setLastError(null);
    
    try {
      console.log('🧪 Running general diagnostics...');
      const result = await testDatabaseConnections();
      setDiagnosticsResult(result);
    } catch (error: any) {
      console.error('❌ Error running general diagnostics:', error);
      const errorMessage = `❌ Error ejecutando diagnósticos: ${error.message || 'Unknown error'}`;
      setDiagnosticsResult(errorMessage);
      setLastError(error.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const runGoogleSheetsDiagnosticsTest = async () => {
    setIsLoading(true);
    setCurrentTest('google');
    setLastError(null);
    
    try {
      console.log('📊 Running Google Sheets diagnostics...');
      const result = await runGoogleSheetsDiagnostics();
      setDiagnosticsResult(result);
    } catch (error: any) {
      console.error('❌ Error running Google Sheets diagnostics:', error);
      const errorMessage = `❌ Error en diagnósticos de Google Sheets: ${error.message || 'Unknown error'}`;
      setDiagnosticsResult(errorMessage);
      setLastError(error.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const runSystemHealthCheck = async () => {
    setIsLoading(true);
    setCurrentTest('health');
    setLastError(null);
    
    try {
      console.log('🏥 Running system health check...');
      const health = await runHealthCheck();
      const report = formatHealthReport(health);
      setDiagnosticsResult(report);
      
      if (health.overall.status === 'error') {
        setLastError('System has critical issues');
      }
    } catch (error: any) {
      console.error('❌ Error running health check:', error);
      const errorMessage = `❌ Error en chequeo de salud del sistema: ${error.message || 'Unknown error'}`;
      setDiagnosticsResult(errorMessage);
      setLastError(error.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const syncFromGoogleSheets = async () => {
    setIsLoading(true);
    setLastError(null);
    
    try {
      console.log('🔄 Syncing from Google Sheets...');
      const result = await syncGoogleSheetsToLocal();
      
      Alert.alert(
        'Sincronización Completada',
        result.message,
        [{ text: 'OK' }]
      );
      
      // Refresh diagnostics after sync
      await runGeneralDiagnostics();
    } catch (error: any) {
      console.error('❌ Error syncing from Google Sheets:', error);
      setLastError(error.message || 'Unknown error');
      
      Alert.alert(
        'Error de Sincronización',
        `Error sincronizando desde Google Sheets: ${error.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const showGoogleSheetsInfo = () => {
    Alert.alert(
      'Google Sheets Integration',
      `🔄 SISTEMA HÍBRIDO ACTIVO

✅ FUNCIONAMIENTO:
• Almacenamiento local como base
• Google Sheets como sincronización
• Respaldo automático en ambos sistemas
• Funcionamiento offline garantizado

📊 GOOGLE SHEETS:
• ID: 13nNp7c8gSn0L3lCWHbJmHcCUZt9iUY7XUxP7SJLCh6s
• Email: abrakadabra@abrakadabra-422005.iam.gserviceaccount.com

🔧 CONFIGURACIÓN:
1. Compartir sheet con el email del service account
2. Dar permisos de "Editor"
3. Verificar conexión en diagnósticos

⚠️ IMPORTANTE:
Si Google Sheets no está disponible, la app funciona completamente con almacenamiento local.`,
      [{ text: 'Entendido' }]
    );
  };

  const getInfoBoxContent = () => {
    if (lastError) {
      return (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            ❌ Error detectado: {lastError}
          </Text>
        </View>
      );
    }
    
    if (currentTest === 'google') {
      return (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            📊 Diagnósticos específicos de Google Sheets
          </Text>
        </View>
      );
    }
    
    if (currentTest === 'health') {
      return (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            🏥 Chequeo completo de salud del sistema
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          🔄 Sistema híbrido: Local + Google Sheets
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>🔍 Diagnósticos del Sistema</Text>
          
          {getInfoBoxContent()}
          
          <ScrollView style={{ maxHeight: 400 }}>
            <Text style={styles.diagnosticsText}>
              {isLoading ? '⏳ Ejecutando diagnósticos...' : diagnosticsResult}
            </Text>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button
              title="🔄 General"
              onPress={runGeneralDiagnostics}
              style={styles.actionButton}
              disabled={isLoading}
            />
            
            <Button
              title="📊 Google Sheets"
              onPress={runGoogleSheetsDiagnosticsTest}
              style={styles.actionButton}
              disabled={isLoading}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="🏥 Salud Sistema"
              onPress={runSystemHealthCheck}
              style={styles.actionButton}
              disabled={isLoading}
            />
            
            <Button
              title="🔄 Sincronizar"
              onPress={syncFromGoogleSheets}
              style={styles.actionButton}
              disabled={isLoading}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="ℹ️ Info Google Sheets"
              onPress={showGoogleSheetsInfo}
              style={styles.actionButton}
              disabled={isLoading}
            />
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default DiagnosticsModal;
