
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Alert,
  StyleSheet 
} from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import Button from './Button';
import { 
  testDatabaseConnections, 
  runSupabaseDiagnostics,
  syncSupabaseToLocal 
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
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  diagnosticText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.text,
    backgroundColor: colors.lightGray,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  smallButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  infoBox: {
    backgroundColor: colors.lightBlue,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  closeButton: {
    marginTop: 15,
  },
});

const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({ visible, onClose }) => {
  const [diagnosticResults, setDiagnosticResults] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      runGeneralDiagnostics();
    }
  }, [visible]);

  const runGeneralDiagnostics = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Running general diagnostics...');
      const results = await testDatabaseConnections();
      setDiagnosticResults(results);
    } catch (error: any) {
      console.error('❌ Error running diagnostics:', error);
      setDiagnosticResults(`❌ Error ejecutando diagnósticos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runSupabaseDiagnosticsTest = async () => {
    setIsLoading(true);
    try {
      console.log('🗄️ Running Supabase diagnostics...');
      const results = await runSupabaseDiagnostics();
      setDiagnosticResults(results);
    } catch (error: any) {
      console.error('❌ Error running Supabase diagnostics:', error);
      setDiagnosticResults(`❌ Error en diagnósticos de Supabase: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runSystemHealthCheck = async () => {
    setIsLoading(true);
    try {
      console.log('🏥 Running system health check...');
      const healthData = await runHealthCheck();
      const formattedReport = formatHealthReport(healthData);
      setDiagnosticResults(formattedReport);
    } catch (error: any) {
      console.error('❌ Error running health check:', error);
      setDiagnosticResults(`❌ Error en chequeo de salud: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const syncFromSupabase = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Syncing from Supabase...');
      const result = await syncSupabaseToLocal();
      
      if (result.success) {
        Alert.alert(
          '✅ Sincronización Exitosa',
          result.message,
          [{ text: 'OK' }]
        );
        // Refresh diagnostics after sync
        await runGeneralDiagnostics();
      } else {
        Alert.alert(
          '❌ Error de Sincronización',
          result.message,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('❌ Error syncing from Supabase:', error);
      Alert.alert(
        '❌ Error de Sincronización',
        `Error sincronizando desde Supabase: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const showSupabaseInfo = () => {
    Alert.alert(
      '🗄️ Información de Supabase',
      'Supabase es una plataforma de base de datos PostgreSQL en la nube que proporciona:\n\n' +
      '• Base de datos PostgreSQL escalable\n' +
      '• API REST automática\n' +
      '• Sincronización en tiempo real\n' +
      '• Respaldo automático\n' +
      '• Seguridad avanzada con RLS\n\n' +
      'La aplicación usa Supabase como almacenamiento principal con respaldo local.',
      [{ text: 'Entendido' }]
    );
  };

  const getInfoBoxContent = () => {
    return (
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>🗄️ Sistema de Almacenamiento Supabase</Text>
        <Text style={styles.infoText}>
          La aplicación ahora utiliza Supabase como base de datos principal con PostgreSQL. 
          Los datos se sincronizan automáticamente y se mantiene un respaldo local para 
          funcionamiento offline.
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
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Herramientas de Diagnóstico</Text>
            
            <View style={styles.buttonRow}>
              <Button
                title="🔍 General"
                onPress={runGeneralDiagnostics}
                style={styles.smallButton}
                disabled={isLoading}
              />
              <Button
                title="🗄️ Supabase"
                onPress={runSupabaseDiagnosticsTest}
                style={styles.smallButton}
                disabled={isLoading}
              />
            </View>
            
            <View style={styles.buttonRow}>
              <Button
                title="🏥 Salud"
                onPress={runSystemHealthCheck}
                style={styles.smallButton}
                disabled={isLoading}
              />
              <Button
                title="ℹ️ Info"
                onPress={showSupabaseInfo}
                style={styles.smallButton}
                disabled={isLoading}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sincronización</Text>
            <Button
              title="🔄 Sincronizar desde Supabase"
              onPress={syncFromSupabase}
              disabled={isLoading}
            />
          </View>

          {diagnosticResults ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resultados</Text>
              <ScrollView style={{ maxHeight: 200 }}>
                <Text style={styles.diagnosticText}>
                  {isLoading ? 'Ejecutando diagnósticos...' : diagnosticResults}
                </Text>
              </ScrollView>
            </View>
          ) : null}

          <Button
            title="Cerrar"
            onPress={onClose}
            style={styles.closeButton}
          />
        </View>
      </View>
    </Modal>
  );
};

export default DiagnosticsModal;
