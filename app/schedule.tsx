
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { saveEvent, generateEventId, loadEvents } from '../utils/storage';
import { packages } from '../data/packages';
import Button from '../components/Button';
import PackageCard from '../components/PackageCard';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { Event } from '../types';

const ScheduleScreen: React.FC = () => {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [loading, setLoading] = useState(false);
  const [existingEvents, setExistingEvents] = useState<Event[]>([]);
  
  const [formData, setFormData] = useState({
    date: date || '',
    time: '15:00',
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
      setFormData(prev => ({ ...prev, date }));
      console.log('ScheduleScreen: Date set from params:', date);
      
      // Load existing events to check for conflicts
      loadExistingEvents();
    }
  }, [date]);

  const loadExistingEvents = async () => {
    try {
      const events = await loadEvents();
      setExistingEvents(events);
      
      // Check if the selected date already has events
      const dateEvents = events.filter(event => event.date === date);
      if (dateEvents.length > 0) {
        console.log('ScheduleScreen: Warning - Date already has events:', dateEvents.length);
      }
    } catch (error) {
      console.error('ScheduleScreen: Error loading existing events:', error);
    }
  };

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
        
        console.log('ScheduleScreen: Package selected:', formData.packageType, 'Price:', price);
      }
    }
  }, [formData.packageType, formData.date]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    console.log('ScheduleScreen: Field updated:', field, value);
  };

  const validateForm = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!formData.date) {
        Alert.alert('Error', 'Por favor selecciona una fecha');
        resolve(false);
        return;
      }
      
      // Check if date already has events
      const dateEvents = existingEvents.filter(event => event.date === formData.date);
      if (dateEvents.length > 0) {
        Alert.alert(
          'Fecha Ocupada', 
          `Esta fecha ya tiene ${dateEvents.length} evento(s) agendado(s). ¿Estás seguro de que quieres agendar otro evento en la misma fecha?`,
          [
            { 
              text: 'Cancelar', 
              style: 'cancel',
              onPress: () => resolve(false)
            },
            { 
              text: 'Continuar', 
              onPress: () => resolve(continueValidation())
            }
          ]
        );
        return;
      }
      
      resolve(continueValidation());
    });
  };

  const continueValidation = (): boolean => {
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
    if (!formData.packageType) {
      Alert.alert('Error', 'Por favor selecciona un paquete');
      return false;
    }
    if (formData.totalAmount <= 0) {
      Alert.alert('Error', 'El monto total debe ser mayor a 0');
      return false;
    }
    if (formData.deposit < 0 || formData.deposit > formData.totalAmount) {
      Alert.alert('Error', 'El anticipo debe estar entre 0 y el monto total');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      setLoading(true);
      console.log('🔄 ScheduleScreen: Submitting form data:', formData);

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

      console.log('📝 ScheduleScreen: Created event object:', newEvent);

      // Show loading message
      console.log('💾 ScheduleScreen: Saving event...');
      
      await saveEvent(newEvent);
      
      console.log('✅ ScheduleScreen: Event saved successfully');
      
      // Show success message and navigate back to main menu
      Alert.alert(
        '🎉 ¡Evento Guardado Exitosamente!',
        `El evento ha sido agendado correctamente para el ${new Date(formData.date).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}\n\n📋 Detalles del evento:\n• Cliente: ${formData.customerName}\n• Niño/a: ${formData.childName}\n• Paquete: ${formData.packageType}\n• Total: $${formData.totalAmount.toLocaleString()}\n• Anticipo: $${formData.deposit.toLocaleString()}\n\n✅ El evento se ha guardado en Google Sheets y está disponible en el calendario.`,
        [
          {
            text: '🏠 Ir al Menú Principal',
            onPress: () => {
              console.log('🏠 ScheduleScreen: Navigating back to main menu');
              // Use replace to go back to main menu and refresh the calendar
              router.replace('/');
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ ScheduleScreen: Error saving event:', error);
      
      // Show detailed error message
      let errorMessage = 'No se pudo guardar el evento. ';
      
      if (error instanceof Error) {
        if (error.message.includes('Google Sheets')) {
          errorMessage += 'Hubo un problema con la conexión a Google Sheets. ';
        } else if (error.message.includes('fetch')) {
          errorMessage += 'Verifica tu conexión a internet. ';
        } else {
          errorMessage += `Error: ${error.message}. `;
        }
      }
      
      errorMessage += 'Por favor inténtalo de nuevo.';
      
      Alert.alert(
        '❌ Error al Guardar', 
        errorMessage,
        [
          { 
            text: '🔄 Reintentar',
            onPress: () => handleSubmit()
          },
          { 
            text: '❌ Cancelar',
            style: 'cancel'
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const isWeekend = formData.date ? 
    (() => {
      const day = new Date(formData.date).getDay();
      return day === 0 || day === 6;
    })() : false;

  // Check if date has existing events
  const dateEvents = existingEvents.filter(event => event.date === formData.date);
  const hasExistingEvents = dateEvents.length > 0;

  return (
    <ScrollView style={commonStyles.container} showsVerticalScrollIndicator={false}>
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={[commonStyles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={[commonStyles.backButtonText, { color: colors.backgroundAlt }]}>← Volver</Text>
        </TouchableOpacity>
        <Text style={[commonStyles.title, { flex: 1, textAlign: 'center' }]}>Agendar Evento</Text>
        <View style={{ width: 80 }} />
      </View>

      {/* Warning if date has existing events */}
      {hasExistingEvents && (
        <View style={{
          backgroundColor: colors.warning + '20',
          borderColor: colors.warning,
          borderWidth: 1,
          borderRadius: 8,
          padding: 16,
          margin: 16,
          marginBottom: 0
        }}>
          <Text style={{
            color: colors.warning,
            fontWeight: '600',
            fontSize: 16,
            marginBottom: 4
          }}>
            ⚠️ Advertencia
          </Text>
          <Text style={{
            color: colors.text,
            fontSize: 14
          }}>
            Esta fecha ya tiene {dateEvents.length} evento(s) agendado(s). Considera verificar la disponibilidad antes de continuar.
          </Text>
        </View>
      )}

      <View style={commonStyles.form}>
        {/* Date Display */}
        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Fecha del Evento</Text>
          <View style={[commonStyles.input, { backgroundColor: colors.backgroundAlt }]}>
            <Text style={{ fontSize: 16, color: colors.text }}>
              {formData.date ? new Date(formData.date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'No seleccionada'}
            </Text>
          </View>
        </View>

        {/* Customer Name */}
        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Nombre del Cliente *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.customerName}
            onChangeText={(value) => handleInputChange('customerName', value)}
            placeholder="Nombre completo del cliente"
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* Customer Phone */}
        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Teléfono del Cliente *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.customerPhone}
            onChangeText={(value) => handleInputChange('customerPhone', value)}
            placeholder="Número de teléfono"
            placeholderTextColor={colors.textLight}
            keyboardType="phone-pad"
          />
        </View>

        {/* Child Name */}
        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Nombre del Niño/a *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.childName}
            onChangeText={(value) => handleInputChange('childName', value)}
            placeholder="Nombre del festejado"
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* Time */}
        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Hora del Evento</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.time}
            onChangeText={(value) => handleInputChange('time', value)}
            placeholder="HH:MM"
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* Package Selection */}
        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Seleccionar Paquete *</Text>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
            {isWeekend ? 'Precios de fin de semana' : 'Precios entre semana'}
          </Text>
          
          {packages.map(pkg => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              isWeekend={isWeekend}
              isSelected={formData.packageType === pkg.name}
              onSelect={() => handleInputChange('packageType', pkg.name)}
            />
          ))}
        </View>

        {/* Amount Details */}
        {formData.packageType && (
          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Detalles del Pago</Text>
            
            <View style={[commonStyles.input, { backgroundColor: colors.backgroundAlt }]}>
              <Text style={{ fontSize: 16, color: colors.text, fontWeight: '600' }}>
                Total del Evento: ${formData.totalAmount.toLocaleString()}
              </Text>
            </View>

            <Text style={[commonStyles.label, { marginTop: 16 }]}>Anticipo</Text>
            <TextInput
              style={commonStyles.input}
              value={formData.deposit.toString()}
              onChangeText={(value) => handleInputChange('deposit', parseFloat(value) || 0)}
              placeholder="Monto del anticipo"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
            />

            <View style={[commonStyles.input, { backgroundColor: colors.backgroundAlt, marginTop: 8 }]}>
              <Text style={{ fontSize: 14, color: colors.textLight }}>
                Saldo pendiente: ${(formData.totalAmount - formData.deposit).toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {/* Notes */}
        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Notas Adicionales</Text>
          <TextInput
            style={[commonStyles.input, { height: 80, textAlignVertical: 'top' }]}
            value={formData.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            placeholder="Observaciones, solicitudes especiales, etc."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Submit Button */}
        <Button
          text={loading ? "💾 Guardando Evento..." : "🎉 Agendar Evento"}
          onPress={handleSubmit}
          style={[
            buttonStyles.primary,
            { 
              marginTop: 32, 
              marginBottom: 32,
              opacity: loading ? 0.7 : 1 
            }
          ]}
        />
      </View>
    </ScrollView>
  );
};

export default ScheduleScreen;
