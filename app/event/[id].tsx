
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import Button from '../../components/Button';
import { sendWhatsAppReminder, sendWhatsAppCancellation } from '../../utils/whatsapp';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { loadEvents, updateEvent, deleteEvent } from '../../utils/storage';
import { router, useLocalSearchParams } from 'expo-router';
import { Event } from '../../types';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadEventData();
    }
  }, [id]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading event data for ID:', id);
      
      const events = await loadEvents();
      const foundEvent = events.find(e => e.id === id);
      
      if (foundEvent) {
        setEvent(foundEvent);
        console.log('✅ Event loaded:', foundEvent);
      } else {
        console.warn('⚠️ Event not found with ID:', id);
        Alert.alert('Error', 'Evento no encontrado');
        router.back();
      }
    } catch (error) {
      console.error('❌ Error loading event:', error);
      Alert.alert('Error', 'No se pudo cargar el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!event) return;

    Alert.alert(
      'Marcar como Pagado',
      '¿Estás seguro de que quieres marcar este evento como pagado en su totalidad?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              console.log('💰 Marking event as paid:', event.id);
              
              const updatedEvent: Event = {
                ...event,
                isPaid: true,
                remainingAmount: 0,
                deposit: event.totalAmount
              };

              const success = await updateEvent(updatedEvent);
              
              if (success) {
                setEvent(updatedEvent);
                Alert.alert('Éxito', 'El evento ha sido marcado como pagado');
              } else {
                Alert.alert('Error', 'No se pudo actualizar el estado del pago');
              }
            } catch (error) {
              console.error('❌ Error marking as paid:', error);
              Alert.alert('Error', 'Ocurrió un error al actualizar el evento');
            }
          }
        }
      ]
    );
  };

  const handleDeleteEvent = async () => {
    if (!event) return;

    Alert.alert(
      'Eliminar Evento',
      '¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Deleting event:', event.id);
              
              const success = await deleteEvent(event.id);
              
              if (success) {
                Alert.alert(
                  'Evento Eliminado',
                  'El evento ha sido eliminado exitosamente',
                  [{ text: 'OK', onPress: () => router.back() }]
                );
              } else {
                Alert.alert('Error', 'No se pudo eliminar el evento');
              }
            } catch (error) {
              console.error('❌ Error deleting event:', error);
              Alert.alert('Error', 'Ocurrió un error al eliminar el evento');
            }
          }
        }
      ]
    );
  };

  const handleWhatsAppReminder = () => {
    if (!event) return;
    
    try {
      console.log('📱 Sending WhatsApp reminder for event:', event.id);
      sendWhatsAppReminder(event);
    } catch (error) {
      console.error('❌ Error sending WhatsApp reminder:', error);
      Alert.alert('Error', 'No se pudo enviar el recordatorio por WhatsApp');
    }
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={commonStyles.text}>Cargando evento...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={commonStyles.text}>Evento no encontrado</Text>
        <Button
          text="Volver"
          onPress={() => router.back()}
          style={[buttonStyles.secondary, { marginTop: 20 }]}
        />
      </View>
    );
  }

  return (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={[commonStyles.backButton, { backgroundColor: colors.secondary }]}
          onPress={() => router.back()}
        >
          <Text style={[commonStyles.backButtonText, { color: 'white' }]}>← Volver</Text>
        </TouchableOpacity>
        <Text style={commonStyles.title}>Detalles del Evento</Text>
        <Text style={commonStyles.subtitle}>
          {event.date} - {event.packageType}
        </Text>
      </View>

      {/* Event Information */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Información del Evento</Text>
        
        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.label}>Fecha:</Text>
          <Text style={commonStyles.value}>{event.date}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.label}>Hora:</Text>
          <Text style={commonStyles.value}>{event.time}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.label}>Paquete:</Text>
          <Text style={commonStyles.value}>{event.packageType}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.label}>Estado:</Text>
          <Text style={[
            commonStyles.value,
            { 
              color: event.isPaid ? '#4CAF50' : '#FF9800',
              fontWeight: 'bold'
            }
          ]}>
            {event.isPaid ? 'Pagado' : 'Pendiente'}
          </Text>
        </View>
      </View>

      {/* Customer Information */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Información del Cliente</Text>
        
        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.label}>Cliente:</Text>
          <Text style={commonStyles.value}>{event.customerName}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.label}>Teléfono:</Text>
          <Text style={commonStyles.value}>{event.customerPhone}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.label}>Niño/a:</Text>
          <Text style={commonStyles.value}>{event.childName}</Text>
        </View>

        {event.notes && (
          <View style={commonStyles.infoRow}>
            <Text style={commonStyles.label}>Notas:</Text>
            <Text style={commonStyles.value}>{event.notes}</Text>
          </View>
        )}
      </View>

      {/* Payment Information */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Información de Pago</Text>
        
        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.label}>Total:</Text>
          <Text style={commonStyles.value}>${event.totalAmount}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.label}>Anticipo:</Text>
          <Text style={commonStyles.value}>${event.deposit}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.label}>Restante:</Text>
          <Text style={[
            commonStyles.value,
            { 
              color: event.remainingAmount > 0 ? '#FF9800' : '#4CAF50',
              fontWeight: 'bold'
            }
          ]}>
            ${event.remainingAmount}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={[commonStyles.section, { paddingBottom: 40 }]}>
        <Text style={commonStyles.sectionTitle}>Acciones</Text>
        
        <Button
          text="📱 Enviar Recordatorio WhatsApp"
          onPress={handleWhatsAppReminder}
          style={[buttonStyles.primary, { backgroundColor: '#25D366', marginBottom: 12 }]}
        />

        {!event.isPaid && (
          <Button
            text="💰 Marcar como Pagado"
            onPress={handleMarkAsPaid}
            style={[buttonStyles.primary, { backgroundColor: '#4CAF50', marginBottom: 12 }]}
          />
        )}

        <Button
          text="🗑️ Eliminar Evento"
          onPress={handleDeleteEvent}
          style={[buttonStyles.secondary, { backgroundColor: '#F44336' }]}
          textStyle={{ color: 'white' }}
        />
      </View>
    </ScrollView>
  );
}
