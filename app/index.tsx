
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { Event } from '../types';
import { loadEvents } from '../utils/storage';
import CalendarView from '../components/CalendarView';
import EventCard from '../components/EventCard';

export default function MainScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    loadEventsData();
  }, []);

  const loadEventsData = async () => {
    const loadedEvents = await loadEvents();
    setEvents(loadedEvents);
    console.log('Loaded events:', loadedEvents.length);
  };

  const handleDateSelect = (date: string) => {
    console.log('Selected date:', date);
    
    // Check if the date has any events (unavailable)
    const dateEvents = events.filter(event => event.date === date);
    
    if (dateEvents.length > 0) {
      // Date is unavailable (red) - show event details
      console.log('Date unavailable, showing event details for:', dateEvents[0].id);
      router.push(`/event/${dateEvents[0].id}`);
    } else {
      // Date is available (green) - go to schedule screen
      console.log('Date available, navigating to schedule');
      router.push(`/schedule?date=${date}`);
    }
  };

  const renderMainScreen = () => (
    <ScrollView style={commonStyles.container}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}>
        {/* Main Title */}
        <Text style={[commonStyles.title, { 
          fontSize: 48, 
          fontWeight: '900',
          color: colors.primary,
          textAlign: 'center',
          marginBottom: 40,
          textShadowColor: 'rgba(0, 0, 0, 0.1)',
          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 4
        }]}>
          ✨ Abrakadabra ✨
        </Text>

        {/* Subtitle */}
        <Text style={[commonStyles.text, {
          fontSize: 18,
          textAlign: 'center',
          color: colors.textLight,
          marginBottom: 60,
          paddingHorizontal: 20
        }]}>
          Sistema de gestión para eventos infantiles
        </Text>

        {/* Main Action Button */}
        <TouchableOpacity
          style={[commonStyles.card, {
            backgroundColor: colors.primary,
            paddingVertical: 20,
            paddingHorizontal: 40,
            marginHorizontal: 20,
            marginBottom: 30,
            borderRadius: 16,
            boxShadow: '0px 4px 12px rgba(74, 144, 226, 0.3)',
            elevation: 6,
            borderWidth: 0
          }]}
          onPress={() => setShowCalendar(true)}
        >
          <Text style={[commonStyles.text, {
            color: colors.backgroundAlt,
            textAlign: 'center',
            fontWeight: '700',
            fontSize: 18,
            marginBottom: 0
          }]}>
            📅 REVISAR DISPONIBILIDAD
          </Text>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View style={[commonStyles.card, { 
          marginHorizontal: 20,
          backgroundColor: colors.backgroundAlt,
          borderColor: colors.border
        }]}>
          <Text style={[commonStyles.subtitle, { textAlign: 'center', marginBottom: 16 }]}>
            Resumen Rápido
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, color: colors.success }}>
                {events.filter(e => new Date(e.date) >= new Date()).length}
              </Text>
              <Text style={[commonStyles.textLight, { fontSize: 12 }]}>Próximos</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, color: colors.warning }}>
                {events.filter(e => !e.isPaid).length}
              </Text>
              <Text style={[commonStyles.textLight, { fontSize: 12 }]}>Pendientes</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, color: colors.primary }}>
                {events.length}
              </Text>
              <Text style={[commonStyles.textLight, { fontSize: 12 }]}>Total</Text>
            </View>
          </View>
        </View>

        {/* Quick Access Buttons */}
        <View style={{ width: '100%', paddingHorizontal: 20, marginTop: 30 }}>
          <TouchableOpacity
            style={[commonStyles.card, {
              backgroundColor: colors.secondary,
              paddingVertical: 16,
              marginBottom: 16,
              borderWidth: 0
            }]}
            onPress={() => router.push('/events')}
          >
            <Text style={[commonStyles.text, {
              color: colors.backgroundAlt,
              textAlign: 'center',
              fontWeight: '600',
              marginBottom: 0
            }]}>
              📋 Ver Todos los Eventos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.card, {
              backgroundColor: colors.success,
              paddingVertical: 16,
              borderWidth: 0
            }]}
            onPress={() => router.push('/packages')}
          >
            <Text style={[commonStyles.text, {
              color: colors.backgroundAlt,
              textAlign: 'center',
              fontWeight: '600',
              marginBottom: 0
            }]}>
              📦 Ver Paquetes Disponibles
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderCalendarScreen = () => (
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
          onPress={() => setShowCalendar(false)}
        >
          <Text style={{
            color: colors.backgroundAlt,
            fontWeight: '600'
          }}>
            ← Volver
          </Text>
        </TouchableOpacity>
        <Text style={[commonStyles.title, { flex: 1, marginTop: 0, marginBottom: 0 }]}>
          📅 Disponibilidad
        </Text>
      </View>

      {/* Instructions */}
      <View style={[commonStyles.card, { marginHorizontal: 16, marginBottom: 16 }]}>
        <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 12 }]}>
          Selecciona una fecha para continuar:
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 16,
              height: 16,
              backgroundColor: colors.success,
              borderRadius: 8,
              marginRight: 8
            }} />
            <Text style={[commonStyles.textLight, { fontSize: 14 }]}>
              Disponible → Agendar
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 16,
              height: 16,
              backgroundColor: colors.error,
              borderRadius: 8,
              marginRight: 8
            }} />
            <Text style={[commonStyles.textLight, { fontSize: 14 }]}>
              Ocupado → Ver evento
            </Text>
          </View>
        </View>
      </View>

      {/* Calendar */}
      <CalendarView
        events={events}
        onDateSelect={handleDateSelect}
      />
    </ScrollView>
  );

  return (
    <View style={commonStyles.container}>
      {showCalendar ? renderCalendarScreen() : renderMainScreen()}
    </View>
  );
}
