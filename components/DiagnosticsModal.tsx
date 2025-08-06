
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
import { colors, commonStyles } from '../styles/commonStyles';
import { runGoogleSheetsDiagnostics, checkSheetPermissions } from '../utils/googleSheets';
import { SERVICE_ACCOUNT_CREDENTIALS } from '../utils/serviceAccountConfig';
import Button from './Button';

interface DiagnosticsModalProps {
  visible: boolean;
  onClose: () => void;
}

const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({ visible, onClose }) => {
  const [diagnosticsResult, setDiagnosticsResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<{
    hasAccess: boolean;
    details: string;
  } | null>(null);

  useEffect(() => {
    if (visible) {
      runDiagnostics();
    }
  }, [visible]);

  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Running comprehensive diagnostics...');
      
      // Run full diagnostics
      const result = await runGoogleSheetsDiagnostics();
      setDiagnosticsResult(result);
      
      // Check specific permissions
      const permissions = await checkSheetPermissions();
      setPermissionStatus(permissions);
      
      console.log('✅ Diagnostics completed');
    } catch (error) {
      console.error('❌ Error running diagnostics:', error);
      setDiagnosticsResult(`❌ Error ejecutando diagnósticos: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyServiceAccountEmail = async () => {
    try {
      await Clipboard.setString(SERVICE_ACCOUNT_CREDENTIALS.client_email);
      Alert.alert(
        '📋 Copiado',
        `Email de cuenta de servicio copiado al portapapeles:\n\n${SERVICE_ACCOUNT_CREDENTIALS.client_email}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo copiar al portapapeles');
    }
  };

  const openGoogleSheet = () => {
    const spreadsheetId = '13nNp7c8gSn0L3lCWHbJmHcCUZt9iUY7XUxP7SJLCh6s';
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    
    Alert.alert(
      '🌐 Abrir Google Sheet',
      `Para compartir la hoja, abre este enlace en tu navegador:\n\n${url}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Copiar enlace', 
          onPress: async () => {
            try {
              await Clipboard.setString(url);
              Alert.alert('✅ Enlace copiado', 'El enlace se ha copiado al portapapeles');
            } catch (error) {
              Alert.alert('Error', 'No se pudo copiar el enlace');
            }
          }
        }
      ]
    );
  };

  const showSharingInstructions = () => {
    Alert.alert(
      '📝 Instrucciones para compartir',
      `PASOS PARA HABILITAR ESCRITURA:

1. Abre tu Google Sheet en el navegador
2. Haz clic en "Compartir" (botón azul)
3. Agrega este email exactamente:
   ${SERVICE_ACCOUNT_CREDENTIALS.client_email}
4. Cambia permisos a "Editor"
5. Haz clic en "Enviar"
6. Vuelve aquí y ejecuta diagnósticos

⚠️ IMPORTANTE:
- Copia el email exactamente como se muestra
- Los permisos deben ser "Editor", no "Visualizador"`,
      [
        { text: 'Copiar email', onPress: copyServiceAccountEmail },
        { text: 'Abrir hoja', onPress: openGoogleSheet },
        { text: 'Entendido' }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🔍 Diagnósticos Google Sheets</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Permission Status Card */}
        {permissionStatus && (
          <View style={[
            styles.statusCard,
            { backgroundColor: permissionStatus.hasAccess ? colors.success : colors.warning }
          ]}>
            <Text style={styles.statusTitle}>
              {permissionStatus.hasAccess ? '✅ Permisos OK' : '⚠️ Permisos Limitados'}
            </Text>
            <Text style={styles.statusText}>
              {permissionStatus.hasAccess 
                ? 'La hoja está correctamente compartida con la cuenta de servicio'
                : 'La hoja NO está compartida con la cuenta de servicio'
              }
            </Text>
            
            {!permissionStatus.hasAccess && (
              <View style={styles.actionButtons}>
                <Button
                  title="📝 Ver instrucciones"
                  onPress={showSharingInstructions}
                  style={styles.actionButton}
                />
                <Button
                  title="📋 Copiar email"
                  onPress={copyServiceAccountEmail}
                  style={styles.actionButton}
                />
              </View>
            )}
          </View>
        )}

        {/* Service Account Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔐 Cuenta de Servicio</Text>
          <Text style={styles.infoText}>
            Email: {SERVICE_ACCOUNT_CREDENTIALS.client_email}
          </Text>
          <Text style={styles.infoText}>
            Proyecto: {SERVICE_ACCOUNT_CREDENTIALS.project_id}
          </Text>
          
          <TouchableOpacity 
            onPress={copyServiceAccountEmail}
            style={styles.copyButton}
          >
            <Text style={styles.copyButtonText}>📋 Copiar email de cuenta de servicio</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            title="🔄 Ejecutar diagnósticos"
            onPress={runDiagnostics}
            disabled={isLoading}
            style={styles.diagnosticsButton}
          />
          
          <Button
            title="🌐 Abrir Google Sheet"
            onPress={openGoogleSheet}
            style={styles.openSheetButton}
          />
        </View>

        {/* Diagnostics Results */}
        <ScrollView style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>📊 Resultados de Diagnósticos</Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>🔍 Ejecutando diagnósticos...</Text>
            </View>
          ) : (
            <Text style={styles.resultsText}>{diagnosticsResult}</Text>
          )}
        </ScrollView>

        {/* Instructions */}
        {!permissionStatus?.hasAccess && (
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>🎯 Próximo paso</Text>
            <Text style={styles.instructionsText}>
              Para habilitar la escritura a Google Sheets, comparte la hoja con la cuenta de servicio.
            </Text>
            
            <Button
              title="📝 Ver instrucciones completas"
              onPress={showSharingInstructions}
              style={styles.instructionsButton}
            />
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: 'bold',
  },
  statusCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.surface,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: colors.surface,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  copyButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  copyButtonText: {
    color: colors.surface,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    margin: 16,
    marginTop: 0,
    gap: 8,
  },
  diagnosticsButton: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  openSheetButton: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  resultsContainer: {
    flex: 1,
    margin: 16,
    marginTop: 0,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    padding: 16,
    paddingBottom: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  resultsText: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'monospace',
    padding: 16,
    paddingTop: 0,
    lineHeight: 18,
  },
  instructionsCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: colors.warning,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.surface,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: colors.surface,
    marginBottom: 12,
  },
  instructionsButton: {
    backgroundColor: colors.surface,
  },
});

export default DiagnosticsModal;
