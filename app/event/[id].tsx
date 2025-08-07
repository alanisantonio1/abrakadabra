
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { loadEvents, updateEvent, deleteEvent } from '../../utils/storage';
import { Event } from '../../types';
import { sendWhatsAppReminder, sendWhatsAppCancellation } from '../../utils/whatsapp';
import Button from '../../components/Button';

const EventDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      console.log('📋 Loading event details for ID:', id);
      loadEventData();
    }
  }, [id]);

  const loadEventData = async () => {
    try {
      setIsLoading(true);
      console.log('📥 Loading event data...');
      const events = await loadEvents();
      const foundEvent = events.find(e => e.id === id);
      
      if (foundEvent) {
        setEvent(foundEvent);
        console.log('✅ Event loaded:', foundEvent.customerName);
      } else {
        console.error('❌ Event not found with ID:', id);
        Alert.alert(
          'Error',
          'No se encontró el evento solicitado',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error: any) {
      console.error('❌ Error loading event:', error);
      Alert.alert(
        'Error',
        `No se pudo cargar el evento: ${error.message}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!event) return;

    Alert.alert(
      '💰 Marcar como Pagado',
      `¿Confirmas que el evento de ${event.childName} ha sido pagado en su totalidad?`,
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

              const result = await updateEvent(updatedEvent);
              
              if (result.success) {
                setEvent(updatedEvent);
                Alert.alert(
                  '✅ Evento Actualizado',
                  'El evento ha sido marcado como pagado exitosamente.',
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert(
                  '❌ Error',
                  `No se pudo actualizar el evento: ${result.message}`,
                  [{ text: 'OK' }]
                );
              }
            } catch (error: any) {
              console.error('❌ Error marking as paid:', error);
              Alert.alert(
                '❌ Error',
                `Error actualizando el evento: ${error.message}`,
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  const handleDeleteEvent = async () => {
    if (!event) return;

    Alert.alert(
      '🗑️ Eliminar Evento',
      `¿Estás seguro de que deseas eliminar el evento de ${event.childName}?\n\nEsta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Deleting event:', event.id);
              
              const result = await deleteEvent(event);
              
              if (result.success) {
                Alert.alert(
                  '✅ Evento Eliminado',
                  'El evento ha sido eliminado exitosamente.',
                  [{ text: 'OK', onPress: () => router.replace('/') }]
                );
              } else {
                Alert.alert(
                  '❌ Error',
                  `No se pudo eliminar el evento: ${result.message}`,
                  [{ text: 'OK' }]
                );
              }
            } catch (error: any) {
              console.error('❌ Error deleting event:', error);
              Alert.alert(
                '❌ Error',
                `Error eliminando el evento: ${error.message}`,
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  const handleWhatsAppReminder = async () => {
    if (!event) return;

    try {
      console.log('📱 Sending WhatsApp reminder for event:', event.id);
      await sendWhatsAppReminder(event);
      Alert.alert(
        '✅ Recordatorio Enviado',
        'El recordatorio de WhatsApp ha sido enviado exitosamente.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('❌ Error sending WhatsApp reminder:', error);
      Alert.alert(
        '❌ Error',
        `No se pudo enviar el recordatorio: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  };

  if (isLoading) {
    return (
      <View style={commonStyles.container}>
        <Text style={commonStyles.loadingText}>Cargando evento...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={commonStyles.container}>
        <Text style={commonStyles.errorText}>Evento no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={commonStyles.backButton}
          onPress={() => router.back()}
        >
          <Text style={commonStyles.buttonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={commonStyles.title}>📋 Detalles del Evento</Text>
      </View>

      {/* Event Status */}
      <View style={commonStyles.section}>
        <View style={[
          commonStyles.statusBadge,
          { 
            backgroundColor: event.isPaid ? colors.success : colors.warning,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center'
          }
        ]}>
          <Text style={[commonStyles.statusText, { color: colors.white, fontSize: 16 }]}>
            {event.isPaid ? '✅ PAGADO' : '⏳ PENDIENTE'}
          </Text>
        </View>
      </View>

      {/* Basic Information */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Información Básica</Text>
        
        <View style={[commonStyles.detailRow, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }]}>
          <Text style={[commonStyles.detailLabel, { fontWeight: 'bold', color: colors.text }]}>Fecha:</Text>
          <Text style={[commonStyles.detailValue, { color: colors.text }]}>{event.date}</Text>
        </View>
        
        <View style={[commonStyles.detailRow, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }]}>
          <Text style={[commonStyles.detailLabel, { fontWeight: 'bold', color: colors.text }]}>Hora:</Text>
          <Text style={[commonStyles.detailValue, { color: colors.text }]}>{event.time}</Text>
        </View>
        
        <View style={[commonStyles.detailRow, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }]}>
          <Text style={[commonStyles.detailLabel, { fontWeight: 'bold', color: colors.text }]}>Niño/a:</Text>
          <Text style={[commonStyles.detailValue, { color: colors.text }]}>{event.childName}</Text>
        </View>
        
        <View style={[commonStyles.detailRow, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }]}>
          <Text style={[commonStyles.detailLabel, { fontWeight: 'bold', color: colors.text }]}>Paquete:</Text>
          <Text style={[commonStyles.detailValue, { color: colors.text }]}>{event.packageType}</Text>
        </View>
      </View>

      {/* Customer Information */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Información del Cliente</Text>
        
        <View style={[commonStyles.detailRow, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }]}>
          <Text style={[commonStyles.detailLabel, { fontWeight: 'bold', color: colors.text }]}>Nombre:</Text>
          <Text style={[commonStyles.detailValue, { color: colors.text }]}>{event.customerName}</Text>
        </View>
        
        <View style={[commonStyles.detailRow, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }]}>
          <Text style={[commonStyles.detailLabel, { fontWeight: 'bold', color: colors.text }]}>Teléfono:</Text>
          <Text style={[commonStyles.detailValue, { color: colors.text }]}>{event.customerPhone}</Text>
        </View>
      </View>

      {/* Payment Information */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Información de Pago</Text>
        
        <View style={[commonStyles.detailRow, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }]}>
          <Text style={[commonStyles.detailLabel, { fontWeight: 'bold', color: colors.text }]}>Total:</Text>
          <Text style={[commonStyles.detailValue, { color: colors.text }]}>${event.totalAmount.toLocaleString()}</Text>
        </View>
        
        <View style={[commonStyles.detailRow, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }]}>
          <Text style={[commonStyles.detailLabel, { fontWeight: 'bold', color: colors.text }]}>Anticipo:</Text>
          <Text style={[commonStyles.detailValue, { color: colors.text }]}>${event.deposit.toLocaleString()}</Text>
        </View>
        
        <View style={[commonStyles.detailRow, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }]}>
          <Text style={[commonStyles.detailLabel, { fontWeight: 'bold', color: colors.text }]}>Saldo:</Text>
          <Text style={[
            commonStyles.detailValue,
            { color: event.remainingAmount > 0 ? colors.warning : colors.success, fontWeight: 'bold' }
          ]}>
            ${event.remainingAmount.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Notes */}
      {event.notes && (
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Notas</Text>
          <Text style={[commonStyles.notesText, { color: colors.text, fontSize: 14, lineHeight: 20 }]}>{event.notes}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Acciones</Text>
        
        {!event.isPaid && (
          <Button
            text="💰 Marcar como Pagado"
            onPress={handleMarkAsPaid}
            style={[buttonStyles.success, { marginBottom: 10 }]}
          />
        )}
        
        <Button
          text="📱 Enviar Recordatorio WhatsApp"
          onPress={handleWhatsAppReminder}
          style={[buttonStyles.info, { marginBottom: 10 }]}
        />
        
        <Button
          text="🗑️ Eliminar Evento"
          onPress={handleDeleteEvent}
          style={buttonStyles.error}
        />
      </View>

      {/* Metadata */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Información del Sistema</Text>
        
        <View style={[commonStyles.detailRow, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }]}>
          <Text style={[commonStyles.detailLabel, { fontWeight: 'bold', color: colors.text }]}>ID:</Text>
          <Text style={[commonStyles.detailValue, { fontSize: 12, fontFamily: 'monospace', color: colors.textLight }]}>
            {event.id}
          </Text>
        </View>
        
        <View style={[commonStyles.detailRow, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }]}>
          <Text style={[commonStyles.detailLabel, { fontWeight: 'bold', color: colors.text }]}>Creado:</Text>
          <Text style={[commonStyles.detailValue, { color: colors.text }]}>
            {new Date(event.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default EventDetailScreen;
