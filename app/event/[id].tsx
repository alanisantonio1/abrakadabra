
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { loadEvents, updateEvent, deleteEvent } from '../../utils/storage';
import { sendWhatsAppReminder, sendWhatsAppCancellation } from '../../utils/whatsapp';
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
      '¿Estás seguro de que quieres eliminar este evento?\n\n⚠️ Se enviará un mensaje de cancelación al cliente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar y Notificar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              console.log('EventDetailScreen: Deleting event and sending cancellation:', event.id);
              
              // Send cancellation message first
              sendWhatsAppCancellation(event);
              
              // Then delete the event
              await deleteEvent(event.id);
              
              console.log('EventDetailScreen: Event deleted successfully');
              Alert.alert(
                'Evento Eliminado',
                '✅ Evento eliminado correctamente\n📱 Mensaje de cancelación enviado al cliente',
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
    
    Alert.alert(
      'Recordatorio Enviado',
      '📱 Se abrió WhatsApp con el mensaje de recordatorio',
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: colors.text }}>🔄 Cargando...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: colors.text }}>❌ Evento no encontrado</Text>
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
      <View style={[commonStyles.header, { paddingHorizontal: 16, paddingVertical: 20 }]}>
        <TouchableOpacity
          style={[commonStyles.backButton, { 
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 8
          }]}
          onPress={() => router.back()}
        >
          <Text style={[commonStyles.backButtonText, { 
            color: 'white',
            fontWeight: '600'
          }]}>
            ← Volver
          </Text>
        </TouchableOpacity>
        <Text style={[commonStyles.title, { 
          flex: 1, 
          textAlign: 'center',
          fontSize: 20,
          fontWeight: '700',
          color: colors.primary
        }]}>
          📋 Detalles del Evento
        </Text>
        <View style={{ width: 80 }} />
      </View>

      <View style={[commonStyles.card, { margin: 16 }]}>
        {/* Event Status */}
        <View style={[
          commonStyles.statusBadge,
          { 
            backgroundColor: event.isPaid ? colors.success + '20' : colors.warning + '20',
            marginBottom: 20,
            paddingVertical: 12,
            borderRadius: 8
          }
        ]}>
          <Text style={[
            commonStyles.statusText,
            { 
              color: event.isPaid ? colors.success : colors.warning,
              fontSize: 16,
              fontWeight: '700',
              textAlign: 'center'
            }
          ]}>
            {event.isPaid ? '✅ PAGADO' : '⏳ PENDIENTE'}
          </Text>
        </View>

        {/* Basic Information */}
        <View style={[commonStyles.section, { marginBottom: 24 }]}>
          <Text style={[commonStyles.sectionTitle, { 
            fontSize: 18,
            fontWeight: '700',
            color: colors.primary,
            marginBottom: 16
          }]}>
            📅 Información del Evento
          </Text>
          
          <View style={[commonStyles.infoRow, { marginBottom: 12 }]}>
            <Text style={[commonStyles.infoLabel, { fontWeight: '600' }]}>Fecha:</Text>
            <Text style={[commonStyles.infoValue, { fontWeight: '500' }]}>{formattedDate}</Text>
          </View>

          <View style={[commonStyles.infoRow, { marginBottom: 12 }]}>
            <Text style={[commonStyles.infoLabel, { fontWeight: '600' }]}>Hora:</Text>
            <Text style={[commonStyles.infoValue, { fontWeight: '500' }]}>{event.time}</Text>
          </View>

          <View style={commonStyles.infoRow}>
            <Text style={[commonStyles.infoLabel, { fontWeight: '600' }]}>Paquete:</Text>
            <Text style={[commonStyles.infoValue, { 
              fontWeight: '600',
              color: colors.primary
            }]}>
              {event.packageType}
            </Text>
          </View>
        </View>

        {/* Customer Information */}
        <View style={[commonStyles.section, { marginBottom: 24 }]}>
          <Text style={[commonStyles.sectionTitle, { 
            fontSize: 18,
            fontWeight: '700',
            color: colors.primary,
            marginBottom: 16
          }]}>
            👤 Información del Cliente
          </Text>
          
          <View style={[commonStyles.infoRow, { marginBottom: 12 }]}>
            <Text style={[commonStyles.infoLabel, { fontWeight: '600' }]}>Cliente:</Text>
            <Text style={[commonStyles.infoValue, { fontWeight: '500' }]}>{event.customerName}</Text>
          </View>

          <View style={[commonStyles.infoRow, { marginBottom: 12 }]}>
            <Text style={[commonStyles.infoLabel, { fontWeight: '600' }]}>Teléfono:</Text>
            <Text style={[commonStyles.infoValue, { 
              fontWeight: '500',
              color: colors.primary
            }]}>
              {event.customerPhone}
            </Text>
          </View>

          <View style={commonStyles.infoRow}>
            <Text style={[commonStyles.infoLabel, { fontWeight: '600' }]}>Festejado:</Text>
            <Text style={[commonStyles.infoValue, { 
              fontWeight: '600',
              color: colors.success
            }]}>
              🎂 {event.childName}
            </Text>
          </View>
        </View>

        {/* Payment Information */}
        <View style={[commonStyles.section, { marginBottom: 24 }]}>
          <Text style={[commonStyles.sectionTitle, { 
            fontSize: 18,
            fontWeight: '700',
            color: colors.primary,
            marginBottom: 16
          }]}>
            💰 Información de Pago
          </Text>
          
          <View style={[commonStyles.infoRow, { marginBottom: 12 }]}>
            <Text style={[commonStyles.infoLabel, { fontWeight: '600' }]}>Total:</Text>
            <Text style={[commonStyles.infoValue, { 
              fontWeight: '700',
              fontSize: 16,
              color: colors.text
            }]}>
              ${event.totalAmount.toLocaleString()}
            </Text>
          </View>

          <View style={[commonStyles.infoRow, { marginBottom: 12 }]}>
            <Text style={[commonStyles.infoLabel, { fontWeight: '600' }]}>Anticipo:</Text>
            <Text style={[commonStyles.infoValue, { fontWeight: '500' }]}>
              ${event.deposit.toLocaleString()}
            </Text>
          </View>

          <View style={commonStyles.infoRow}>
            <Text style={[commonStyles.infoLabel, { fontWeight: '600' }]}>Saldo:</Text>
            <Text style={[
              commonStyles.infoValue,
              { 
                color: event.remainingAmount > 0 ? colors.warning : colors.success,
                fontWeight: '700',
                fontSize: 16
              }
            ]}>
              ${event.remainingAmount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {event.notes && (
          <View style={[commonStyles.section, { marginBottom: 24 }]}>
            <Text style={[commonStyles.sectionTitle, { 
              fontSize: 18,
              fontWeight: '700',
              color: colors.primary,
              marginBottom: 16
            }]}>
              📝 Notas
            </Text>
            <Text style={[commonStyles.infoValue, { 
              fontStyle: 'italic',
              backgroundColor: colors.backgroundAlt,
              padding: 12,
              borderRadius: 8
            }]}>
              {event.notes}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={commonStyles.buttonContainer}>
          {/* WhatsApp Reminder */}
          <Button
            text="📱 Enviar Recordatorio WhatsApp"
            onPress={handleWhatsAppReminder}
            style={[buttonStyles.secondary, { 
              backgroundColor: colors.success,
              paddingVertical: 16,
              borderRadius: 10
            }]}
            textStyle={{ 
              color: 'white',
              fontWeight: '600',
              fontSize: 16
            }}
          />

          {/* Mark as Paid */}
          {!event.isPaid && (
            <Button
              text="✅ Marcar como Pagado"
              onPress={handleMarkAsPaid}
              style={[buttonStyles.primary, { 
                marginTop: 12,
                paddingVertical: 16,
                borderRadius: 10
              }]}
              textStyle={{
                fontWeight: '600',
                fontSize: 16
              }}
            />
          )}

          {/* Delete Event */}
          <Button
            text="🗑️ Eliminar Evento"
            onPress={handleDeleteEvent}
            style={[
              buttonStyles.secondary,
              { 
                marginTop: 12,
                backgroundColor: colors.error + '15',
                borderColor: colors.error,
                borderWidth: 2,
                paddingVertical: 16,
                borderRadius: 10
              }
            ]}
            textStyle={{ 
              color: colors.error,
              fontWeight: '600',
              fontSize: 16
            }}
          />
        </View>
      </View>

      {/* Event Creation Info */}
      <View style={[commonStyles.card, { 
        marginHorizontal: 16, 
        marginBottom: 32,
        backgroundColor: colors.backgroundAlt,
        paddingVertical: 16
      }]}>
        <Text style={[commonStyles.subtitle, { 
          textAlign: 'center', 
          color: colors.textLight,
          fontSize: 14,
          fontWeight: '500'
        }]}>
          📅 Evento creado el {new Date(event.createdAt).toLocaleDateString('es-ES')}
        </Text>
      </View>
    </ScrollView>
  );
};

export default EventDetailScreen;
