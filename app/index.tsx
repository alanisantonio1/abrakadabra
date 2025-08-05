
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { loadEvents } from '../utils/storage';
import CalendarView from '../components/CalendarView';
import EventCard from '../components/EventCard';
import { commonStyles, colors } from '../styles/commonStyles';
import { Event } from '../types';

const MainScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentView, setCurrentView] = useState<'main' | 'calendar'>('main');
  const [loading, setLoading] = useState(false);

  // Load events when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('MainScreen: Screen focused, loading events...');
      loadEventsData();
    }, [])
  );

  useEffect(() => {
    console.log('MainScreen: Component mounted, loading events...');
    loadEventsData();
  }, []);

  const loadEventsData = async () => {
    try {
      setLoading(true);
      console.log('MainScreen: Loading events...');
      const loadedEvents = await loadEvents();
      console.log('MainScreen: Events loaded:', loadedEvents.length);
      setEvents(loadedEvents);
    } catch (error) {
      console.error('MainScreen: Error loading events:', error);
      Alert.alert('Error', 'No se pudieron cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: string) => {
    console.log('MainScreen: Date selected:', date);
    setSelectedDate(date);
    
    // Check if date has events
    const dateEvents = events.filter(event => event.date === date);
    console.log('MainScreen: Events for selected date:', dateEvents.length);
    
    if (dateEvents.length > 0) {
      // Navigate to event details for the first event on this date
      console.log('MainScreen: Navigating to event details for:', dateEvents[0].id);
      router.push(`/event/${dateEvents[0].id}`);
    } else {
      // Navigate to schedule screen for this date
      console.log('MainScreen: Navigating to schedule for date:', date);
      router.push({
        pathname: '/schedule',
        params: { date }
      });
    }
  };

  const renderMainScreen = () => (
    <ScrollView style={commonStyles.container} showsVerticalScrollIndicator={false}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.title}>Abrakadabra</Text>
        <Text style={commonStyles.subtitle}>Gestión de Eventos</Text>
      </View>

      <View style={commonStyles.buttonContainer}>
        <TouchableOpacity
          style={[commonStyles.primaryButton, { backgroundColor: colors.success }]}
          onPress={() => setCurrentView('calendar')}
        >
          <Text style={commonStyles.buttonText}>REVISAR DISPONIBILIDAD</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[commonStyles.secondaryButton, { marginTop: 16 }]}
          onPress={() => router.push('/events')}
        >
          <Text style={[commonStyles.buttonText, { color: colors.primary }]}>Ver Todos los Eventos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[commonStyles.secondaryButton, { marginTop: 8 }]}
          onPress={() => router.push('/packages')}
        >
          <Text style={[commonStyles.buttonText, { color: colors.primary }]}>Ver Paquetes</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Events */}
      <View style={{ marginTop: 32 }}>
        <Text style={[commonStyles.sectionTitle, { marginBottom: 16 }]}>Eventos Recientes</Text>
        {loading ? (
          <Text style={{ textAlign: 'center', color: colors.textLight, fontSize: 16 }}>
            Cargando eventos...
          </Text>
        ) : events.length > 0 ? (
          events
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3)
            .map(event => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => router.push(`/event/${event.id}`)}
              />
            ))
        ) : (
          <Text style={{ textAlign: 'center', color: colors.textLight, fontSize: 16 }}>
            No hay eventos registrados
          </Text>
        )}
      </View>

      {/* Refresh Button */}
      <TouchableOpacity
        style={[commonStyles.secondaryButton, { marginTop: 24, marginBottom: 32 }]}
        onPress={loadEventsData}
        disabled={loading}
      >
        <Text style={[commonStyles.buttonText, { color: colors.primary }]}>
          {loading ? 'Actualizando...' : 'Actualizar Eventos'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCalendarScreen = () => (
    <View style={commonStyles.container}>
      <View style={[commonStyles.header, { paddingHorizontal: 16 }]}>
        <TouchableOpacity
          style={[commonStyles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => setCurrentView('main')}
        >
          <Text style={[commonStyles.backButtonText, { color: colors.backgroundAlt }]}>← Volver</Text>
        </TouchableOpacity>
        <Text style={[commonStyles.title, { flex: 1, textAlign: 'center' }]}>Calendario</Text>
        <View style={{ width: 80 }} />
      </View>

      <CalendarView
        events={events}
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
      />

      <View style={{ padding: 16 }}>
        <Text style={[commonStyles.subtitle, { textAlign: 'center', marginBottom: 16 }]}>
          Selecciona una fecha para agendar o ver eventos
        </Text>
        <Text style={{ textAlign: 'center', color: colors.textLight, fontSize: 14 }}>
          Verde: Disponible para agendar{'\n'}
          Rojo: Ocupado - Ver información del evento
        </Text>
      </View>
    </View>
  );

  return currentView === 'main' ? renderMainScreen() : renderCalendarScreen();
};

export default MainScreen;
