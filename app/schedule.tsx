
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import PackageCard from '../components/PackageCard';
import { Event } from '../types';
import { packages } from '../data/packages';
import { saveEvent, generateEventId, loadEvents } from '../utils/storage';
import Button from '../components/Button';
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';

export default function ScheduleScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [existingEvents, setExistingEvents] = useState<Event[]>([]);
  const [formData, setFormData] = useState({
    date: date || '',
    time: '15:00',
    customerName: '',
    customerPhone: '',
    childName: '',
    packageType: 'Abra' as 'Abra' | 'Kadabra' | 'Abrakadabra',
    totalAmount: 0,
    deposit: 0,
    remainingAmount: 0,
    notes: ''
  });

  useEffect(() => {
    if (date) {
      setFormData(prev => ({ ...prev, date }));
      loadExistingEvents();
    }
  }, [date]);

  useEffect(() => {
    // Update pricing when package type or date changes
    const selectedPackage = packages.find(p => p.name === formData.packageType);
    if (selectedPackage && formData.date) {
      const eventDate = new Date(formData.date);
      const isWeekend = eventDate.getDay() === 0 || eventDate.getDay() === 6;
      const price = isWeekend ? selectedPackage.weekendPrice : selectedPackage.weekdayPrice;
      
      setFormData(prev => ({
        ...prev,
        totalAmount: price,
        remainingAmount: price - prev.deposit
      }));
    }
  }, [formData.packageType, formData.date]);

  const loadExistingEvents = async () => {
    try {
      console.log('🔄 Loading existing events for date validation...');
      const events = await loadEvents();
      setExistingEvents(events);
    } catch (error) {
      console.error('❌ Error loading existing events:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate remaining amount when deposit changes
      if (field === 'deposit') {
        updated.remainingAmount = updated.totalAmount - (value as number);
      }
      
      return updated;
    });
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

    if (formData.deposit < 0 || formData.deposit > formData.totalAmount) {
      Alert.alert('Error', 'El anticipo debe ser entre 0 y el total del evento');
      return false;
    }

    return true;
  };

  const continueValidation = () => {
    // Check if date is already booked
    const existingEvent = existingEvents.find(event => event.date === formData.date);
    
    if (existingEvent) {
      Alert.alert(
        'Fecha Ocupada',
        `Ya hay un evento agendado para esta fecha:\n\n` +
        `Cliente: ${existingEvent.customerName}\n` +
        `Niño/a: ${existingEvent.childName}\n` +
        `Paquete: ${existingEvent.packageType}\n\n` +
        `¿Deseas ver los detalles del evento existente?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Ver Evento', 
            onPress: () => router.push(`/event/${existingEvent.id}`)
          }
        ]
      );
      return;
    }

    // Check if it's a past date
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      Alert.alert(
        'Fecha Pasada',
        'No se pueden agendar eventos en fechas pasadas. ¿Deseas continuar de todas formas?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: handleSubmit }
        ]
      );
      return;
    }

    handleSubmit();
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
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
        remainingAmount: formData.remainingAmount,
        isPaid: formData.remainingAmount === 0,
        notes: formData.notes.trim(),
        createdAt: new Date().toISOString()
      };

      console.log('📝 Event data to save:', newEvent);
      
      const result = await saveEvent(newEvent);
      console.log('💾 Save result:', result);

      if (result.success) {
        // Determine success message based on where it was saved
        let successMessage = `El evento ha sido agendado exitosamente para ${formData.customerName}.\n\n` +
          `📅 Fecha: ${formData.date}\n` +
          `👶 Niño/a: ${formData.childName}\n` +
          `🎉 Paquete: ${formData.packageType}\n` +
          `💰 Total: $${formData.totalAmount}\n` +
          `💵 Anticipo: $${formData.deposit}\n` +
          `📊 Restante: $${formData.remainingAmount}\n\n`;

        if (result.savedToGoogleSheets) {
          successMessage += '✅ Guardado en Google Sheets y localmente';
        } else {
          successMessage += '⚠️ Guardado localmente (Google Sheets no disponible)';
        }

        Alert.alert(
          '🎉 Evento Guardado Exitosamente',
          successMessage,
          [
            {
              text: 'Ir al Menú Principal',
              onPress: () => {
                console.log('✅ Event saved successfully, navigating to main menu');
                router.replace('/');
              }
            }
          ]
        );
      } else {
        throw new Error('Failed to save event');
      }
    } catch (error) {
      console.error('❌ Error saving event:', error);
      Alert.alert(
        'Error',
        'Ocurrió un error al guardar el evento. Por favor intenta nuevamente.',
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
          {formData.date ? `Fecha: ${formData.date}` : 'Selecciona los detalles del evento'}
        </Text>
      </View>

      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Información del Cliente</Text>
        
        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Fecha del Evento</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.date}
            onChangeText={(value) => handleInputChange('date', value)}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#999"
          />
        </View>

        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Hora del Evento</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.time}
            onChangeText={(value) => handleInputChange('time', value)}
            placeholder="15:00"
            placeholderTextColor="#999"
          />
        </View>

        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Nombre del Cliente</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.customerName}
            onChangeText={(value) => handleInputChange('customerName', value)}
            placeholder="Nombre completo del cliente"
            placeholderTextColor="#999"
          />
        </View>

        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Teléfono</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.customerPhone}
            onChangeText={(value) => handleInputChange('customerPhone', value)}
            placeholder="+52 55 1234 5678"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Nombre del Niño/a</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.childName}
            onChangeText={(value) => handleInputChange('childName', value)}
            placeholder="Nombre del festejado"
            placeholderTextColor="#999"
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
              key={pkg.id}
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
          <Text style={commonStyles.label}>Total del Evento</Text>
          <Text style={[commonStyles.input, { backgroundColor: '#f5f5f5', color: '#666' }]}>
            ${formData.totalAmount}
          </Text>
        </View>

        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Anticipo Pagado</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.deposit.toString()}
            onChangeText={(value) => handleInputChange('deposit', parseFloat(value) || 0)}
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Monto Restante</Text>
          <Text style={[commonStyles.input, { backgroundColor: '#f5f5f5', color: '#666' }]}>
            ${formData.remainingAmount}
          </Text>
        </View>

        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Notas Adicionales</Text>
          <TextInput
            style={[commonStyles.input, { height: 80, textAlignVertical: 'top' }]}
            value={formData.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            placeholder="Notas especiales, alergias, etc."
            placeholderTextColor="#999"
            multiline
          />
        </View>
      </View>

      <View style={[commonStyles.section, { paddingBottom: 40 }]}>
        <Button
          text="Agendar Evento"
          onPress={continueValidation}
          style={[buttonStyles.primary, { backgroundColor: colors.primary }]}
        />
      </View>
    </ScrollView>
  );
}
