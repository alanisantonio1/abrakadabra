
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { checkAnticipoMigration, getMigrationInstructions, MigrationStatus } from '../utils/migrationChecker';
import { colors } from '../styles/commonStyles';

interface MigrationAlertProps {
  onDismiss?: () => void;
}

const styles = StyleSheet.create({
  alertContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    margin: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 5,
  },
  alertText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#856404',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dismissButton: {
    backgroundColor: 'transparent',
    borderColor: '#856404',
    borderWidth: 1,
  },
  dismissButtonText: {
    color: '#856404',
  },
});

const MigrationAlert: React.FC<MigrationAlertProps> = ({ onDismiss }) => {
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    checkMigrationRequired();
  }, []);

  const checkMigrationRequired = async () => {
    try {
      const status = await checkAnticipoMigration();
      setMigrationStatus(status);
      setIsVisible(status.isRequired);
    } catch (error) {
      console.error('Error checking migration status:', error);
    }
  };

  const showInstructions = () => {
    const instructions = getMigrationInstructions();
    Alert.alert(
      'Instrucciones de Migración',
      instructions,
      [{ text: 'Entendido' }]
    );
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible || !migrationStatus?.isRequired) {
    return null;
  }

  return (
    <View style={styles.alertContainer}>
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>⚠️ Migración de Base de Datos Requerida</Text>
        <Text style={styles.alertText}>
          La aplicación necesita actualizar el esquema de la base de datos para funcionar correctamente.
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={showInstructions}>
            <Text style={styles.buttonText}>Ver Instrucciones</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.dismissButton]} 
            onPress={handleDismiss}
          >
            <Text style={[styles.buttonText, styles.dismissButtonText]}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default MigrationAlert;
