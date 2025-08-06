
import DiagnosticsModal from '../components/DiagnosticsModal';
import EventCard from '../components/EventCard';
import { commonStyles, colors } from '../styles/commonStyles';
import { Event } from '../types';
import { loadEvents, testDatabaseConnections } from '../utils/storage';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import CalendarView from '../components/CalendarView';

const MainScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentView, setCurrentView] = useState<'main' | 'calendar'>('main');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [showTools, setShowTools] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadEventsData();
    }, [])
  );

  useEffect(() => {
    loadEventsData();
  }, []);

  const loadEventsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('📥 Loading events data...');
      
      const loadedEvents = await loadEvents();
      setEvents(loadedEvents);
      console.log('✅ Events loaded:', loadedEvents.length);
    } catch (error: any) {
      console.error('❌ Error loading events:', error);
      setError(error.message || 'Error cargando eventos');
      
      // Try to show a user-friendly error message
      const errorMessage = error.message?.includes('Network') 
        ? 'Error de conexión. Verificando almacenamiento local...'
        : 'Error cargando eventos del almacenamiento local.';
      
      Alert.alert(
        'Error',
        errorMessage,
        [
          { text: 'Reintentar', onPress: loadEventsData },
          { text: 'OK' }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: string) => {
    try {
      console.log('📅 Date selected:', date);
      setSelectedDate(date);
      router.push(`/schedule?date=${date}`);
    } catch (error: any) {
      console.error('❌ Error navigating to schedule:', error);
      Alert.alert(
        'Error',
        'Error navegando a la pantalla de agendado.',
        [{ text: 'OK' }]
      );
    }
  };

  const getUpcomingEvents = (): Event[] => {
    try {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      return events
        .filter(event => event && event.date && event.date >= todayString)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);
    } catch (error: any) {
      console.error('❌ Error getting upcoming events:', error);
      return [];
    }
  };

  const testDatabaseConnection = async () => {
    try {
      console.log('🧪 Testing local storage...');
      const result = await testDatabaseConnections();
      
      Alert.alert(
        'Prueba de Almacenamiento',
        result,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('❌ Error testing storage:', error);
      Alert.alert(
        'Error',
        `Error probando almacenamiento: ${error.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleNavigation = (path: string) => {
    try {
      router.push(path as any);
    } catch (error: any) {
      console.error('❌ Navigation error:', error);
      Alert.alert(
        'Error',
        'Error navegando a la pantalla solicitada.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderMainScreen = () => (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.title}>🎪 Abrakadabra Events</Text>
        <Text style={commonStyles.subtitle}>
          {isLoading ? 'Cargando eventos...' : 
           error ? `Error: ${error}` :
           `${events.length} eventos registrados`}
        </Text>
      </View>

      {/* Error Display */}
      {error && (
        <View style={[commonStyles.section, { backgroundColor: '#ffebee', padding: 15, borderRadius: 8 }]}>
          <Text style={{ color: '#c62828', fontSize: 14, textAlign: 'center' }}>
            ⚠️ {error}
          </Text>
          <TouchableOpacity
            style={[commonStyles.secondaryButton, { backgroundColor: '#c62828', marginTop: 10 }]}
            onPress={loadEventsData}
          >
            <Text style={[commonStyles.buttonText, { color: 'white' }]}>
              🔄 Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Action Buttons */}
      <View style={commonStyles.buttonContainer}>
        <TouchableOpacity
          style={[commonStyles.primaryButton, { backgroundColor: colors.secondary }]}
          onPress={() => setCurrentView('calendar')}
        >
          <Text style={commonStyles.buttonText}>📅 Calendario</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[commonStyles.primaryButton, { backgroundColor: colors.accent }]}
          onPress={() => handleNavigation('/events')}
        >
          <Text style={commonStyles.buttonText}>📋 Ver Eventos</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Events */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>📅 Próximos Eventos</Text>
        {isLoading ? (
          <Text style={commonStyles.emptyText}>Cargando eventos...</Text>
        ) : error ? (
          <Text style={[commonStyles.emptyText, { color: '#c62828' }]}>
            Error cargando eventos. Toca "Reintentar" arriba.
          </Text>
        ) : getUpcomingEvents().length > 0 ? (
          getUpcomingEvents().map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => handleNavigation(`/event/${event.id}`)}
            />
          ))
        ) : (
          <Text style={commonStyles.emptyText}>No hay eventos próximos</Text>
        )}
      </View>

      {/* Tools Section */}
      <View style={commonStyles.section}>
        <TouchableOpacity
          style={[commonStyles.collapsibleHeader, { backgroundColor: colors.accent }]}
          onPress={() => setShowTools(!showTools)}
        >
          <Text style={[commonStyles.buttonText, { color: 'white' }]}>
            🔧 HERRAMIENTAS {showTools ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>

        {showTools && (
          <View style={commonStyles.toolsContainer}>
            <TouchableOpacity
              style={[commonStyles.secondaryButton, { backgroundColor: colors.info }]}
              onPress={() => setShowDiagnostics(true)}
            >
              <Text style={[commonStyles.buttonText, { color: 'white' }]}>
                🔍 Diagnósticos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[commonStyles.secondaryButton, { backgroundColor: colors.success }]}
              onPress={() => handleNavigation('/packages')}
            >
              <Text style={[commonStyles.buttonText, { color: 'white' }]}>
                📦 Ver Paquetes
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Status Indicator */}
      <View style={commonStyles.statusContainer}>
        <Text style={commonStyles.statusText}>
          {isLoading ? '⏳ Cargando...' : 
           error ? '❌ Error en el sistema' :
           '✅ Sistema funcionando correctamente'}
        </Text>
        <Text style={commonStyles.statusSubtext}>
          Almacenamiento: Local | Estado: {error ? 'Error' : 'Offline Ready'}
        </Text>
      </View>

      <DiagnosticsModal
        visible={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
      />
    </ScrollView>
  );

  const renderCalendarScreen = () => (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={[commonStyles.backButton, { backgroundColor: colors.secondary }]}
          onPress={() => setCurrentView('main')}
        >
          <Text style={[commonStyles.buttonText, { color: 'white' }]}>← Volver</Text>
        </TouchableOpacity>
        <Text style={commonStyles.title}>📅 Calendario de Eventos</Text>
      </View>

      <CalendarView
        events={events}
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
      />
    </View>
  );

  return currentView === 'main' ? renderMainScreen() : renderCalendarScreen();
};

export default MainScreen;
