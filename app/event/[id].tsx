
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { Event } from '../../types';
import { loadEvents, saveEvents } from '../../utils/storage';
import { sendWhatsAppReminder } from '../../utils/whatsapp';
import Button from '../../components/Button';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    loadEventData();
  }, [id]);

  const loadEventData = async () => {
    const loadedEvents = await loadEvents();
    setEvents(loadedEvents);
    const foundEvent = loadedEvents.find(e => e.id === id);
    setEvent(foundEvent || null);
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
            const updatedEvents = events.map(e =>
              e.id === event.id
                ? { ...e, isPaid: true, remainingAmount: 0 }
                : e
            );
            
            await saveEvents(updatedEvents);
            setEvent({ ...event, isPaid: true, remainingAmount: 0 });
            Alert.alert('Éxito', 'Evento marcado como pagado');
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
            const updatedEvents = events.filter(e => e.id !== event.id);
            await saveEvents(updatedEvents);
            Alert.alert('Eliminado', 'Evento eliminado correctamente', [
              { text: 'OK', onPress: () => router.back() }
            ]);
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

  if (!event) {
    return (
      <View style={commonStyles.container}>
        <Text style={commonStyles.title}>Evento no encontrado</Text>
        <View style={commonStyles.buttonContainer}>
          <Button
            text="← Volver"
            onPress={() => router.back()}
            style={buttonStyles.backButton}
          />
        </View>
      </View>
    );
  }

  const eventDate = new Date(event.date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <ScrollView style={commonStyles.container}>
      <Text style={commonStyles.title}>📋 Detalles del Evento</Text>

      <View style={commonStyles.content}>
        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>🎉 {event.childName}</Text>
          <Text style={commonStyles.text}>Cliente: {event.customerName}</Text>
          <Text style={commonStyles.text}>Teléfono: {event.customerPhone}</Text>
        </View>

        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>📅 Fecha y Hora</Text>
          <Text style={commonStyles.text}>{eventDate}</Text>
          <Text style={commonStyles.text}>Hora: {event.time}</Text>
        </View>

        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>📦 Paquete</Text>
          <Text style={[commonStyles.text, { fontSize: 18, fontWeight: '600', color: colors.primary }]}>
            {event.packageType}
          </Text>
        </View>

        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>💰 Información de Pago</Text>
          <View style={commonStyles.row}>
            <Text style={commonStyles.text}>Monto Total:</Text>
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>${event.totalAmount}</Text>
          </View>
          <View style={commonStyles.row}>
            <Text style={commonStyles.text}>Anticipo:</Text>
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>${event.deposit}</Text>
          </View>
          <View style={commonStyles.row}>
            <Text style={commonStyles.text}>Saldo Pendiente:</Text>
            <Text style={[
              commonStyles.text, 
              { fontWeight: '600', color: event.remainingAmount > 0 ? colors.error : colors.success }
            ]}>
              ${event.remainingAmount}
            </Text>
          </View>
          <View style={[
            { 
              paddingHorizontal: 12, 
              paddingVertical: 6, 
              borderRadius: 12, 
              alignSelf: 'flex-start',
              marginTop: 8
            },
            event.isPaid 
              ? { backgroundColor: colors.success + '20' }
              : { backgroundColor: colors.warning + '20' }
          ]}>
            <Text style={[
              { fontSize: 12, fontWeight: '600' },
              event.isPaid ? { color: colors.success } : { color: colors.warning }
            ]}>
              {event.isPaid ? '✅ Pagado Completo' : '⏳ Pago Pendiente'}
            </Text>
          </View>
        </View>

        {event.notes && (
          <View style={commonStyles.card}>
            <Text style={commonStyles.subtitle}>📝 Notas</Text>
            <Text style={commonStyles.text}>{event.notes}</Text>
          </View>
        )}

        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>ℹ️ Información del Sistema</Text>
          <Text style={commonStyles.textLight}>
            Creado: {new Date(event.createdAt).toLocaleDateString('es-ES')}
          </Text>
          <Text style={commonStyles.textLight}>ID: {event.id}</Text>
        </View>

        <View style={commonStyles.buttonContainer}>
          <TouchableOpacity
            style={[commonStyles.card, { backgroundColor: '#25D366' }]}
            onPress={handleWhatsAppReminder}
          >
            <Text style={[commonStyles.text, { color: colors.backgroundAlt, textAlign: 'center', fontWeight: '600' }]}>
              📱 Enviar Recordatorio WhatsApp
            </Text>
          </TouchableOpacity>
        </View>

        {!event.isPaid && (
          <View style={commonStyles.buttonContainer}>
            <Button
              text="✅ Marcar como Pagado"
              onPress={handleMarkAsPaid}
              style={buttonStyles.success}
            />
          </View>
        )}

        <View style={commonStyles.buttonContainer}>
          <Button
            text="🗑️ Eliminar Evento"
            onPress={handleDeleteEvent}
            style={[buttonStyles.backButton, { backgroundColor: colors.error }]}
          />
        </View>

        <View style={commonStyles.buttonContainer}>
          <Button
            text="← Volver"
            onPress={() => router.back()}
            style={buttonStyles.backButton}
          />
        </View>
      </View>
    </ScrollView>
  );
}
