
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { saveEvent, generateEventId, loadEvents } from '../utils/storage';
import { packages } from '../data/packages';
import PackageCard from '../components/PackageCard';
import Button from '../components/Button';
import { Event } from '../types';

const ScheduleScreen: React.FC = () => {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    childName: '',
    packageType: 'Abra' as 'Abra' | 'Kadabra' | 'Abrakadabra',
    time: '',
    totalAmount: 0,
    deposit: 0,
    notes: '',
    date: date || ''
  });
  const [existingEvents, setExistingEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (formData.packageType && formData.date) {
      const selectedPackage = packages.find(p => p.name === formData.packageType);
      if (selectedPackage) {
        const eventDate = new Date(formData.date);
        const isWeekend = eventDate.getDay() === 0 || eventDate.getDay() === 6;
        const price = isWeekend ? selectedPackage.weekendPrice : selectedPackage.weekdayPrice;
        setFormData(prev => ({ ...prev, totalAmount: price }));
      }
    }
  }, [formData.packageType, formData.date]);

  useEffect(() => {
    loadExistingEvents();
  }, []);

  useEffect(() => {
    if (date) {
      setFormData(prev => ({ ...prev, date }));
    }
  }, [date]);

  const loadExistingEvents = async () => {
    try {
      console.log('📥 Loading existing events for validation...');
      const events = await loadEvents();
      setExistingEvents(events);
      console.log('✅ Loaded existing events:', events.length);
    } catch (error: any) {
      console.error('❌ Error loading existing events:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    console.log('🔍 Validating form data...');
    
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
    
    if (!formData.time.trim()) {
      Alert.alert('Error', 'Por favor ingresa la hora del evento');
      return false;
    }
    
    if (!formData.date) {
      Alert.alert('Error', 'Por favor selecciona una fecha');
      return false;
    }
    
    if (formData.totalAmount <= 0) {
      Alert.alert('Error', 'El monto total debe ser mayor a 0');
      return false;
    }
    
    if (formData.deposit < 0) {
      Alert.alert('Error', 'El anticipo no puede ser negativo');
      return false;
    }
    
    if (formData.deposit > formData.totalAmount) {
      Alert.alert('Error', 'El anticipo no puede ser mayor al monto total');
      return false;
    }

    return true;
  };

  const continueValidation = (): boolean => {
    // Check for time conflicts
    const conflictingEvents = existingEvents.filter(event => 
      event.date === formData.date && event.time === formData.time
    );
    
    if (conflictingEvents.length > 0) {
      const conflictEvent = conflictingEvents[0];
      Alert.alert(
        'Conflicto de Horario',
        `Ya existe un evento programado para ${formData.date} a las ${formData.time}:\n\n` +
        `Cliente: ${conflictEvent.customerName}\n` +
        `Niño/a: ${conflictEvent.childName}\n\n` +
        `Por favor selecciona otro horario.`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (skipValidation: boolean = false) => {
    try {
      console.log('📝 Submitting event form...');
      
      if (!skipValidation) {
        if (!validateForm()) return;
        if (!continueValidation()) return;
      }

      const eventId = generateEventId();
      console.log('🆔 Generated event ID:', eventId);

      const newEvent: Event = {
        id: eventId,
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
        createdAt: new Date().toISOString(),
        // Initialize anticipo fields
        anticipo1Amount: formData.deposit,
        anticipo1Date: formData.deposit > 0 ? new Date().toISOString() : '',
        anticipo2Amount: 0,
        anticipo2Date: '',
        anticipo3Amount: 0,
        anticipo3Date: ''
      };

      console.log('💾 Saving new event:', newEvent);
      const result = await saveEvent(newEvent);

      if (result.success) {
        console.log('✅ Event saved successfully');
        Alert.alert(
          '✅ Evento Creado',
          `El evento para ${newEvent.childName} ha sido creado exitosamente.\n\n${result.message}`,
          [
            {
              text: 'Ver Evento',
              onPress: () => router.replace(`/event/${newEvent.id}`)
            },
            {
              text: 'Crear Otro',
              onPress: () => {
                // Reset form
                setFormData({
                  customerName: '',
                  customerPhone: '',
                  childName: '',
                  packageType: 'Abra',
                  time: '',
                  totalAmount: 0,
                  deposit: 0,
                  notes: '',
                  date: date || ''
                });
                loadExistingEvents(); // Refresh existing events
              }
            },
            {
              text: 'Ir al Inicio',
              onPress: () => router.replace('/')
            }
          ]
        );
      } else {
        console.error('❌ Failed to save event:', result.message);
        Alert.alert(
          '❌ Error',
          `No se pudo crear el evento:\n\n${result.message}`,
          [
            { text: 'Reintentar', onPress: () => handleSubmit(true) },
            { text: 'Cancelar', style: 'cancel' }
          ]
        );
      }
    } catch (error: any) {
      console.error('❌ Error submitting form:', error);
      Alert.alert(
        '❌ Error',
        `Error creando el evento: ${error.message || 'Unknown error'}`,
        [
          { text: 'Reintentar', onPress: () => handleSubmit(true) },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    }
  };

  const formatSelectedDate = (dateString: string): string => {
    if (!dateString) return 'No seleccionada';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={commonStyles.backButton}
          onPress={() => router.back()}
        >
          <Text style={commonStyles.buttonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={commonStyles.title}>📅 Agendar Evento</Text>
      </View>

      {/* Selected Date Display */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Fecha Seleccionada</Text>
        <View style={[
          commonStyles.selectedDateContainer,
          {
            backgroundColor: colors.primary,
            padding: 15,
            borderRadius: 10,
            alignItems: 'center'
          }
        ]}>
          <Text style={[
            commonStyles.selectedDateText,
            {
              color: colors.white,
              fontSize: 18,
              fontWeight: 'bold',
              textAlign: 'center'
            }
          ]}>
            {formatSelectedDate(formData.date)}
          </Text>
        </View>
      </View>

      {/* Package Selection */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Seleccionar Paquete</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {packages.map((pkg) => (
            <TouchableOpacity
              key={pkg.id}
              onPress={() => handleInputChange('packageType', pkg.name as any)}
              style={{ marginRight: 15 }}
            >
              <PackageCard
                package={pkg}
                isSelected={formData.packageType === pkg.name}
                selectedDate={formData.date}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Event Details Form */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Detalles del Evento</Text>
        
        <Text style={commonStyles.inputLabel}>Nombre del Cliente *</Text>
        <TextInput
          style={commonStyles.input}
          placeholder="Nombre completo del cliente"
          placeholderTextColor={colors.textLight}
          value={formData.customerName}
          onChangeText={(value) => handleInputChange('customerName', value)}
        />

        <Text style={commonStyles.inputLabel}>Teléfono del Cliente *</Text>
        <TextInput
          style={commonStyles.input}
          placeholder="+52 55 1234 5678"
          placeholderTextColor={colors.textLight}
          value={formData.customerPhone}
          onChangeText={(value) => handleInputChange('customerPhone', value)}
          keyboardType="phone-pad"
        />

        <Text style={commonStyles.inputLabel}>Nombre del Niño/a *</Text>
        <TextInput
          style={commonStyles.input}
          placeholder="Nombre del festejado/a"
          placeholderTextColor={colors.textLight}
          value={formData.childName}
          onChangeText={(value) => handleInputChange('childName', value)}
        />

        <Text style={commonStyles.inputLabel}>Hora del Evento *</Text>
        <TextInput
          style={commonStyles.input}
          placeholder="15:00"
          placeholderTextColor={colors.textLight}
          value={formData.time}
          onChangeText={(value) => handleInputChange('time', value)}
        />

        <Text style={commonStyles.inputLabel}>Monto Total</Text>
        <TextInput
          style={[commonStyles.input, { backgroundColor: colors.lightGray }]}
          value={`$${formData.totalAmount.toLocaleString()}`}
          editable={false}
        />

        <Text style={commonStyles.inputLabel}>Anticipo (Anticipo 1)</Text>
        <TextInput
          style={commonStyles.input}
          placeholder="0"
          placeholderTextColor={colors.textLight}
          value={formData.deposit.toString()}
          onChangeText={(value) => handleInputChange('deposit', parseFloat(value) || 0)}
          keyboardType="numeric"
        />

        <Text style={commonStyles.inputLabel}>Notas (Opcional)</Text>
        <TextInput
          style={[commonStyles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Notas adicionales sobre el evento..."
          placeholderTextColor={colors.textLight}
          value={formData.notes}
          onChangeText={(value) => handleInputChange('notes', value)}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Summary */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Resumen</Text>
        <View style={[
          commonStyles.summaryContainer,
          {
            backgroundColor: colors.cardBackground,
            padding: 15,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border
          }
        ]}>
          <View style={[commonStyles.summaryRow, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }]}>
            <Text style={[commonStyles.summaryLabel, { color: colors.text }]}>Total:</Text>
            <Text style={[commonStyles.summaryValue, { color: colors.text, fontWeight: 'bold' }]}>
              ${formData.totalAmount.toLocaleString()}
            </Text>
          </View>
          <View style={[commonStyles.summaryRow, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }]}>
            <Text style={[commonStyles.summaryLabel, { color: colors.text }]}>Anticipo 1:</Text>
            <Text style={[commonStyles.summaryValue, { color: colors.primary, fontWeight: 'bold' }]}>
              ${formData.deposit.toLocaleString()}
            </Text>
          </View>
          <View style={[commonStyles.summaryRow, { flexDirection: 'row', justifyContent: 'space-between' }]}>
            <Text style={[commonStyles.summaryLabel, { color: colors.text }]}>Saldo:</Text>
            <Text style={[
              commonStyles.summaryValue,
              { 
                color: (formData.totalAmount - formData.deposit) > 0 ? colors.warning : colors.success,
                fontWeight: 'bold'
              }
            ]}>
              ${(formData.totalAmount - formData.deposit).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Submit Button */}
      <View style={commonStyles.section}>
        <Button
          text="📅 Crear Evento"
          onPress={() => handleSubmit()}
          style={[
            buttonStyles.primary,
            {
              backgroundColor: colors.primary,
              paddingVertical: 15,
              borderRadius: 10
            }
          ]}
        />
      </View>
    </ScrollView>
  );
};

export default ScheduleScreen;
