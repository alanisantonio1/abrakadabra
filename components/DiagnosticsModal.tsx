
import { 
  testDatabaseConnections, 
  runSupabaseDiagnostics,
  syncSupabaseToLocal 
} from '../utils/storage';
import { 
  checkAnticipoMigration,
  testAnticipoInsert,
  getMigrationInstructions,
  MigrationStatus
} from '../utils/migrationChecker';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Alert,
  StyleSheet 
} from 'react-native';
import Button from './Button';
import React, { useState, useEffect } from 'react';
import { runHealthCheck, formatHealthReport } from '../utils/healthCheck';
import { colors, commonStyles } from '../styles/commonStyles';

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
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  diagnosticSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  diagnosticText: {
    fontSize: 14,
    color: colors.text,
    fontFamily: 'monospace',
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
  halfButton: {
    flex: 0.48,
  },
  migrationWarning: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  migrationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  migrationText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  migrationSuccess: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  migrationSuccessTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#155724',
    marginBottom: 8,
  },
  migrationSuccessText: {
    fontSize: 14,
    color: '#155724',
    lineHeight: 20,
  },
});

const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({ visible, onClose }) => {
  const [diagnosticResult, setDiagnosticResult] = useState<string>('');
  const [supabaseResult, setSupabaseResult] = useState<string>('');
  const [healthResult, setHealthResult] = useState<string>('');
  const [syncResult, setSyncResult] = useState<string>('');
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      checkMigrationStatus();
    }
  }, [visible]);

  const checkMigrationStatus = async () => {
    try {
      setIsLoading(true);
      const status = await checkAnticipoMigration();
      setMigrationStatus(status);
    } catch (error) {
      console.error('Error checking migration status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runGeneralDiagnostics = async () => {
    try {
      setIsLoading(true);
      setDiagnosticResult('🔄 Ejecutando diagnósticos...');
      const result = await testDatabaseConnections();
      setDiagnosticResult(result);
    } catch (error: any) {
      setDiagnosticResult(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runSupabaseDiagnosticsTest = async () => {
    try {
      setIsLoading(true);
      setSupabaseResult('🔄 Ejecutando diagnósticos de Supabase...');
      const result = await runSupabaseDiagnostics();
      setSupabaseResult(result);
    } catch (error: any) {
      setSupabaseResult(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runSystemHealthCheck = async () => {
    try {
      setIsLoading(true);
      setHealthResult('🔄 Ejecutando chequeo de salud del sistema...');
      const healthData = await runHealthCheck();
      const formattedReport = formatHealthReport(healthData);
      setHealthResult(formattedReport);
    } catch (error: any) {
      setHealthResult(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const syncFromSupabase = async () => {
    try {
      setIsLoading(true);
      setSyncResult('🔄 Sincronizando desde Supabase...');
      const result = await syncSupabaseToLocal();
      setSyncResult(result.message);
      
      if (result.success) {
        Alert.alert(
          'Sincronización Exitosa',
          `Se sincronizaron ${result.synced} eventos desde Supabase`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      setSyncResult(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testMigration = async () => {
    try {
      setIsLoading(true);
      const result = await testAnticipoInsert();
      
      Alert.alert(
        result.success ? 'Prueba Exitosa' : 'Prueba Fallida',
        result.message,
        [{ text: 'OK' }]
      );
      
      // Refresh migration status
      await checkMigrationStatus();
    } catch (error: any) {
      Alert.alert('Error', `Error en prueba: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const showMigrationInstructions = () => {
    const instructions = getMigrationInstructions();
    Alert.alert(
      'Instrucciones de Migración',
      instructions,
      [{ text: 'Entendido' }]
    );
  };

  const showSupabaseInfo = () => {
    Alert.alert(
      'Información de Supabase',
      'Supabase es la base de datos principal de la aplicación. Proporciona almacenamiento en la nube, sincronización en tiempo real y respaldo de datos.',
      [{ text: 'OK' }]
    );
  };

  const getInfoBoxContent = () => {
    return `
🎯 DIAGNÓSTICOS DEL SISTEMA

Esta herramienta ayuda a identificar y resolver problemas:

✅ Almacenamiento Local: Verifica AsyncStorage
🗄️ Supabase: Prueba conexión y esquema de BD
🔧 Migración: Verifica columnas anticipo
🔄 Sincronización: Actualiza datos desde Supabase
💊 Salud del Sistema: Estado general de la app

📊 FUNCIONES DISPONIBLES:
- Diagnóstico general de almacenamiento
- Pruebas específicas de Supabase
- Verificación de migración de esquema
- Sincronización de datos
- Chequeo de salud del sistema
    `;
  };

  const renderMigrationStatus = () => {
    if (!migrationStatus) return null;

    if (migrationStatus.isRequired) {
      return (
        <View style={styles.migrationWarning}>
          <Text style={styles.migrationTitle}>⚠️ Migración Requerida</Text>
          <Text style={styles.migrationText}>
            {migrationStatus.message}
          </Text>
          {migrationStatus.missingColumns.length > 0 && (
            <Text style={styles.migrationText}>
              Columnas faltantes: {migrationStatus.missingColumns.join(', ')}
            </Text>
          )}
          <View style={[styles.buttonRow, { marginTop: 10 }]}>
            <View style={styles.halfButton}>
              <Button
                title="Ver Instrucciones"
                onPress={showMigrationInstructions}
                variant="secondary"
              />
            </View>
            <View style={styles.halfButton}>
              <Button
                title="Probar Migración"
                onPress={testMigration}
                variant="primary"
              />
            </View>
          </View>
        </View>
      );
    } else if (migrationStatus.canProceed) {
      return (
        <View style={styles.migrationSuccess}>
          <Text style={styles.migrationSuccessTitle}>✅ Migración Completa</Text>
          <Text style={styles.migrationSuccessText}>
            {migrationStatus.message}
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>🔍 Diagnósticos del Sistema</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Migration Status */}
            {renderMigrationStatus()}
            
            {/* Info Box */}
            <View style={styles.diagnosticSection}>
              <Text style={styles.sectionTitle}>ℹ️ Información</Text>
              <Text style={styles.diagnosticText}>
                {getInfoBoxContent()}
              </Text>
            </View>

            {/* Diagnostic Buttons */}
            <View style={styles.diagnosticSection}>
              <Text style={styles.sectionTitle}>🧪 Pruebas de Diagnóstico</Text>
              
              <View style={styles.buttonRow}>
                <View style={styles.halfButton}>
                  <Button
                    title="Diagnóstico General"
                    onPress={runGeneralDiagnostics}
                    variant="primary"
                    disabled={isLoading}
                  />
                </View>
                <View style={styles.halfButton}>
                  <Button
                    title="Pruebas Supabase"
                    onPress={runSupabaseDiagnosticsTest}
                    variant="secondary"
                    disabled={isLoading}
                  />
                </View>
              </View>

              <View style={styles.buttonRow}>
                <View style={styles.halfButton}>
                  <Button
                    title="Salud del Sistema"
                    onPress={runSystemHealthCheck}
                    variant="secondary"
                    disabled={isLoading}
                  />
                </View>
                <View style={styles.halfButton}>
                  <Button
                    title="Sincronizar Datos"
                    onPress={syncFromSupabase}
                    variant="primary"
                    disabled={isLoading}
                  />
                </View>
              </View>

              <Button
                title="ℹ️ Info Supabase"
                onPress={showSupabaseInfo}
                variant="secondary"
                disabled={isLoading}
              />
            </View>

            {/* Results */}
            {diagnosticResult ? (
              <View style={styles.diagnosticSection}>
                <Text style={styles.sectionTitle}>📊 Resultado General</Text>
                <Text style={styles.diagnosticText}>{diagnosticResult}</Text>
              </View>
            ) : null}

            {supabaseResult ? (
              <View style={styles.diagnosticSection}>
                <Text style={styles.sectionTitle}>🗄️ Resultado Supabase</Text>
                <Text style={styles.diagnosticText}>{supabaseResult}</Text>
              </View>
            ) : null}

            {healthResult ? (
              <View style={styles.diagnosticSection}>
                <Text style={styles.sectionTitle}>💊 Salud del Sistema</Text>
                <Text style={styles.diagnosticText}>{healthResult}</Text>
              </View>
            ) : null}

            {syncResult ? (
              <View style={styles.diagnosticSection}>
                <Text style={styles.sectionTitle}>🔄 Sincronización</Text>
                <Text style={styles.diagnosticText}>{syncResult}</Text>
              </View>
            ) : null}
          </ScrollView>

          <Button
            title="Cerrar"
            onPress={onClose}
            variant="secondary"
            style={{ marginTop: 20 }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default DiagnosticsModal;
