
import { loadEvents, runGoogleSheetsDiagnostics } from '../utils/storage';
import { Event } from '../types';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import EventCard from '../components/EventCard';
import React, { useState, useEffect, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import CalendarView from '../components/CalendarView';

export default function MainScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentView, setCurrentView] = useState<'main' | 'calendar'>('main');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEventsData();
  }, []);

  // Refresh events when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Main screen focused, refreshing events...');
      loadEventsData();
    }, [])
  );

  const loadEventsData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading events data...');
      const loadedEvents = await loadEvents();
      setEvents(loadedEvents);
      console.log('✅ Events loaded:', loadedEvents.length);
    } catch (error) {
      console.error('❌ Error loading events:', error);
      Alert.alert('Error', 'No se pudieron cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: string) => {
    console.log('📅 Date selected:', date);
    const existingEvent = events.find(event => event.date === date);
    
    if (existingEvent) {
      console.log('📋 Existing event found, navigating to details');
      router.push(`/event/${existingEvent.id}`);
    } else {
      console.log('➕ No existing event, navigating to schedule');
      router.push(`/schedule?date=${date}`);
    }
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    return events
      .filter(event => event.date >= todayString)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
  };

  const runDiagnostics = async () => {
    try {
      Alert.alert(
        'Diagnósticos de Google Sheets',
        'Ejecutando diagnósticos... Revisa la consola para ver los resultados.',
        [{ text: 'OK' }]
      );
      
      console.log('🔍 Starting Google Sheets diagnostics...');
      await runGoogleSheetsDiagnostics();
      
      Alert.alert(
        'Diagnósticos Completados',
        'Los diagnósticos han terminado. Revisa la consola del desarrollador para ver los resultados detallados.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Diagnostics error:', error);
      Alert.alert('Error', 'Error ejecutando diagnósticos');
    }
  };

  const renderMainScreen = () => (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
          <Text style={[commonStyles.title, { fontSize: 32, fontWeight: 'bold', color: colors.primary }]}>
            Abrakadabra
          </Text>
          <Text style={{ fontSize: 20, marginLeft: 8 }}>✨</Text>
        </View>
      </View>

      <View style={commonStyles.section}>
        <TouchableOpacity
          style={[commonStyles.button, { backgroundColor: colors.primary }]}
          onPress={() => setCurrentView('calendar')}
        >
          <Text style={commonStyles.buttonText}>Ver Disponibilidad</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[commonStyles.button, { backgroundColor: colors.secondary, marginTop: 10 }]}
          onPress={() => router.push('/events')}
        >
          <Text style={commonStyles.buttonText}>Ver Eventos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[commonStyles.button, { backgroundColor: colors.accent, marginTop: 10 }]}
          onPress={() => router.push('/packages')}
        >
          <Text style={commonStyles.buttonText}>Ver Paquetes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[commonStyles.button, { backgroundColor: '#FF6B6B', marginTop: 10 }]}
          onPress={runDiagnostics}
        >
          <Text style={commonStyles.buttonText}>🔍 Diagnósticos Google Sheets</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={commonStyles.section}>
          <Text style={commonStyles.text}>Cargando eventos...</Text>
        </View>
      ) : (
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Próximos Eventos</Text>
          {getUpcomingEvents().length > 0 ? (
            getUpcomingEvents().map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => router.push(`/event/${event.id}`)}
              />
            ))
          ) : (
            <Text style={commonStyles.text}>No hay eventos próximos</Text>
          )}
        </View>
      )}
    </ScrollView>
  );

  const renderCalendarScreen = () => (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={[commonStyles.button, { backgroundColor: colors.secondary, marginBottom: 15 }]}
          onPress={() => setCurrentView('main')}
        >
          <Text style={commonStyles.buttonText}>← Volver al Menú</Text>
        </TouchableOpacity>
        <Text style={commonStyles.title}>Calendario de Disponibilidad</Text>
        <Text style={commonStyles.subtitle}>
          Verde: Disponible • Rojo: Ocupado
        </Text>
      </View>

      <CalendarView
        events={events}
        onDateSelect={handleDateSelect}
      />
    </View>
  );

  return currentView === 'main' ? renderMainScreen() : renderCalendarScreen();
}
