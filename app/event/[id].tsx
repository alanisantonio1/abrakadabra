
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { Event } from '../../types';
import { loadEvents, saveEvents } from '../../utils/storage';
import { sendWhatsAppReminder } from '../../utils/whatsapp';
import Button from '../../components/Button';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadEventData();
    }
  }, [id]);

  const loadEventData = async () => {
    try {
      console.log('EventDetailScreen: Loading event with ID:', id);
      const events = await loadEvents();
      const foundEvent = events.find(e => e.id === id);
      
      if (foundEvent) {
        console.log('EventDetailScreen: Event found:', foundEvent);
        setEvent(foundEvent);
      } else {
        console.log('EventDetailScreen: Event not found');
        Alert.alert('Error', 'Evento no encontrado');
        router.back();
      }
    } catch (error) {
      console.error('EventDetailScreen: Error loading event:', error);
      Alert.alert('Error', 'Error al cargar el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!event) return;

    Alert.alert(
      'Confirmar Pago',
      '¿Marcar este evento como pagado en su totalidad?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const events = await loadEvents();
              const updatedEvents = events.map(e => 
                e.id === event.id 
                  ? { ...e, isPaid: true, deposit: e.totalAmount, remainingAmount: 0 }
                  : e
              );
              
              await saveEvents(updatedEvents);
              
              setEvent(prev => prev ? { 
                ...prev, 
                isPaid: true, 
                deposit: prev.totalAmount, 
                remainingAmount: 0 
              } : null);
              
              Alert.alert('Éxito', 'Evento marcado como pagado');
            } catch (error) {
              console.error('Error marking as paid:', error);
              Alert.alert('Error', 'Error al actualizar el pago');
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
              const events = await loadEvents();
              const updatedEvents = events.filter(e => e.id !== event.id);
              await saveEvents(updatedEvents);
              
              Alert.alert('Éxito', 'Evento eliminado correctamente');
              router.back();
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'Error al eliminar el evento');
            }
          }
        }
      ]
    );
  };

  const handleWhatsAppReminder = () => {
    if (event) {
      sendWhatsAppReminder(event);
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
        <Button text="Volver" onPress={() => router.back()} />
      </View>
    );
  }

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <ScrollView style={commonStyles.container}>
      {/* Header with back button */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 10
      }}>
        <TouchableOpacity
          style={{
            backgroundColor: colors.text,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            marginRight: 16
          }}
          onPress={() => router.back()}
        >
          <Text style={{
            color: colors.backgroundAlt,
            fontWeight: '600'
          }}>
            ← Volver
          </Text>
        </TouchableOpacity>
        <Text style={[commonStyles.title, { flex: 1, marginTop: 0, marginBottom: 0 }]}>
          📋 Detalles del Evento
        </Text>
      </View>

      <View style={commonStyles.content}>
        {/* Event Status */}
        <View style={[
          commonStyles.card, 
          { 
            backgroundColor: event.isPaid ? colors.success + '20' : colors.warning + '20',
            borderColor: event.isPaid ? colors.success : colors.warning,
            marginBottom: 20
          }
        ]}>
          <Text style={[
            commonStyles.subtitle, 
            { 
              textAlign: 'center', 
              color: event.isPaid ? colors.success : colors.warning,
              marginBottom: 8
            }
          ]}>
            {event.isPaid ? '✅ EVENTO PAGADO' : '⏳ PAGO PENDIENTE'}
          </Text>
          <Text style={[commonStyles.textLight, { textAlign: 'center' }]}>
            Estado del evento
          </Text>
        </View>

        {/* Event Information */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>📅 Información del Evento</Text>
          
          <View style={commonStyles.card}>
            <View style={commonStyles.row}>
              <Text style={commonStyles.text}>Fecha:</Text>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>{formattedDate}</Text>
            </View>
            <View style={commonStyles.row}>
              <Text style={commonStyles.text}>Hora:</Text>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>{event.time}</Text>
            </View>
            <View style={commonStyles.row}>
              <Text style={commonStyles.text}>Paquete:</Text>
              <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary }]}>
                {event.packageType}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>👤 Información del Cliente</Text>
          
          <View style={commonStyles.card}>
            <View style={commonStyles.row}>
              <Text style={commonStyles.text}>Cliente:</Text>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>{event.customerName}</Text>
            </View>
            <View style={commonStyles.row}>
              <Text style={commonStyles.text}>Teléfono:</Text>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>{event.customerPhone}</Text>
            </View>
            <View style={commonStyles.row}>
              <Text style={commonStyles.text}>Festejado/a:</Text>
              <Text style={[commonStyles.text, { fontWeight: '600', color: colors.secondary }]}>
                {event.childName}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Information */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>💰 Información de Pago</Text>
          
          <View style={commonStyles.card}>
            <View style={commonStyles.row}>
              <Text style={commonStyles.text}>Monto Total:</Text>
              <Text style={[commonStyles.text, { fontWeight: '700', color: colors.primary }]}>
                ${event.totalAmount}
              </Text>
            </View>
            <View style={commonStyles.row}>
              <Text style={commonStyles.text}>Anticipo:</Text>
              <Text style={[commonStyles.text, { fontWeight: '600', color: colors.success }]}>
                ${event.deposit}
              </Text>
            </View>
            <View style={commonStyles.row}>
              <Text style={commonStyles.text}>Saldo Pendiente:</Text>
              <Text style={[
                commonStyles.text, 
                { 
                  fontWeight: '700', 
                  color: event.remainingAmount > 0 ? colors.error : colors.success 
                }
              ]}>
                ${event.remainingAmount}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {event.notes && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>📝 Notas</Text>
            <View style={commonStyles.card}>
              <Text style={commonStyles.text}>{event.notes}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>⚡ Acciones</Text>
          
          {/* WhatsApp Reminder */}
          <View style={commonStyles.buttonContainer}>
            <Button
              text="📱 Enviar Recordatorio WhatsApp"
              onPress={handleWhatsAppReminder}
              style={buttonStyles.success}
            />
          </View>

          {/* Mark as Paid (only if not paid) */}
          {!event.isPaid && (
            <View style={commonStyles.buttonContainer}>
              <Button
                text="💳 Marcar como Pagado"
                onPress={handleMarkAsPaid}
                style={buttonStyles.primary}
              />
            </View>
          )}

          {/* Delete Event */}
          <View style={commonStyles.buttonContainer}>
            <Button
              text="🗑️ Eliminar Evento"
              onPress={handleDeleteEvent}
              style={{
                backgroundColor: colors.error,
                alignSelf: 'center',
                width: '100%',
              }}
            />
          </View>
        </View>

        {/* Event Metadata */}
        <View style={[commonStyles.card, { backgroundColor: colors.background, marginTop: 20 }]}>
          <Text style={[commonStyles.textLight, { textAlign: 'center', fontSize: 12 }]}>
            Evento creado: {new Date(event.createdAt).toLocaleDateString('es-ES')}
          </Text>
          <Text style={[commonStyles.textLight, { textAlign: 'center', fontSize: 12 }]}>
            ID: {event.id}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
