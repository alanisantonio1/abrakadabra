
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { packages } from '../data/packages';
import PackageCard from '../components/PackageCard';
import { saveEvent, generateEventId, loadEvents } from '../utils/storage';
import Button from '../components/Button';
import { Event } from '../types';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';

const ScheduleScreen: React.FC = () => {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [existingEvents, setExistingEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  const [formData, setFormData] = useState({
    date: date || '',
    time: '15:00',
    customerName: '',
    customerPhone: '',
    childName: '',
    packageType: 'Abra' as 'Abra' | 'Kadabra' | 'Abrakadabra',
    totalAmount: 0,
    deposit: 0,
    notes: ''
  });

  useEffect(() => {
    loadExistingEvents();
  }, []);

  useEffect(() => {
    const selectedPackage = packages.find(p => p.name === formData.packageType);
    if (selectedPackage && formData.date) {
      const eventDate = new Date(formData.date);
      const isWeekend = eventDate.getDay() === 0 || eventDate.getDay() === 6;
      const price = isWeekend ? selectedPackage.weekendPrice : selectedPackage.weekdayPrice;
      setFormData(prev => ({ ...prev, totalAmount: price }));
    }
  }, [formData.packageType, formData.date]);

  useEffect(() => {
    if (date) {
      setFormData(prev => ({ ...prev, date }));
    }
  }, [date]);

  const loadExistingEvents = async () => {
    try {
      setIsLoading(true);
      console.log('📥 Loading existing events...');
      const events = await loadEvents();
      setExistingEvents(events);
      console.log('✅ Existing events loaded:', events.length);
    } catch (error) {
      console.error('❌ Error loading existing events:', error);
      Alert.alert(
        'Error',
        'Error cargando eventos existentes del almacenamiento local.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
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
    
    if (formData.deposit > formData.totalAmount) {
      Alert.alert('Error', 'El anticipo no puede ser mayor al total');
      return false;
    }

    return true;
  };

  const continueValidation = (): boolean => {
    // Check for duplicate events on the same date
    const existingEventOnDate = existingEvents.find(event => event.date === formData.date);
    
    if (existingEventOnDate) {
      Alert.alert(
        'Fecha Ocupada',
        `Ya existe un evento programado para ${formData.date}:\n\n` +
        `Cliente: ${existingEventOnDate.customerName}\n` +
        `Niño/a: ${existingEventOnDate.childName}\n` +
        `Paquete: ${existingEventOnDate.packageType}\n\n` +
        `¿Deseas continuar de todas formas?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: () => handleSubmit(true) }
        ]
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (skipValidation: boolean = false) => {
    try {
      if (!validateForm()) return;
      
      if (!skipValidation && !continueValidation()) return;

      setIsSaving(true);
      console.log('💾 Saving new event...');

      const newEvent: Event = {
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

      console.log('📋 Event details:', {
        id: newEvent.id,
        date: newEvent.date,
        customerName: newEvent.customerName,
        childName: newEvent.childName,
        packageType: newEvent.packageType,
        totalAmount: newEvent.totalAmount,
        deposit: newEvent.deposit
      });

      const result = await saveEvent(newEvent);

      if (result.success) {
        console.log('✅ Event saved successfully');
        Alert.alert(
          'Evento Guardado',
          result.message,
          [
            {
              text: 'OK',
              onPress: () => {
                router.back();
              }
            }
          ]
        );
      } else {
        console.error('❌ Failed to save event:', result.message);
        Alert.alert(
          'Error',
          result.message,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error saving event:', error);
      Alert.alert(
        'Error',
        `Error inesperado al guardar el evento: ${error}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={[commonStyles.backButton, { backgroundColor: colors.secondary }]}
          onPress={() => router.back()}
        >
          <Text style={[commonStyles.buttonText, { color: 'white' }]}>← Volver</Text>
        </TouchableOpacity>
        <Text style={commonStyles.title}>📅 Nuevo Evento</Text>
        <Text style={commonStyles.subtitle}>
          {formData.date ? `Fecha: ${formData.date}` : 'Selecciona los detalles del evento'}
        </Text>
      </View>

      {isLoading && (
        <View style={commonStyles.statusContainer}>
          <Text style={commonStyles.statusText}>⏳ Cargando eventos existentes...</Text>
        </View>
      )}

      {/* Date and Time */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>📅 Fecha y Hora</Text>
        
        <Text style={commonStyles.inputLabel}>Fecha del Evento</Text>
        <TextInput
          style={commonStyles.input}
          value={formData.date}
          onChangeText={(value) => handleInputChange('date', value)}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textLight}
        />

        <Text style={commonStyles.inputLabel}>Hora del Evento</Text>
        <TextInput
          style={commonStyles.input}
          value={formData.time}
          onChangeText={(value) => handleInputChange('time', value)}
          placeholder="HH:MM"
          placeholderTextColor={colors.textLight}
        />
      </View>

      {/* Customer Information */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>👤 Información del Cliente</Text>
        
        <Text style={commonStyles.inputLabel}>Nombre del Cliente</Text>
        <TextInput
          style={commonStyles.input}
          value={formData.customerName}
          onChangeText={(value) => handleInputChange('customerName', value)}
          placeholder="Nombre completo del cliente"
          placeholderTextColor={colors.textLight}
        />

        <Text style={commonStyles.inputLabel}>Teléfono</Text>
        <TextInput
          style={commonStyles.input}
          value={formData.customerPhone}
          onChangeText={(value) => handleInputChange('customerPhone', value)}
          placeholder="+52 55 1234 5678"
          placeholderTextColor={colors.textLight}
          keyboardType="phone-pad"
        />

        <Text style={commonStyles.inputLabel}>Nombre del Niño/a</Text>
        <TextInput
          style={commonStyles.input}
          value={formData.childName}
          onChangeText={(value) => handleInputChange('childName', value)}
          placeholder="Nombre del festejado"
          placeholderTextColor={colors.textLight}
        />
      </View>

      {/* Package Selection */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>📦 Seleccionar Paquete</Text>
        
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

      {/* Payment Information */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>💰 Información de Pago</Text>
        
        <Text style={commonStyles.inputLabel}>Total del Evento</Text>
        <TextInput
          style={[commonStyles.input, { backgroundColor: colors.lightGray }]}
          value={formData.totalAmount.toString()}
          editable={false}
          placeholder="0"
        />

        <Text style={commonStyles.inputLabel}>Anticipo Pagado</Text>
        <TextInput
          style={commonStyles.input}
          value={formData.deposit.toString()}
          onChangeText={(value) => handleInputChange('deposit', parseFloat(value) || 0)}
          placeholder="0"
          placeholderTextColor={colors.textLight}
          keyboardType="numeric"
        />

        <Text style={commonStyles.inputLabel}>Saldo Pendiente</Text>
        <TextInput
          style={[commonStyles.input, { backgroundColor: colors.lightGray }]}
          value={(formData.totalAmount - formData.deposit).toString()}
          editable={false}
          placeholder="0"
        />
      </View>

      {/* Notes */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>📝 Notas Adicionales</Text>
        
        <TextInput
          style={[commonStyles.input, { height: 80, textAlignVertical: 'top' }]}
          value={formData.notes}
          onChangeText={(value) => handleInputChange('notes', value)}
          placeholder="Notas adicionales sobre el evento..."
          placeholderTextColor={colors.textLight}
          multiline
        />
      </View>

      {/* Submit Button */}
      <View style={commonStyles.section}>
        <Button
          title={isSaving ? "⏳ Guardando..." : "💾 Reservar Evento"}
          onPress={() => handleSubmit()}
          style={[
            buttonStyles.primary,
            { backgroundColor: isSaving ? colors.gray : colors.success }
          ]}
          disabled={isSaving}
        />
      </View>

      {/* Status */}
      {isSaving && (
        <View style={commonStyles.statusContainer}>
          <Text style={commonStyles.statusText}>⏳ Guardando evento en almacenamiento local...</Text>
          <Text style={commonStyles.statusSubtext}>
            Por favor espera un momento
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default ScheduleScreen;
