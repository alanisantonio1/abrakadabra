
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { packages } from '../data/packages';
import PackageCard from '../components/PackageCard';
import { Event } from '../types';
import { saveEvent, generateEventId, loadEvents } from '../utils/storage';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import Button from '../components/Button';

export default function ScheduleScreen() {
  const [formData, setFormData] = useState({
    date: '',
    time: '15:00',
    customerName: '',
    customerPhone: '',
    childName: '',
    packageType: 'Abra' as 'Abra' | 'Kadabra' | 'Abrakadabra',
    totalAmount: 0,
    deposit: 0,
    notes: ''
  });

  const [existingEvents, setExistingEvents] = useState<Event[]>([]);
  const { date } = useLocalSearchParams();

  useEffect(() => {
    if (date && typeof date === 'string') {
      setFormData(prev => ({ ...prev, date }));
    }
  }, [date]);

  useEffect(() => {
    loadExistingEvents();
  }, []);

  useEffect(() => {
    if (formData.packageType && formData.date) {
      const selectedPackage = packages.find(p => p.name === formData.packageType);
      if (selectedPackage) {
        const eventDate = new Date(formData.date);
        const isWeekend = eventDate.getDay() === 0 || eventDate.getDay() === 6;
        const price = isWeekend ? selectedPackage.weekendPrice : selectedPackage.weekdayPrice;
        setFormData(prev => ({ 
          ...prev, 
          totalAmount: price,
          deposit: Math.round(price * 0.5) // 50% deposit by default
        }));
      }
    }
  }, [formData.packageType, formData.date]);

  const loadExistingEvents = async () => {
    try {
      const events = await loadEvents();
      setExistingEvents(events);
    } catch (error) {
      console.error('❌ Error loading existing events:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.date) {
      Alert.alert('Error', 'Por favor selecciona una fecha');
      return false;
    }
    if (!formData.customerName.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre del cliente');
      return false;
    }
    if (!formData.customerPhone.trim()) {
      Alert.alert('Error', 'Por favor ingresa el teléfono del cliente');
      return false;
    }
    if (!formData.childName.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre del niño/a');
      return false;
    }
    if (formData.totalAmount <= 0) {
      Alert.alert('Error', 'El monto total debe ser mayor a 0');
      return false;
    }
    if (formData.deposit < 0 || formData.deposit > formData.totalAmount) {
      Alert.alert('Error', 'El anticipo debe ser entre 0 y el monto total');
      return false;
    }

    return true;
  };

  const continueValidation = () => {
    // Check if date is already booked
    const eventDate = formData.date;
    const existingEvent = existingEvents.find(event => event.date === eventDate);
    
    if (existingEvent) {
      Alert.alert(
        'Fecha Ocupada',
        `Ya hay un evento programado para el ${eventDate}:\n\n` +
        `Cliente: ${existingEvent.customerName}\n` +
        `Niño/a: ${existingEvent.childName}\n` +
        `Paquete: ${existingEvent.packageType}\n\n` +
        '¿Deseas continuar de todas formas?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: handleSubmit }
        ]
      );
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('📝 Starting event submission...');
      
      const event: Event = {
        id: generateEventId(),
        date: formData.date,
        time: formData.time,
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        childName: formData.childName.trim(),
        packageType: formData.packageType,
        totalAmount: formData.totalAmount,
        deposit: formData.deposit,
        remainingAmount: formData.totalAmount - formData.deposit,
        isPaid: formData.deposit >= formData.totalAmount,
        notes: formData.notes.trim(),
        createdAt: new Date().toISOString()
      };

      console.log('💾 Saving event:', event);
      const result = await saveEvent(event);
      
      if (result.success) {
        let message = '✅ Evento guardado exitosamente';
        
        if (result.savedToGoogleSheets) {
          message += '\n📊 Guardado en Google Sheets';
        } else if (result.googleSheetsError) {
          message += '\n⚠️ Google Sheets: ' + result.googleSheetsError;
          message += '\n📱 Guardado localmente como respaldo';
        }
        
        Alert.alert(
          'Éxito',
          message,
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('✅ Event saved successfully, navigating back');
                router.back();
              }
            }
          ]
        );
      } else {
        console.error('❌ Failed to save event:', result.error);
        Alert.alert(
          'Error',
          'Error al guardar el evento: ' + (result.error || 'Error desconocido'),
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error);
      Alert.alert(
        'Error',
        'Error inesperado al guardar el evento: ' + error,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={[commonStyles.backButton, { backgroundColor: colors.secondary }]}
          onPress={() => router.back()}
        >
          <Text style={[commonStyles.backButtonText, { color: 'white' }]}>← Volver</Text>
        </TouchableOpacity>
        <Text style={commonStyles.title}>Agendar Evento</Text>
        <Text style={commonStyles.subtitle}>
          {formData.date ? `Fecha: ${formData.date}` : 'Completa los datos del evento'}
        </Text>
      </View>

      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Información del Cliente</Text>
        
        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Nombre del Cliente *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.customerName}
            onChangeText={(value) => handleInputChange('customerName', value)}
            placeholder="Nombre completo del cliente"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Teléfono *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.customerPhone}
            onChangeText={(value) => handleInputChange('customerPhone', value)}
            placeholder="+52 55 1234 5678"
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
          />
        </View>

        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Nombre del Niño/a *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.childName}
            onChangeText={(value) => handleInputChange('childName', value)}
            placeholder="Nombre del festejado"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Seleccionar Paquete</Text>
        {packages.map((pkg) => {
          const eventDate = new Date(formData.date);
          const isWeekend = eventDate.getDay() === 0 || eventDate.getDay() === 6;
          
          return (
            <PackageCard
              key={pkg.name}
              package={pkg}
              isWeekend={isWeekend}
              isSelected={formData.packageType === pkg.name}
              onSelect={() => handleInputChange('packageType', pkg.name)}
            />
          );
        })}
      </View>

      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Información de Pago</Text>
        
        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Monto Total</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.totalAmount.toString()}
            onChangeText={(value) => handleInputChange('totalAmount', parseFloat(value) || 0)}
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
        </View>

        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Anticipo</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.deposit.toString()}
            onChangeText={(value) => handleInputChange('deposit', parseFloat(value) || 0)}
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
        </View>

        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Saldo Restante</Text>
          <Text style={[commonStyles.input, { backgroundColor: colors.backgroundSecondary, color: colors.textSecondary }]}>
            ${(formData.totalAmount - formData.deposit).toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Notas Adicionales</Text>
        <TextInput
          style={[commonStyles.input, { height: 80, textAlignVertical: 'top' }]}
          value={formData.notes}
          onChangeText={(value) => handleInputChange('notes', value)}
          placeholder="Notas opcionales sobre el evento..."
          placeholderTextColor={colors.textSecondary}
          multiline
        />
      </View>

      <View style={commonStyles.section}>
        <Button
          title="Guardar Evento"
          onPress={() => {
            if (validateForm()) {
              continueValidation();
            }
          }}
          style={[buttonStyles.primary, { backgroundColor: colors.primary }]}
        />
      </View>

      <View style={commonStyles.section}>
        <Text style={[commonStyles.sectionTitle, { color: colors.primary, textAlign: 'center' }]}>
          📊 Se guardará en Google Sheets
        </Text>
        <Text style={[commonStyles.emptyStateSubtext, { textAlign: 'center' }]}>
          El evento se almacenará directamente en tu hoja de cálculo
        </Text>
      </View>
    </ScrollView>
  );
}
