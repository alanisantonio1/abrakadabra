
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
import * as Clipboard from 'expo-clipboard';
import Button from './Button';
import { colors } from '../styles/commonStyles';
import {
  runSetupCheck,
  getCreateTableSQL,
  getSetupInstructions,
  migrateLocalEventsToSupabase
} from '../utils/supabaseSetup';

interface SupabaseSetupModalProps {
  visible: boolean;
  onClose: () => void;
  onSetupComplete?: () => void;
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
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#1565c0',
    lineHeight: 20,
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  successBox: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  successText: {
    fontSize: 14,
    color: '#155724',
    lineHeight: 20,
  },
  sqlBox: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    maxHeight: 200,
  },
  sqlText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  halfButton: {
    flex: 0.48,
  },
  instructionsText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 15,
  },
  stepText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 13,
    color: colors.primary,
    textDecorationLine: 'underline',
    marginBottom: 15,
  },
});

const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({
  visible,
  onClose,
  onSetupComplete
}) => {
  const [isSetup, setIsSetup] = useState<boolean>(false);
  const [setupMessage, setSetupMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSQL, setShowSQL] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);

  useEffect(() => {
    if (visible) {
      checkSetup();
    }
  }, [visible]);

  const checkSetup = async () => {
    try {
      setIsLoading(true);
      const result = await runSetupCheck();
      setIsSetup(result.isSetup);
      setSetupMessage(result.message);
      setShowInstructions(!result.isSetup);
    } catch (error: any) {
      console.error('Error checking setup:', error);
      setSetupMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copySQL = async () => {
    try {
      const sql = getCreateTableSQL();
      await Clipboard.setStringAsync(sql);
      Alert.alert(
        '✅ Copiado',
        'El script SQL ha sido copiado al portapapeles. Ahora pégalo en el SQL Editor de Supabase.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error copying to clipboard:', error);
      Alert.alert(
        'Error',
        'No se pudo copiar al portapapeles. Por favor, copia manualmente el SQL que aparece abajo.',
        [{ text: 'OK' }]
      );
      setShowSQL(true);
    }
  };

  const handleMigrate = async () => {
    Alert.alert(
      '🔄 Sincronizar Eventos',
      '¿Deseas sincronizar todos los eventos locales a Supabase?\n\n• Los eventos nuevos se subirán a la nube\n• Los eventos existentes se omitirán\n• Esto puede tardar unos momentos',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sincronizar',
          onPress: async () => {
            try {
              setIsLoading(true);
              const result = await migrateLocalEventsToSupabase();
              
              let message = '';
              
              if (result.migrated > 0) {
                message += `✅ ${result.migrated} evento(s) sincronizado(s)\n`;
              }
              
              if (result.skipped > 0) {
                message += `⏭️ ${result.skipped} evento(s) ya existían\n`;
              }
              
              if (result.errors.length > 0) {
                message += `\n❌ Errores (${result.errors.length}):\n${result.errors.slice(0, 3).join('\n')}`;
                if (result.errors.length > 3) {
                  message += `\n... y ${result.errors.length - 3} más`;
                }
              }
              
              if (result.success) {
                Alert.alert(
                  '✅ Sincronización Completa',
                  message || 'Todos los eventos están sincronizados.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        if (onSetupComplete) {
                          onSetupComplete();
                        }
                        onClose();
                      }
                    }
                  ]
                );
              } else {
                Alert.alert(
                  '⚠️ Sincronización con Errores',
                  message,
                  [{ text: 'OK' }]
                );
              }
            } catch (error: any) {
              Alert.alert('Error', `Error durante la sincronización: ${error.message}`);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderSetupInstructions = () => {
    if (!showInstructions) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Instrucciones de Configuración</Text>
        
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ La tabla de eventos no existe en Supabase. Sigue estos pasos para configurarla:
          </Text>
        </View>

        <Text style={styles.stepText}>
          <Text style={{ fontWeight: 'bold' }}>1.</Text> Ve al SQL Editor de Supabase:
        </Text>
        <TouchableOpacity onPress={() => {
          Alert.alert(
            'Abrir Supabase',
            'Abre este enlace en tu navegador:\n\nhttps://supabase.com/dashboard/project/hfagsrdboeoxfdzpzgnn/sql',
            [{ text: 'OK' }]
          );
        }}>
          <Text style={styles.linkText}>
            https://supabase.com/dashboard/project/hfagsrdboeoxfdzpzgnn/sql
          </Text>
        </TouchableOpacity>

        <Text style={styles.stepText}>
          <Text style={{ fontWeight: 'bold' }}>2.</Text> Copia el script SQL presionando el botón de abajo
        </Text>

        <Button
          text="📋 Copiar Script SQL"
          onPress={copySQL}
          variant="primary"
          style={{ marginBottom: 15 }}
        />

        <Text style={styles.stepText}>
          <Text style={{ fontWeight: 'bold' }}>3.</Text> Pega el script en el SQL Editor de Supabase
        </Text>

        <Text style={styles.stepText}>
          <Text style={{ fontWeight: 'bold' }}>4.</Text> Haz clic en "Run" para ejecutar el script
        </Text>

        <Text style={styles.stepText}>
          <Text style={{ fontWeight: 'bold' }}>5.</Text> Regresa aquí y presiona "Verificar Configuración"
        </Text>

        {showSQL && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📄 Script SQL</Text>
            <ScrollView style={styles.sqlBox}>
              <Text style={styles.sqlText}>{getCreateTableSQL()}</Text>
            </ScrollView>
          </View>
        )}

        <Button
          text={showSQL ? 'Ocultar SQL' : 'Ver SQL Completo'}
          onPress={() => setShowSQL(!showSQL)}
          variant="outline"
          size="small"
          style={{ marginBottom: 10 }}
        />
      </View>
    );
  };

  const renderSetupComplete = () => {
    if (!isSetup) return null;

    return (
      <View style={styles.section}>
        <View style={styles.successBox}>
          <Text style={styles.successText}>
            ✅ ¡Supabase está configurado correctamente!
            {'\n\n'}
            Todos los eventos nuevos se guardarán automáticamente en la nube.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Consejo: Si tienes eventos guardados solo en almacenamiento local, puedes sincronizarlos a la nube usando el botón de abajo.
          </Text>
        </View>

        <Button
          text="☁️ Sincronizar Eventos a la Nube"
          onPress={handleMigrate}
          variant="primary"
          disabled={isLoading}
          style={{ marginBottom: 10 }}
        />
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>☁️ Configuración de Supabase</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Status Message */}
            <View style={styles.section}>
              <Text style={styles.instructionsText}>{setupMessage}</Text>
            </View>

            {/* Setup Instructions or Complete Message */}
            {renderSetupInstructions()}
            {renderSetupComplete()}

            {/* Action Buttons */}
            <View style={styles.section}>
              <Button
                text="🔍 Verificar Configuración"
                onPress={checkSetup}
                variant="secondary"
                disabled={isLoading}
                style={{ marginBottom: 10 }}
              />

              <Button
                text="Cerrar"
                onPress={onClose}
                variant="outline"
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default SupabaseSetupModal;
