
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { loadEvents, updateEvent, deleteEvent } from '../../utils/storage';
import { sendWhatsAppReminder } from '../../utils/whatsapp';
import Button from '../../components/Button';
import { Event } from '../../types';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';

const EventDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      console.log('EventDetailScreen: Loading event with ID:', id);
      loadEventData();
    }
  }, [id]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      console.log('EventDetailScreen: Loading events to find event with ID:', id);
      const events = await loadEvents();
      const foundEvent = events.find(e => e.id === id);
      
      if (foundEvent) {
        console.log('EventDetailScreen: Event found:', foundEvent);
        setEvent(foundEvent);
      } else {
        console.log('EventDetailScreen: Event not found with ID:', id);
        Alert.alert('Error', 'Evento no encontrado');
        router.back();
      }
    } catch (error) {
      console.error('EventDetailScreen: Error loading event:', error);
      Alert.alert('Error', 'No se pudo cargar el evento');
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
              setLoading(true);
              console.log('EventDetailScreen: Marking event as paid:', event.id);
              
              const updatedEvent: Event = {
                ...event,
                isPaid: true,
                deposit: event.totalAmount,
                remainingAmount: 0
              };

              await updateEvent(updatedEvent);
              setEvent(updatedEvent);
              
              console.log('EventDetailScreen: Event marked as paid successfully');
              Alert.alert('Éxito', 'Evento marcado como pagado');
            } catch (error) {
              console.error('EventDetailScreen: Error marking as paid:', error);
              Alert.alert('Error', 'No se pudo actualizar el evento');
            } finally {
              setLoading(false);
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
              setLoading(true);
              console.log('EventDetailScreen: Deleting event:', event.id);
              
              await deleteEvent(event.id);
              
              console.log('EventDetailScreen: Event deleted successfully');
              Alert.alert(
                'Eliminado',
                'Evento eliminado correctamente',
                [
                  {
                    text: 'OK',
                    onPress: () => router.replace('/')
                  }
                ]
              );
            } catch (error) {
              console.error('EventDetailScreen: Error deleting event:', error);
              Alert.alert('Error', 'No se pudo eliminar el evento');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleWhatsAppReminder = () => {
    if (!event) return;
    
    console.log('EventDetailScreen: Sending WhatsApp reminder for event:', event.id);
    sendWhatsAppReminder(event);
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: colors.text }}>Cargando...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: colors.text }}>Evento no encontrado</Text>
        <Button
          text="Volver"
          onPress={() => router.back()}
          style={[buttonStyles.secondary, { marginTop: 20 }]}
        />
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
    <ScrollView style={commonStyles.container} showsVerticalScrollIndicator={false}>
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={[commonStyles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={[commonStyles.backButtonText, { color: colors.backgroundAlt }]}>← Volver</Text>
        </TouchableOpacity>
        <Text style={[commonStyles.title, { flex: 1, textAlign: 'center' }]}>Detalles del Evento</Text>
        <View style={{ width: 80 }} />
      </View>

      <View style={commonStyles.card}>
        {/* Event Status */}
        <View style={[
          commonStyles.statusBadge,
          { backgroundColor: event.isPaid ? colors.success + '20' : colors.warning + '20' }
        ]}>
          <Text style={[
            commonStyles.statusText,
            { color: event.isPaid ? colors.success : colors.warning }
          ]}>
            {event.isPaid ? 'PAGADO' : 'PENDIENTE'}
          </Text>
        </View>

        {/* Basic Information */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Información del Evento</Text>
          
          <View style={commonStyles.infoRow}>
            <Text style={commonStyles.infoLabel}>Fecha:</Text>
            <Text style={commonStyles.infoValue}>{formattedDate}</Text>
          </View>

          <View style={commonStyles.infoRow}>
            <Text style={commonStyles.infoLabel}>Hora:</Text>
            <Text style={commonStyles.infoValue}>{event.time}</Text>
          </View>

          <View style={commonStyles.infoRow}>
            <Text style={commonStyles.infoLabel}>Paquete:</Text>
            <Text style={commonStyles.infoValue}>{event.packageType}</Text>
          </View>
        </View>

        {/* Customer Information */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Información del Cliente</Text>
          
          <View style={commonStyles.infoRow}>
            <Text style={commonStyles.infoLabel}>Cliente:</Text>
            <Text style={commonStyles.infoValue}>{event.customerName}</Text>
          </View>

          <View style={commonStyles.infoRow}>
            <Text style={commonStyles.infoLabel}>Teléfono:</Text>
            <Text style={commonStyles.infoValue}>{event.customerPhone}</Text>
          </View>

          <View style={commonStyles.infoRow}>
            <Text style={commonStyles.infoLabel}>Festejado:</Text>
            <Text style={commonStyles.infoValue}>{event.childName}</Text>
          </View>
        </View>

        {/* Payment Information */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Información de Pago</Text>
          
          <View style={commonStyles.infoRow}>
            <Text style={commonStyles.infoLabel}>Total:</Text>
            <Text style={[commonStyles.infoValue, { fontWeight: '700' }]}>
              ${event.totalAmount.toLocaleString()}
            </Text>
          </View>

          <View style={commonStyles.infoRow}>
            <Text style={commonStyles.infoLabel}>Anticipo:</Text>
            <Text style={commonStyles.infoValue}>
              ${event.deposit.toLocaleString()}
            </Text>
          </View>

          <View style={commonStyles.infoRow}>
            <Text style={commonStyles.infoLabel}>Saldo:</Text>
            <Text style={[
              commonStyles.infoValue,
              { 
                color: event.remainingAmount > 0 ? colors.warning : colors.success,
                fontWeight: '600'
              }
            ]}>
              ${event.remainingAmount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {event.notes && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.sectionTitle}>Notas</Text>
            <Text style={commonStyles.infoValue}>{event.notes}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={commonStyles.buttonContainer}>
          {/* WhatsApp Reminder */}
          <Button
            text="Enviar Recordatorio WhatsApp"
            onPress={handleWhatsAppReminder}
            style={[buttonStyles.secondary, { backgroundColor: colors.success }]}
            textStyle={{ color: colors.backgroundAlt }}
          />

          {/* Mark as Paid */}
          {!event.isPaid && (
            <Button
              text="Marcar como Pagado"
              onPress={handleMarkAsPaid}
              style={[buttonStyles.primary, { marginTop: 12 }]}
            />
          )}

          {/* Delete Event */}
          <Button
            text="Eliminar Evento"
            onPress={handleDeleteEvent}
            style={[
              buttonStyles.secondary,
              { 
                marginTop: 12,
                backgroundColor: colors.error + '20',
                borderColor: colors.error,
                borderWidth: 1
              }
            ]}
            textStyle={{ color: colors.error }}
          />
        </View>
      </View>

      {/* Event Creation Info */}
      <View style={[commonStyles.card, { marginTop: 16, marginBottom: 32 }]}>
        <Text style={[commonStyles.subtitle, { textAlign: 'center', color: colors.textLight }]}>
          Evento creado el {new Date(event.createdAt).toLocaleDateString('es-ES')}
        </Text>
      </View>
    </ScrollView>
  );
};

export default EventDetailScreen;
