
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, TextInput } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { router, useLocalSearchParams } from 'expo-router';
import { Event } from '../../types';
import { loadEvents, updateEvent, deleteEvent } from '../../utils/storage';
import { sendWhatsAppReminder, sendWhatsAppCancellation, sendWhatsAppAnticipoConfirmation } from '../../utils/whatsapp';
import Button from '../../components/Button';

const EventDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);

  const loadEventData = useCallback(async () => {
    if (!id) return;
    
    try {
      console.log('📥 Loading event data for ID:', id);
      setLoading(true);
      const events = await loadEvents();
      const foundEvent = events.find(e => e.id === id);
      
      if (foundEvent) {
        setEvent(foundEvent);
        setNotes(foundEvent.notes || '');
        console.log('✅ Event loaded:', foundEvent.childName);
      } else {
        console.warn('⚠️ Event not found:', id);
        Alert.alert('Error', 'Evento no encontrado', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error: any) {
      console.error('❌ Error loading event:', error);
      Alert.alert('Error', `Error al cargar evento: ${error.message}`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEventData();
  }, [id, loadEventData]);

  const handleMarkAsPaid = async () => {
    if (!event) return;

    try {
      console.log('💰 Marking event as paid:', event.id);
      
      Alert.alert(
        'Confirmar Pago',
        `¿Marcar el evento de ${event.childName} como pagado completamente?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            onPress: async () => {
              const updatedEvent: Event = {
                ...event,
                isPaid: true,
                remainingAmount: 0,
              };

              await updateEvent(updatedEvent);
              setEvent(updatedEvent);
              
              Alert.alert('✅ Éxito', 'Evento marcado como pagado');
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ Error marking as paid:', error);
      Alert.alert('Error', `Error al marcar como pagado: ${error.message}`);
    }
  };

  const handleDeleteEvent = async () => {
    if (!event) return;

    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de que quieres eliminar el evento de ${event.childName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Deleting event:', event.id);
              const deleteResult = await deleteEvent(event);
              
              if (deleteResult.success) {
                console.log('✅ Event deleted successfully, navigating to events list');
                Alert.alert('✅ Éxito', 'Evento eliminado exitosamente', [
                  { 
                    text: 'OK', 
                    onPress: () => {
                      console.log('📋 Navigating to events list after deletion');
                      // Use replace instead of push to prevent going back to deleted event
                      router.replace('/events');
                    }
                  }
                ]);
              } else {
                console.error('❌ Delete failed:', deleteResult.message);
                Alert.alert('Error', `Error al eliminar evento: ${deleteResult.message}`);
              }
            } catch (error: any) {
              console.error('❌ Error deleting event:', error);
              Alert.alert('Error', `Error al eliminar evento: ${error.message}`);
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
      Alert.alert('✅ Éxito', 'Recordatorio enviado por WhatsApp');
    } catch (error: any) {
      console.error('❌ Error sending WhatsApp reminder:', error);
      Alert.alert('Error', `Error al enviar WhatsApp: ${error.message}`);
    }
  };

  const handleSaveNotes = async () => {
    if (!event) return;

    try {
      console.log('📝 Saving notes for event:', event.id);
      const updatedEvent: Event = {
        ...event,
        notes: notes.trim(),
      };

      await updateEvent(updatedEvent);
      setEvent(updatedEvent);
      setIsEditingNotes(false);
      
      Alert.alert('✅ Éxito', 'Notas guardadas');
    } catch (error: any) {
      console.error('❌ Error saving notes:', error);
      Alert.alert('Error', `Error al guardar notas: ${error.message}`);
    }
  };

  const formatDate = (dateString: string): string => {
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

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={commonStyles.loadingText}>🔄 Cargando evento...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={commonStyles.errorText}>❌ Evento no encontrado</Text>
        <Button
          text="← Volver"
          onPress={() => router.back()}
          variant="primary"
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

  return (
    <ScrollView style={commonStyles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <Button
          text="← Volver"
          onPress={() => router.back()}
          variant="outline"
          size="small"
          style={{ flex: 0.3 }}
        />
        
        <Text style={[commonStyles.title, { flex: 0.4, textAlign: 'center', fontSize: 20 }]}>
          📋 Detalles
        </Text>
        
        <View style={{ flex: 0.3 }} />
      </View>

      {/* Event Title */}
      <View style={commonStyles.card}>
        <Text style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: colors.primary,
          textAlign: 'center',
          marginBottom: 8,
        }}>
          🎈 {event.childName}
        </Text>
        
        <View style={[
          commonStyles.statusBadge,
          { backgroundColor: event.isPaid ? colors.success : colors.warning }
        ]}>
          <Text style={[commonStyles.statusText, { color: colors.white }]}>
            {event.isPaid ? '✅ PAGADO COMPLETAMENTE' : '⏳ PAGO PENDIENTE'}
          </Text>
        </View>
      </View>

      {/* Event Details */}
      <View style={commonStyles.card}>
        <Text style={commonStyles.sectionTitle}>📋 Información del Evento</Text>
        
        <View style={commonStyles.detailRow}>
          <Text style={commonStyles.detailLabel}>👤 Cliente:</Text>
          <Text style={commonStyles.detailValue}>{event.customerName}</Text>
        </View>
        
        <View style={commonStyles.detailRow}>
          <Text style={commonStyles.detailLabel}>📞 Teléfono:</Text>
          <Text style={commonStyles.detailValue}>{event.customerPhone}</Text>
        </View>
        
        <View style={commonStyles.detailRow}>
          <Text style={commonStyles.detailLabel}>📅 Fecha:</Text>
          <Text style={commonStyles.detailValue}>{formatDate(event.date)}</Text>
        </View>
        
        <View style={commonStyles.detailRow}>
          <Text style={commonStyles.detailLabel}>🕐 Hora:</Text>
          <Text style={commonStyles.detailValue}>{event.time}</Text>
        </View>
        
        <View style={commonStyles.detailRow}>
          <Text style={commonStyles.detailLabel}>📦 Paquete:</Text>
          <Text style={commonStyles.detailValue}>{event.packageType}</Text>
        </View>
      </View>

      {/* Payment Information */}
      <View style={commonStyles.card}>
        <Text style={commonStyles.sectionTitle}>💰 Información de Pago</Text>
        
        <View style={commonStyles.summaryContainer}>
          <View style={commonStyles.summaryRow}>
            <Text style={commonStyles.summaryLabel}>Total del evento:</Text>
            <Text style={[commonStyles.summaryValue, { fontSize: 18 }]}>
              {formatCurrency(event.totalAmount)}
            </Text>
          </View>
          
          <View style={commonStyles.summaryRow}>
            <Text style={commonStyles.summaryLabel}>Anticipo pagado:</Text>
            <Text style={[commonStyles.summaryValue, { color: colors.success }]}>
              {formatCurrency(event.anticipo1Amount || event.deposit || 0)}
            </Text>
          </View>
          
          <View style={commonStyles.summaryRow}>
            <Text style={commonStyles.summaryLabel}>Saldo pendiente:</Text>
            <Text style={[
              commonStyles.summaryValue,
              { 
                color: event.remainingAmount > 0 ? colors.danger : colors.success,
                fontSize: 18,
                fontWeight: 'bold'
              }
            ]}>
              {formatCurrency(event.remainingAmount)}
            </Text>
          </View>
        </View>
      </View>

      {/* Notes Section */}
      <View style={commonStyles.card}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}>
          <Text style={commonStyles.sectionTitle}>📝 Notas</Text>
          <Button
            text={isEditingNotes ? "💾 Guardar" : "✏️ Editar"}
            onPress={isEditingNotes ? handleSaveNotes : () => setIsEditingNotes(true)}
            variant={isEditingNotes ? "success" : "accent"}
            size="small"
          />
        </View>
        
        {isEditingNotes ? (
          <TextInput
            style={[commonStyles.input, { minHeight: 100, textAlignVertical: 'top' }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Agregar notas sobre el evento..."
            multiline
            numberOfLines={4}
          />
        ) : (
          <Text style={commonStyles.notesText}>
            {event.notes || 'Sin notas adicionales'}
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={commonStyles.card}>
        <Text style={commonStyles.sectionTitle}>🎯 Acciones</Text>
        
        <View style={{ gap: 12 }}>
          {/* WhatsApp Button */}
          <Button
            text="📱 Enviar Recordatorio WhatsApp"
            onPress={handleWhatsAppReminder}
            variant="success"
            icon="📱"
          />
          
          {/* Mark as Paid Button */}
          {!event.isPaid && (
            <Button
              text="💰 Marcar como Pagado"
              onPress={handleMarkAsPaid}
              variant="accent"
              icon="💰"
            />
          )}
          
          {/* Delete Button */}
          <Button
            text="🗑️ Eliminar Evento"
            onPress={handleDeleteEvent}
            variant="danger"
            icon="🗑️"
          />
        </View>
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

export default EventDetailScreen;
