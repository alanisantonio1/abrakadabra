
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { saveEvent, generateEventId, loadEvents } from '../utils/storage';
import { calculateEventCost, getPricingInfo } from '../utils/whatsapp';
import { packages } from '../data/packages';
import PackageCard from '../components/PackageCard';
import Button from '../components/Button';
import { Event } from '../types';

const scheduleStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingBottom: 120, // Extra space to prevent button overlap
  },
  submitButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: 20,
    paddingBottom: 40, // Extra padding for system buttons
    borderTopWidth: 1,
    borderTopColor: colors.border,
    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
    elevation: 5,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textLight,
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

// FIXED: Helper function to parse date string correctly
const parseDateString = (dateString: string): { year: number; month: number; day: number } => {
  const parts = dateString.split('-');
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10) - 1, // Convert to 0-based month
    day: parseInt(parts[2], 10)
  };
};

// FIXED: Helper function to get day of week correctly
const getDayOfWeek = (dateString: string): number => {
  const { year, month, day } = parseDateString(dateString);
  // Create date in local timezone to avoid day shifting
  const date = new Date(year, month, day);
  return date.getDay(); // 0 = Sunday, 1 = Monday, etc.
};

// FIXED: Helper function to format date for display
const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return 'No seleccionada';
  
  try {
    const { year, month, day } = parseDateString(dateString);
    const dayOfWeek = getDayOfWeek(dateString);
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    console.log(`🗓️ FORMATTING DATE: ${dateString}`);
    console.log(`   - Parsed: ${day}/${month + 1}/${year}`);
    console.log(`   - Day of week: ${dayOfWeek} (${dayNames[dayOfWeek]})`);
    console.log(`   - Formatted: ${dayNames[dayOfWeek]} ${day} de ${monthNames[month]}`);
    
    return `${dayNames[dayOfWeek]} ${day} de ${monthNames[month]}`;
  } catch (error) {
    console.error('❌ Error formatting date:', error);
    return dateString;
  }
};

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
  const [isSubmitting, setIsSubmitting] = useState(false); // NEW: State to prevent multiple submissions

  // UPDATED: Calculate price based on both date and package type
  useEffect(() => {
    if (formData.date && formData.packageType) {
      const price = calculateEventCost(formData.date, formData.packageType);
      console.log(`💰 SCHEDULE: Updating price for ${formData.packageType} on ${formData.date}: $${price.toLocaleString()}`);
      setFormData(prev => ({ ...prev, totalAmount: price }));
    }
  }, [formData.date, formData.packageType]);

  useEffect(() => {
    loadExistingEvents();
  }, []);

  useEffect(() => {
    if (date) {
      console.log('📅 SCHEDULE: Received date parameter:', date);
      console.log('📅 SCHEDULE: Formatted display:', formatDateForDisplay(date));
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

  const handlePackageSelect = (packageName: string) => {
    console.log('📦 Package selected:', packageName);
    handleInputChange('packageType', packageName);
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
        `Ya existe un evento programado para ${formatDateForDisplay(formData.date)} a las ${formData.time}:\n\n` +
        `Cliente: ${conflictEvent.customerName}\n` +
        `Niño/a: ${conflictEvent.childName}\n\n` +
        `Por favor selecciona otro horario.`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (skipValidation: boolean = false) => {
    // FIXED: Prevent multiple submissions
    if (isSubmitting) {
      console.log('⚠️ Submit already in progress, ignoring duplicate request');
      return;
    }

    try {
      setIsSubmitting(true); // FIXED: Set submitting state
      console.log('📝 Submitting event form...');
      console.log('📅 SUBMIT: Date being saved:', formData.date);
      console.log('📦 SUBMIT: Package type:', formData.packageType);
      console.log('💰 SUBMIT: Total amount:', formData.totalAmount);
      console.log('📅 SUBMIT: Formatted display:', formatDateForDisplay(formData.date));
      
      if (!skipValidation) {
        if (!validateForm()) {
          setIsSubmitting(false); // FIXED: Reset submitting state on validation failure
          return;
        }
        if (!continueValidation()) {
          setIsSubmitting(false); // FIXED: Reset submitting state on validation failure
          return;
        }
      }

      const eventId = generateEventId();
      console.log('🆔 Generated event ID:', eventId);
      console.log('🔍 UUID format check:', {
        id: eventId,
        length: eventId.length,
        hasHyphens: eventId.includes('-'),
        parts: eventId.split('-').length
      });

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
        // Initialize anticipo fields - simplified structure
        anticipo1Amount: formData.deposit,
        anticipo1Date: formData.deposit > 0 ? new Date().toISOString().split('T')[0] : '',
      };

      console.log('💾 Saving new event:', newEvent);
      const result = await saveEvent(newEvent);

      if (result.success) {
        console.log('✅ Event saved successfully');
        // FIXED: Show success message with proper formatting
        Alert.alert(
          '✅ Guardado Exitosamente',
          `El evento para ${newEvent.childName} ha sido creado exitosamente para ${formatDateForDisplay(newEvent.date)}.\n\n${result.message}`,
          [
            {
              text: 'Ver Evento',
              onPress: () => {
                setIsSubmitting(false); // FIXED: Reset submitting state
                router.replace(`/event/${newEvent.id}`);
              }
            },
            {
              text: 'Crear Otro',
              onPress: () => {
                setIsSubmitting(false); // FIXED: Reset submitting state
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
              onPress: () => {
                setIsSubmitting(false); // FIXED: Reset submitting state
                router.replace('/');
              }
            }
          ]
        );
      } else {
        console.error('❌ Failed to save event:', result.message);
        setIsSubmitting(false); // FIXED: Reset submitting state on error
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
      setIsSubmitting(false); // FIXED: Reset submitting state on error
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

  // UPDATED: Get pricing info for the selected package
  const getCurrentPricingInfo = () => {
    if (!formData.date) return { cost: 0, dayName: '', priceCategory: 'Selecciona fecha' };
    return getPricingInfo(formData.date, formData.packageType);
  };

  const currentPricing = getCurrentPricingInfo();

  return (
    <View style={scheduleStyles.container}>
      <ScrollView 
        style={commonStyles.container}
        contentContainerStyle={scheduleStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
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
                textAlign: 'center',
                marginBottom: 8
              }
            ]}>
              {formatDateForDisplay(formData.date)}
            </Text>
            {formData.date && (
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              }}>
                <Text style={{
                  color: colors.white,
                  fontSize: 14,
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  💰 Costo {formData.packageType}: ${formData.totalAmount.toLocaleString()}
                </Text>
                <Text style={{
                  color: colors.white,
                  fontSize: 12,
                  textAlign: 'center',
                  opacity: 0.9
                }}>
                  {currentPricing.priceCategory}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Updated Pricing Information */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>💰 Precios por Paquete y Día</Text>
          
          {/* Abra Package Pricing */}
          <View style={{
            backgroundColor: colors.cardBackground,
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 12
          }}>
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
              📦 Paquete Abra
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: colors.text, fontSize: 14 }}>📅 Lunes a Viernes:</Text>
              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: 'bold' }}>$4,000</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: colors.text, fontSize: 14 }}>📅 Sábado:</Text>
              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: 'bold' }}>$6,000</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text, fontSize: 14 }}>📅 Domingo:</Text>
              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: 'bold' }}>$5,000</Text>
            </View>
          </View>

          {/* Kadabra Package Pricing */}
          <View style={{
            backgroundColor: colors.cardBackground,
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 12
          }}>
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
              📦 Paquete Kadabra
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: colors.text, fontSize: 14 }}>📅 Lunes a Viernes:</Text>
              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: 'bold' }}>$12,000</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: colors.text, fontSize: 14 }}>📅 Sábado:</Text>
              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: 'bold' }}>$14,000</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text, fontSize: 14 }}>📅 Domingo:</Text>
              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: 'bold' }}>$13,000</Text>
            </View>
          </View>

          {/* Abrakadabra Package Pricing */}
          <View style={{
            backgroundColor: colors.cardBackground,
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 8
          }}>
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
              📦 Paquete Abrakadabra
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: colors.text, fontSize: 14 }}>📅 Lunes a Viernes:</Text>
              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: 'bold' }}>$35,000</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: colors.text, fontSize: 14 }}>📅 Sábado:</Text>
              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: 'bold' }}>$40,000</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text, fontSize: 14 }}>📅 Domingo:</Text>
              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: 'bold' }}>$37,500</Text>
            </View>
          </View>
        </View>

        {/* Package Selection */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Seleccionar Paquete</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                isSelected={formData.packageType === pkg.name}
                selectedDate={formData.date}
                onSelect={() => handlePackageSelect(pkg.name as any)}
              />
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
            editable={!isSubmitting} // FIXED: Disable input while submitting
          />

          <Text style={commonStyles.inputLabel}>Teléfono del Cliente *</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="+52 55 1234 5678"
            placeholderTextColor={colors.textLight}
            value={formData.customerPhone}
            onChangeText={(value) => handleInputChange('customerPhone', value)}
            keyboardType="phone-pad"
            editable={!isSubmitting} // FIXED: Disable input while submitting
          />

          <Text style={commonStyles.inputLabel}>Nombre del Niño/a *</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Nombre del festejado/a"
            placeholderTextColor={colors.textLight}
            value={formData.childName}
            onChangeText={(value) => handleInputChange('childName', value)}
            editable={!isSubmitting} // FIXED: Disable input while submitting
          />

          <Text style={commonStyles.inputLabel}>Hora del Evento *</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="15:00"
            placeholderTextColor={colors.textLight}
            value={formData.time}
            onChangeText={(value) => handleInputChange('time', value)}
            editable={!isSubmitting} // FIXED: Disable input while submitting
          />

          <Text style={commonStyles.inputLabel}>Monto Total</Text>
          <TextInput
            style={[commonStyles.input, { backgroundColor: colors.lightGray }]}
            value={`$${formData.totalAmount.toLocaleString()}`}
            editable={false}
          />

          <Text style={commonStyles.inputLabel}>Anticipo</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="0"
            placeholderTextColor={colors.textLight}
            value={formData.deposit.toString()}
            onChangeText={(value) => handleInputChange('deposit', parseFloat(value) || 0)}
            keyboardType="numeric"
            editable={!isSubmitting} // FIXED: Disable input while submitting
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
            editable={!isSubmitting} // FIXED: Disable input while submitting
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
              <Text style={[commonStyles.summaryLabel, { color: colors.text }]}>Anticipo:</Text>
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
      </ScrollView>

      {/* Fixed Submit Button */}
      <View style={scheduleStyles.submitButtonContainer}>
        <TouchableOpacity
          style={[
            scheduleStyles.submitButton,
            isSubmitting && scheduleStyles.submitButtonDisabled // FIXED: Apply disabled style when submitting
          ]}
          onPress={() => handleSubmit()}
          disabled={isSubmitting} // FIXED: Disable button while submitting
        >
          <Text style={scheduleStyles.submitButtonText}>
            {isSubmitting ? '⏳ Guardando...' : '📅 Crear Evento'} {/* FIXED: Show loading state */}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ScheduleScreen;
