
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { saveEvent, generateEventId, loadEvents } from '../utils/storage';
import { Event } from '../types';
import { packages } from '../data/packages';
import PackageCard from '../components/PackageCard';
import Button from '../components/Button';

const ScheduleScreen: React.FC = () => {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const [existingEvents, setExistingEvents] = useState<Event[]>([]);
  const [formData, setFormData] = useState({
    date: date || '',
    time: '',
    customerName: '',
    customerPhone: '',
    childName: '',
    packageType: '' as 'Abra' | 'Kadabra' | 'Abrakadabra' | '',
    totalAmount: 0,
    deposit: 0,
    notes: ''
  });

  useEffect(() => {
    if (date) {
      console.log('📅 Pre-selected date:', date);
      setFormData(prev => ({ ...prev, date }));
    }
  }, [date]);

  useEffect(() => {
    console.log('📋 ScheduleScreen mounted, loading existing events...');
    loadExistingEvents();
  }, []);

  useEffect(() => {
    if (formData.packageType && formData.date) {
      const selectedPackage = packages.find(p => p.name === formData.packageType);
      if (selectedPackage) {
        const selectedDate = new Date(formData.date);
        const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
        const price = isWeekend ? selectedPackage.weekendPrice : selectedPackage.weekdayPrice;
        
        setFormData(prev => ({
          ...prev,
          totalAmount: price,
          deposit: Math.round(price * 0.5) // Default 50% deposit
        }));
      }
    }
  }, [formData.packageType, formData.date]);

  const loadExistingEvents = async () => {
    try {
      console.log('📥 Loading existing events...');
      const events = await loadEvents();
      setExistingEvents(events);
      console.log('✅ Existing events loaded:', events.length);
    } catch (error: any) {
      console.error('❌ Error loading existing events:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate remaining amount when deposit changes
    if (field === 'deposit') {
      const depositAmount = typeof value === 'number' ? value : parseFloat(value.toString()) || 0;
      setFormData(prev => ({
        ...prev,
        deposit: depositAmount,
        remainingAmount: prev.totalAmount - depositAmount
      }));
    }
  };

  const validateForm = (): string | null => {
    if (!formData.date) return 'Selecciona una fecha';
    if (!formData.time) return 'Selecciona una hora';
    if (!formData.customerName.trim()) return 'Ingresa el nombre del cliente';
    if (!formData.customerPhone.trim()) return 'Ingresa el teléfono del cliente';
    if (!formData.childName.trim()) return 'Ingresa el nombre del niño/a';
    if (!formData.packageType) return 'Selecciona un paquete';
    if (formData.totalAmount <= 0) return 'El monto total debe ser mayor a 0';
    if (formData.deposit < 0) return 'El anticipo no puede ser negativo';
    if (formData.deposit > formData.totalAmount) return 'El anticipo no puede ser mayor al total';

    // Check for time conflicts
    const selectedDateTime = `${formData.date} ${formData.time}`;
    const conflictingEvent = existingEvents.find(event => 
      event.date === formData.date && event.time === formData.time
    );

    if (conflictingEvent) {
      return `Ya existe un evento programado para ${formData.date} a las ${formData.time}`;
    }

    return null;
  };

  const continueValidation = (): boolean => {
    // Additional validations that can be bypassed
    const warnings: string[] = [];

    // Check if it's a past date
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      warnings.push('La fecha seleccionada es en el pasado');
    }

    // Check if deposit is very low
    const depositPercentage = (formData.deposit / formData.totalAmount) * 100;
    if (depositPercentage < 20) {
      warnings.push('El anticipo es menor al 20% del total');
    }

    if (warnings.length > 0) {
      Alert.alert(
        '⚠️ Advertencias',
        warnings.join('\n\n') + '\n\n¿Deseas continuar de todas formas?',
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
      console.log('📝 Submitting event form...');

      // Basic validation
      const validationError = validateForm();
      if (validationError) {
        Alert.alert('Error de Validación', validationError);
        return;
      }

      // Additional validation (can be skipped)
      if (!skipValidation && !continueValidation()) {
        return;
      }

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

      console.log('💾 Saving new event:', newEvent);
      const result = await saveEvent(newEvent);

      if (result.success) {
        Alert.alert(
          '✅ Evento Guardado',
          `El evento para ${formData.childName} ha sido guardado exitosamente.\n\n${result.message}`,
          [
            {
              text: 'Ver Evento',
              onPress: () => router.replace(`/event/${newEvent.id}`)
            },
            {
              text: 'Crear Otro',
              onPress: () => {
                // Reset form but keep date
                setFormData({
                  date: formData.date,
                  time: '',
                  customerName: '',
                  customerPhone: '',
                  childName: '',
                  packageType: '',
                  totalAmount: 0,
                  deposit: 0,
                  notes: ''
                });
                loadExistingEvents(); // Refresh existing events
              }
            },
            {
              text: 'Ir a Inicio',
              onPress: () => router.replace('/')
            }
          ]
        );
      } else {
        Alert.alert(
          '❌ Error',
          `No se pudo guardar el evento:\n\n${result.message}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('❌ Error submitting form:', error);
      Alert.alert(
        '❌ Error Inesperado',
        `Ocurrió un error al guardar el evento: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  };

  const formatSelectedDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={commonStyles.backButton}
          onPress={() => router.back()}
        >
          <Text style={commonStyles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={commonStyles.title}>🎪 Agendar Evento</Text>
        {formData.date && (
          <Text style={commonStyles.subtitle}>
            📅 {formatSelectedDate(formData.date)}
          </Text>
        )}
      </View>

      {/* Date and Time */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>📅 Fecha y Hora</Text>
        
        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Fecha *</Text>
          <TextInput
            style={[commonStyles.input, { backgroundColor: colors.lightGray }]}
            value={formData.date}
            onChangeText={(value) => handleInputChange('date', value)}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.gray}
            editable={!date} // Make read-only if date was pre-selected
          />
          {date && (
            <Text style={commonStyles.infoText}>
              ✅ Fecha seleccionada desde el calendario
            </Text>
          )}
        </View>

        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Hora *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.time}
            onChangeText={(value) => handleInputChange('time', value)}
            placeholder="HH:MM (ej: 15:00)"
            placeholderTextColor={colors.gray}
          />
        </View>
      </View>

      {/* Customer Information */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>👥 Información del Cliente</Text>
        
        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Nombre del Cliente *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.customerName}
            onChangeText={(value) => handleInputChange('customerName', value)}
            placeholder="Nombre completo"
            placeholderTextColor={colors.gray}
          />
        </View>

        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Teléfono *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.customerPhone}
            onChangeText={(value) => handleInputChange('customerPhone', value)}
            placeholder="+52 55 1234 5678"
            keyboardType="phone-pad"
            placeholderTextColor={colors.gray}
          />
        </View>

        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Nombre del Niño/a *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.childName}
            onChangeText={(value) => handleInputChange('childName', value)}
            placeholder="Nombre del festejado"
            placeholderTextColor={colors.gray}
          />
        </View>
      </View>

      {/* Package Selection */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>📦 Seleccionar Paquete *</Text>
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            package={pkg}
            isSelected={formData.packageType === pkg.name}
            onSelect={() => handleInputChange('packageType', pkg.name)}
            selectedDate={formData.date}
          />
        ))}
      </View>

      {/* Payment Information */}
      {formData.packageType && (
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>💰 Información de Pago</Text>
          
          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Monto Total</Text>
            <TextInput
              style={commonStyles.input}
              value={formData.totalAmount.toString()}
              onChangeText={(value) => handleInputChange('totalAmount', parseFloat(value) || 0)}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={colors.gray}
            />
          </View>

          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Anticipo</Text>
            <TextInput
              style={commonStyles.input}
              value={formData.deposit.toString()}
              onChangeText={(value) => handleInputChange('deposit', parseFloat(value) || 0)}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={colors.gray}
            />
          </View>

          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Saldo Restante</Text>
            <View style={[commonStyles.input, { backgroundColor: colors.lightGray, justifyContent: 'center' }]}>
              <Text style={{ fontSize: 16, color: colors.text, fontWeight: '600' }}>
                ${(formData.totalAmount - formData.deposit).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Notes */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>📝 Notas Adicionales</Text>
        <TextInput
          style={[commonStyles.input, { height: 100, textAlignVertical: 'top' }]}
          value={formData.notes}
          onChangeText={(value) => handleInputChange('notes', value)}
          placeholder="Notas especiales, alergias, solicitudes..."
          multiline
          placeholderTextColor={colors.gray}
        />
      </View>

      {/* Submit Button */}
      <View style={commonStyles.section}>
        <Button
          title="🎉 Agendar Evento"
          onPress={() => handleSubmit()}
          style={buttonStyles.primary}
        />
      </View>
    </ScrollView>
  );
};

export default ScheduleScreen;
