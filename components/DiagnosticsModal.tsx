
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
  syncGoogleSheetsToSupabase 
} from '../utils/storage';

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
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
  },
});

const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({ visible, onClose }) => {
  const [diagnosticsResult, setDiagnosticsResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      runDiagnostics();
    }
  }, [visible]);

  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Running local storage diagnostics...');
      const result = await testDatabaseConnections();
      setDiagnosticsResult(result);
    } catch (error) {
      console.error('❌ Error running diagnostics:', error);
      setDiagnosticsResult(`❌ Error ejecutando diagnósticos: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const showRemovalInfo = () => {
    Alert.alert(
      'Información del Sistema',
      `La aplicación ha sido simplificada y ahora funciona únicamente con almacenamiento local.

✅ VENTAJAS:
• Sin dependencias externas
• Funcionamiento offline completo
• Datos seguros en el dispositivo
• Sin problemas de conectividad
• Mayor velocidad de respuesta

⚠️ CAMBIOS:
• Supabase removido
• Google Sheets removido
• Edge Functions removidas
• Solo almacenamiento local`,
      [{ text: 'Entendido' }]
    );
  };

  const runLegacyGoogleSheetsDiagnostics = async () => {
    setIsLoading(true);
    try {
      console.log('📊 Running legacy Google Sheets diagnostics...');
      const result = await runGoogleSheetsDiagnostics();
      setDiagnosticsResult(result);
    } catch (error) {
      console.error('❌ Error running legacy diagnostics:', error);
      setDiagnosticsResult(`❌ Error en diagnósticos: ${error}`);
    } finally {
      setIsLoading(false);
    }
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
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ Sistema simplificado: Solo almacenamiento local
            </Text>
          </View>
          
          <ScrollView style={{ maxHeight: 400 }}>
            <Text style={styles.diagnosticsText}>
              {isLoading ? '⏳ Ejecutando diagnósticos...' : diagnosticsResult}
            </Text>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button
              title="🔄 Actualizar"
              onPress={runDiagnostics}
              style={styles.actionButton}
              disabled={isLoading}
            />
            
            <Button
              title="📊 Info Cambios"
              onPress={runLegacyGoogleSheetsDiagnostics}
              style={styles.actionButton}
              disabled={isLoading}
            />
          </View>

          <Button
            title="ℹ️ Información del Sistema"
            onPress={showRemovalInfo}
            style={{ marginTop: 10 }}
            disabled={isLoading}
          />

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default DiagnosticsModal;
