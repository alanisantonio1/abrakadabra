
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { Event } from '../types';
import { packages } from '../data/packages';
import { saveEvents, loadEvents, generateEventId } from '../utils/storage';
import PackageCard from '../components/PackageCard';
import Button from '../components/Button';

export default function ScheduleScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const [events, setEvents] = useState<Event[]>([]);
  const [formData, setFormData] = useState({
    date: date || new Date().toISOString().split('T')[0],
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
    loadEventsData();
  }, []);

  useEffect(() => {
    if (formData.packageType) {
      const selectedPackage = packages.find(pkg => pkg.name === formData.packageType);
      if (selectedPackage) {
        const eventDate = new Date(formData.date);
        const isWeekend = eventDate.getDay() === 0 || eventDate.getDay() === 6;
        const price = isWeekend ? selectedPackage.weekendPrice : selectedPackage.weekdayPrice;
        setFormData(prev => ({ ...prev, totalAmount: price }));
      }
    }
  }, [formData.packageType, formData.date]);

  const loadEventsData = async () => {
    const loadedEvents = await loadEvents();
    setEvents(loadedEvents);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.date || !formData.time || !formData.customerName || 
        !formData.customerPhone || !formData.childName || !formData.packageType) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return false;
    }

    if (formData.deposit > formData.totalAmount) {
      Alert.alert('Error', 'El anticipo no puede ser mayor al monto total');
      return false;
    }

    // Check for conflicts
    const existingEvent = events.find(event => 
      event.date === formData.date && event.time === formData.time
    );

    if (existingEvent) {
      Alert.alert('Error', 'Ya existe un evento programado para esta fecha y hora');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const newEvent: Event = {
      id: generateEventId(),
      date: formData.date,
      time: formData.time,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      childName: formData.childName,
      packageType: formData.packageType as 'Abra' | 'Kadabra' | 'Abrakadabra',
      totalAmount: formData.totalAmount,
      deposit: formData.deposit,
      remainingAmount: formData.totalAmount - formData.deposit,
      isPaid: formData.deposit >= formData.totalAmount,
      notes: formData.notes,
      createdAt: new Date().toISOString()
    };

    const updatedEvents = [...events, newEvent];
    await saveEvents(updatedEvents);
    
    Alert.alert(
      'Éxito',
      'Evento agendado correctamente',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const isWeekend = new Date(formData.date).getDay() === 0 || new Date(formData.date).getDay() === 6;

  return (
    <ScrollView style={commonStyles.container}>
      <Text style={commonStyles.title}>📅 Agendar Nuevo Evento</Text>

      <View style={commonStyles.content}>
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Información del Evento</Text>
          
          <Text style={commonStyles.text}>Fecha *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.date}
            onChangeText={(value) => handleInputChange('date', value)}
            placeholder="YYYY-MM-DD"
          />

          <Text style={commonStyles.text}>Hora *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.time}
            onChangeText={(value) => handleInputChange('time', value)}
            placeholder="HH:MM (ej: 15:00)"
          />
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Información del Cliente</Text>
          
          <Text style={commonStyles.text}>Nombre del Cliente *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.customerName}
            onChangeText={(value) => handleInputChange('customerName', value)}
            placeholder="Nombre completo"
          />

          <Text style={commonStyles.text}>Teléfono *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.customerPhone}
            onChangeText={(value) => handleInputChange('customerPhone', value)}
            placeholder="Número de WhatsApp"
            keyboardType="phone-pad"
          />

          <Text style={commonStyles.text}>Nombre del Niño/a *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.childName}
            onChangeText={(value) => handleInputChange('childName', value)}
            placeholder="Nombre del festejado"
          />
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Seleccionar Paquete *</Text>
          <Text style={commonStyles.textLight}>
            {isWeekend ? 'Precios de fin de semana' : 'Precios entre semana'}
          </Text>
          
          {packages.map(pkg => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              isWeekend={isWeekend}
              onSelect={() => handleInputChange('packageType', pkg.name)}
              isSelected={formData.packageType === pkg.name}
            />
          ))}
        </View>

        {formData.packageType && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>Información de Pago</Text>
            
            <Text style={commonStyles.text}>Monto Total: ${formData.totalAmount}</Text>
            
            <Text style={commonStyles.text}>Anticipo</Text>
            <TextInput
              style={commonStyles.input}
              value={formData.deposit.toString()}
              onChangeText={(value) => handleInputChange('deposit', parseFloat(value) || 0)}
              placeholder="0"
              keyboardType="numeric"
            />

            <Text style={commonStyles.text}>
              Saldo Pendiente: ${formData.totalAmount - formData.deposit}
            </Text>
          </View>
        )}

        <View style={commonStyles.section}>
          <Text style={commonStyles.text}>Notas Adicionales</Text>
          <TextInput
            style={[commonStyles.input, { height: 80, textAlignVertical: 'top' }]}
            value={formData.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            placeholder="Observaciones especiales..."
            multiline
          />
        </View>

        <View style={commonStyles.buttonContainer}>
          <Button
            text="Agendar Evento"
            onPress={handleSubmit}
            style={buttonStyles.primary}
          />
        </View>

        <View style={commonStyles.buttonContainer}>
          <Button
            text="Cancelar"
            onPress={() => router.back()}
            style={buttonStyles.backButton}
          />
        </View>
      </View>
    </ScrollView>
  );
}
