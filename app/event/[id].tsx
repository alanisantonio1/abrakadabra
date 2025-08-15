
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { loadEvents, updateEvent, deleteEvent } from '../../utils/storage';
import { sendWhatsAppReminder, sendWhatsAppCancellation, sendWhatsAppAnticipoConfirmation, calculateEventCost, getPricingInfo } from '../../utils/whatsapp';
import Button from '../../components/Button';
import { Event } from '../../types';

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
  if (!dateString) return 'Fecha no disponible';
  
  try {
    const { year, month, day } = parseDateString(dateString);
    const dayOfWeek = getDayOfWeek(dateString);
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    console.log(`🗓️ EVENT DETAIL: Formatting date ${dateString}`);
    console.log(`   - Parsed: ${day}/${month + 1}/${year}`);
    console.log(`   - Day of week: ${dayOfWeek} (${dayNames[dayOfWeek]})`);
    
    return `${dayNames[dayOfWeek]} ${day} de ${monthNames[month]} de ${year}`;
  } catch (error) {
    console.error('❌ Error formatting date:', error);
    return dateString;
  }
};

const EventDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const loadEventData = useCallback(async () => {
    try {
      console.log('📥 Loading event data for ID:', id);
      setLoading(true);
      
      const events = await loadEvents();
      const foundEvent = events.find(e => e.id === id);
      
      if (foundEvent) {
        console.log('✅ Event found:', foundEvent);
        console.log('📅 EVENT DETAIL: Event date:', foundEvent.date);
        console.log('📅 EVENT DETAIL: Formatted display:', formatDateForDisplay(foundEvent.date));
        setEvent(foundEvent);
        setNotes(foundEvent.notes || '');
      } else {
        console.error('❌ Event not found with ID:', id);
        Alert.alert(
          'Error',
          'No se encontró el evento solicitado.',
          [{ text: 'Volver', onPress: () => router.back() }]
        );
      }
    } catch (error: any) {
      console.error('❌ Error loading event:', error);
      Alert.alert(
        'Error',
        `Error cargando el evento: ${error.message}`,
        [{ text: 'Volver', onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadEventData();
    }
  }, [id, loadEventData]);

  const handleMarkAsPaid = async () => {
    if (!event) return;

    try {
      console.log('💰 Marking event as paid...');
      
      const updatedEvent: Event = {
        ...event,
        isPaid: true,
        deposit: event.totalAmount,
        remainingAmount: 0,
        anticipo1Amount: event.totalAmount,
        anticipo1Date: new Date().toISOString().split('T')[0],
      };

      const result = await updateEvent(updatedEvent);
      
      if (result.success) {
        setEvent(updatedEvent);
        Alert.alert(
          '✅ Evento Actualizado',
          `El evento de ${event.childName} ha sido marcado como pagado en su totalidad.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', `No se pudo actualizar el evento: ${result.message}`);
      }
    } catch (error: any) {
      console.error('❌ Error marking as paid:', error);
      Alert.alert('Error', `Error actualizando el evento: ${error.message}`);
    }
  };

  const handleDeleteEvent = async () => {
    if (!event) return;

    Alert.alert(
      '⚠️ Confirmar Eliminación',
      `¿Estás seguro de que quieres eliminar el evento de ${event.childName} programado para ${formatDateForDisplay(event.date)}?\n\nEsta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Deleting event...');
              const result = await deleteEvent(event);
              
              if (result.success) {
                Alert.alert(
                  '✅ Evento Eliminado',
                  `El evento de ${event.childName} ha sido eliminado exitosamente.`,
                  [
                    {
                      text: 'OK',
                      onPress: () => router.replace('/events')
                    }
                  ]
                );
              } else {
                Alert.alert('Error', `No se pudo eliminar el evento: ${result.message}`);
              }
            } catch (error: any) {
              console.error('❌ Error deleting event:', error);
              Alert.alert('Error', `Error eliminando el evento: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  const handleWhatsAppReminder = () => {
    if (!event) return;
    
    console.log('📱 Sending WhatsApp reminder...');
    sendWhatsAppReminder(event);
  };

  const handleSaveNotes = async () => {
    if (!event) return;

    try {
      console.log('📝 Saving notes...');
      
      const updatedEvent: Event = {
        ...event,
        notes: notes.trim(),
      };

      const result = await updateEvent(updatedEvent);
      
      if (result.success) {
        setEvent(updatedEvent);
        Alert.alert('✅ Notas Guardadas', 'Las notas han sido actualizadas exitosamente.');
      } else {
        Alert.alert('Error', `No se pudieron guardar las notas: ${result.message}`);
      }
    } catch (error: any) {
      console.error('❌ Error saving notes:', error);
      Alert.alert('Error', `Error guardando las notas: ${error.message}`);
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
          variant="outline"
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

  return (
    <ScrollView style={commonStyles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={commonStyles.backButton}
          onPress={() => router.back()}
        >
          <Text style={commonStyles.buttonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={commonStyles.title}>🎪 Detalles del Evento</Text>
      </View>

      {/* Event Status Badge */}
      <View style={[
        commonStyles.statusBadge,
        {
          backgroundColor: event.isPaid ? colors.success : colors.warning,
          padding: 12,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 20
        }
      ]}>
        <Text style={[
          commonStyles.statusText,
          {
            color: colors.white,
            fontSize: 16,
            fontWeight: 'bold'
          }
        ]}>
          {event.isPaid ? '✅ PAGADO EN SU TOTALIDAD' : '⏳ PAGO PENDIENTE'}
        </Text>
      </View>

      {/* Event Information */}
      <View style={commonStyles.card}>
        <Text style={commonStyles.sectionTitle}>📋 Información del Evento</Text>
        
        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>👶 Niño/a:</Text>
          <Text style={commonStyles.infoValue}>{event.childName}</Text>
        </View>
        
        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>📅 Fecha:</Text>
          <Text style={commonStyles.infoValue}>{formatDateForDisplay(event.date)}</Text>
        </View>
        
        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>⏰ Hora:</Text>
          <Text style={commonStyles.infoValue}>{event.time}</Text>
        </View>
        
        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>📦 Paquete:</Text>
          <Text style={commonStyles.infoValue}>{event.packageType}</Text>
        </View>
      </View>

      {/* Customer Information */}
      <View style={commonStyles.card}>
        <Text style={commonStyles.sectionTitle}>👥 Información del Cliente</Text>
        
        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>👤 Nombre:</Text>
          <Text style={commonStyles.infoValue}>{event.customerName}</Text>
        </View>
        
        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>📱 Teléfono:</Text>
          <Text style={commonStyles.infoValue}>{event.customerPhone}</Text>
        </View>
      </View>

      {/* Payment Information */}
      <View style={commonStyles.card}>
        <Text style={commonStyles.sectionTitle}>💰 Información de Pago</Text>
        
        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>💵 Total:</Text>
          <Text style={[commonStyles.infoValue, { fontWeight: 'bold' }]}>
            {formatCurrency(event.totalAmount)}
          </Text>
        </View>
        
        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>💳 Anticipo:</Text>
          <Text style={[commonStyles.infoValue, { color: colors.primary, fontWeight: 'bold' }]}>
            {formatCurrency(event.deposit)}
          </Text>
        </View>
        
        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>📊 Saldo:</Text>
          <Text style={[
            commonStyles.infoValue,
            {
              color: event.remainingAmount > 0 ? colors.warning : colors.success,
              fontWeight: 'bold'
            }
          ]}>
            {formatCurrency(event.remainingAmount)}
          </Text>
        </View>

        {/* Anticipo Information */}
        {event.anticipo1Amount && event.anticipo1Amount > 0 && (
          <View style={{
            backgroundColor: colors.lightGray,
            padding: 12,
            borderRadius: 8,
            marginTop: 12
          }}>
            <Text style={[commonStyles.infoLabel, { marginBottom: 4 }]}>💰 Anticipo Registrado:</Text>
            <Text style={commonStyles.infoValue}>
              Monto: {formatCurrency(event.anticipo1Amount)}
            </Text>
            {event.anticipo1Date && (
              <Text style={commonStyles.infoValue}>
                Fecha: {formatDateForDisplay(event.anticipo1Date)}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Notes Section */}
      <View style={commonStyles.card}>
        <Text style={commonStyles.sectionTitle}>📝 Notas</Text>
        
        <TextInput
          style={[
            commonStyles.input,
            {
              height: 100,
              textAlignVertical: 'top',
              marginBottom: 12
            }
          ]}
          placeholder="Agregar notas sobre el evento..."
          placeholderTextColor={colors.textLight}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />
        
        <Button
          text="💾 Guardar Notas"
          onPress={handleSaveNotes}
          variant="secondary"
          size="small"
        />
      </View>

      {/* Action Buttons */}
      <View style={commonStyles.card}>
        <Text style={commonStyles.sectionTitle}>🚀 Acciones</Text>
        
        <Button
          text="📱 Enviar Recordatorio WhatsApp"
          onPress={handleWhatsAppReminder}
          variant="success"
          style={{ marginBottom: 12 }}
        />
        
        {!event.isPaid && (
          <Button
            text="✅ Marcar como Pagado"
            onPress={handleMarkAsPaid}
            variant="primary"
            style={{ marginBottom: 12 }}
          />
        )}
        
        <Button
          text="🗑️ Eliminar Evento"
          onPress={handleDeleteEvent}
          variant="danger"
        />
      </View>

      {/* Pricing Information */}
      <View style={commonStyles.card}>
        <Text style={commonStyles.sectionTitle}>💡 Información de Precios</Text>
        <Text style={commonStyles.infoText}>
          {getPricingInfo(event.date).priceCategory}
        </Text>
        <Text style={[commonStyles.infoText, { fontSize: 12, color: colors.textMuted, marginTop: 8 }]}>
          Los precios varían según el día de la semana:
          {'\n'}• Lunes a Viernes: $4,000
          {'\n'}• Sábado: $6,000  
          {'\n'}• Domingo: $5,000
        </Text>
      </View>

      {/* Creation Date */}
      {event.createdAt && (
        <View style={[commonStyles.card, { marginBottom: 30 }]}>
          <Text style={commonStyles.sectionTitle}>📅 Información de Registro</Text>
          <Text style={commonStyles.infoText}>
            Evento creado: {new Date(event.createdAt).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default EventDetailScreen;
