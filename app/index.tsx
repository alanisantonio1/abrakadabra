
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

  // Load events when screen comes into focus (this ensures refresh after scheduling)
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

  // Get upcoming events (next 2 weeks)
  const getUpcomingEvents = () => {
    const today = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(today.getDate() + 14);
    
    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= twoWeeksFromNow;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  };

  const renderMainScreen = () => (
    <ScrollView style={commonStyles.container} showsVerticalScrollIndicator={false}>
      {/* Header with improved styling - REMOVED "Gestión de eventos Mágicos" */}
      <View style={[commonStyles.header, { paddingVertical: 50, paddingHorizontal: 20 }]}>
        <Text style={[commonStyles.title, { 
          fontSize: 42, 
          fontWeight: '800',
          color: colors.primary,
          textAlign: 'center',
          marginBottom: 20
        }]}>
          ✨ Abrakadabra ✨
        </Text>
      </View>

      {/* Main Action Buttons */}
      <View style={[commonStyles.buttonContainer, { paddingHorizontal: 20 }]}>
        <TouchableOpacity
          style={[commonStyles.primaryButton, { 
            backgroundColor: colors.success,
            paddingVertical: 18,
            borderRadius: 12,
            shadowColor: colors.success,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6
          }]}
          onPress={() => {
            console.log('MainScreen: Switching to calendar view');
            setCurrentView('calendar');
          }}
        >
          <Text style={[commonStyles.buttonText, { 
            fontSize: 18, 
            fontWeight: '700',
            color: 'white'
          }]}>
            📅 Ver Disponibilidad
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[commonStyles.secondaryButton, { 
            marginTop: 16,
            paddingVertical: 16,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: colors.primary,
            backgroundColor: 'transparent'
          }]}
          onPress={() => router.push('/events')}
        >
          <Text style={[commonStyles.buttonText, { 
            color: colors.primary,
            fontSize: 16,
            fontWeight: '600'
          }]}>
            📋 Ver Todos los Eventos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[commonStyles.secondaryButton, { 
            marginTop: 12,
            paddingVertical: 16,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: colors.primary,
            backgroundColor: 'transparent'
          }]}
          onPress={() => router.push('/packages')}
        >
          <Text style={[commonStyles.buttonText, { 
            color: colors.primary,
            fontSize: 16,
            fontWeight: '600'
          }]}>
            📦 Ver Paquetes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Events Section */}
      <View style={{ marginTop: 40, paddingHorizontal: 20 }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginBottom: 20,
          paddingBottom: 10,
          borderBottomWidth: 2,
          borderBottomColor: colors.primary + '20'
        }}>
          <Text style={[commonStyles.sectionTitle, { 
            fontSize: 24,
            fontWeight: '700',
            color: colors.primary,
            flex: 1
          }]}>
            🗓️ Eventos Próximos
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.textLight,
            fontWeight: '500'
          }}>
            Próximas 2 semanas
          </Text>
        </View>
        
        {loading ? (
          <View style={{
            backgroundColor: colors.backgroundAlt,
            padding: 20,
            borderRadius: 12,
            alignItems: 'center'
          }}>
            <Text style={{ 
              textAlign: 'center', 
              color: colors.textLight, 
              fontSize: 16,
              fontWeight: '500'
            }}>
              🔄 Cargando eventos...
            </Text>
          </View>
        ) : getUpcomingEvents().length > 0 ? (
          getUpcomingEvents().map(event => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => router.push(`/event/${event.id}`)}
            />
          ))
        ) : (
          <View style={{
            backgroundColor: colors.backgroundAlt,
            padding: 20,
            borderRadius: 12,
            alignItems: 'center'
          }}>
            <Text style={{ 
              textAlign: 'center', 
              color: colors.textLight, 
              fontSize: 16,
              fontWeight: '500'
            }}>
              📅 No hay eventos próximos
            </Text>
            <Text style={{ 
              textAlign: 'center', 
              color: colors.textLight, 
              fontSize: 14,
              marginTop: 4
            }}>
              ¡Agenda tu primer evento!
            </Text>
          </View>
        )}
      </View>

      {/* Refresh Button */}
      <View style={{ paddingHorizontal: 20, marginTop: 30, marginBottom: 40 }}>
        <TouchableOpacity
          style={[commonStyles.secondaryButton, { 
            paddingVertical: 14,
            borderRadius: 12,
            backgroundColor: colors.backgroundAlt,
            borderWidth: 1,
            borderColor: colors.primary + '30'
          }]}
          onPress={loadEventsData}
          disabled={loading}
        >
          <Text style={[commonStyles.buttonText, { 
            color: colors.primary,
            fontSize: 15,
            fontWeight: '600'
          }]}>
            {loading ? '🔄 Actualizando...' : '🔄 Actualizar Eventos'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderCalendarScreen = () => (
    <View style={commonStyles.container}>
      <View style={[commonStyles.header, { paddingHorizontal: 16, paddingVertical: 20 }]}>
        <TouchableOpacity
          style={[commonStyles.backButton, { 
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 8
          }]}
          onPress={() => {
            console.log('MainScreen: Returning to main view');
            setCurrentView('main');
            // Refresh events when returning to main view
            loadEventsData();
          }}
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
          fontSize: 24,
          fontWeight: '700',
          color: colors.primary
        }]}>
          📅 Calendario
        </Text>
        <View style={{ width: 80 }} />
      </View>

      <CalendarView
        events={events}
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
      />

      <View style={{ padding: 20, backgroundColor: colors.backgroundAlt, margin: 16, borderRadius: 12 }}>
        <Text style={[commonStyles.subtitle, { 
          textAlign: 'center', 
          marginBottom: 12,
          fontSize: 16,
          fontWeight: '600',
          color: colors.text
        }]}>
          💡 Instrucciones
        </Text>
        <Text style={{ 
          textAlign: 'center', 
          color: colors.textLight, 
          fontSize: 14,
          lineHeight: 20
        }}>
          🟢 <Text style={{ fontWeight: '600', color: colors.success }}>Verde</Text>: Fecha disponible - Toca para agendar{'\n'}
          🔴 <Text style={{ fontWeight: '600', color: colors.error }}>Rojo</Text>: Fecha ocupada - Toca para ver detalles
        </Text>
      </View>
    </View>
  );

  return currentView === 'main' ? renderMainScreen() : renderCalendarScreen();
};

export default MainScreen;
