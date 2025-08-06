
import Button from './Button';
import { colors, commonStyles } from '../styles/commonStyles';
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
  syncButton: {
    backgroundColor: colors.accent,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  syncButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
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
      console.log('🧪 Running comprehensive diagnostics...');
      const result = await testDatabaseConnections();
      setDiagnosticsResult(result);
    } catch (error) {
      console.error('❌ Error running diagnostics:', error);
      setDiagnosticsResult(`❌ Error ejecutando diagnósticos: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyServiceAccountEmail = () => {
    const serviceAccountEmail = 'abrakadabra@abrakadabra-422005.iam.gserviceaccount.com';
    Clipboard.setString(serviceAccountEmail);
    Alert.alert(
      'Email Copiado',
      `Email de cuenta de servicio copiado al portapapeles:\n${serviceAccountEmail}`,
      [{ text: 'OK' }]
    );
  };

  const openGoogleSheet = () => {
    const spreadsheetId = '13nNp7c8gSn0L3lCWHbJmHcCUZt9iUY7XUxP7SJLCh6s';
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    
    Alert.alert(
      'Abrir Google Sheet',
      `¿Deseas abrir la hoja de cálculo en el navegador?\n\n${url}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Abrir', 
          onPress: () => {
            // In a real app, you would use Linking.openURL(url)
            console.log('Opening URL:', url);
          }
        }
      ]
    );
  };

  const showSharingInstructions = () => {
    Alert.alert(
      'Instrucciones de Compartir',
      `Para habilitar la sincronización con Google Sheets:

1. Abre tu Google Sheet
2. Haz clic en "Compartir" (botón azul)
3. En "Agregar personas y grupos", ingresa:
   abrakadabra@abrakadabra-422005.iam.gserviceaccount.com
4. Cambia permisos de "Visualizador" a "Editor"
5. Haz clic en "Enviar"

⚠️ NOTA: Google Sheets ahora es opcional. La app funciona completamente con Supabase.`,
      [{ text: 'Entendido' }]
    );
  };

  const runGoogleSheetsDiagnosticsOnly = async () => {
    setIsLoading(true);
    try {
      console.log('📊 Running Google Sheets diagnostics...');
      const result = await runGoogleSheetsDiagnostics();
      setDiagnosticsResult(result);
    } catch (error) {
      console.error('❌ Error running Google Sheets diagnostics:', error);
      setDiagnosticsResult(`❌ Error en diagnósticos de Google Sheets: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const syncFromGoogleSheets = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Syncing from Google Sheets to Supabase...');
      
      Alert.alert(
        'Sincronizar desde Google Sheets',
        '¿Deseas sincronizar los eventos desde Google Sheets a Supabase? Esto puede tomar unos momentos.',
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => setIsLoading(false) },
          { 
            text: 'Sincronizar', 
            onPress: async () => {
              try {
                const result = await syncGoogleSheetsToSupabase();
                Alert.alert(
                  result.success ? 'Sincronización Exitosa' : 'Error de Sincronización',
                  result.message,
                  [{ text: 'OK' }]
                );
                
                // Refresh diagnostics after sync
                if (result.success) {
                  await runDiagnostics();
                }
              } catch (error) {
                Alert.alert(
                  'Error de Sincronización',
                  `Error durante la sincronización: ${error}`,
                  [{ text: 'OK' }]
                );
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error in sync process:', error);
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
              title="📊 Google Sheets"
              onPress={runGoogleSheetsDiagnosticsOnly}
              style={styles.actionButton}
              disabled={isLoading}
            />
          </View>

          <TouchableOpacity 
            style={styles.syncButton}
            onPress={syncFromGoogleSheets}
            disabled={isLoading}
          >
            <Text style={styles.syncButtonText}>
              🔄 Sincronizar desde Google Sheets
            </Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <Button
              title="📧 Copiar Email"
              onPress={copyServiceAccountEmail}
              style={styles.actionButton}
              disabled={isLoading}
            />
            
            <Button
              title="📋 Abrir Sheet"
              onPress={openGoogleSheet}
              style={styles.actionButton}
              disabled={isLoading}
            />
          </View>

          <Button
            title="❓ Instrucciones"
            onPress={showSharingInstructions}
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
