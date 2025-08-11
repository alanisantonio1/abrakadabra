
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import CalendarView from '../components/CalendarView';
import { loadEvents, testDatabaseConnections } from '../utils/storage';
import EventCard from '../components/EventCard';
import { router, useFocusEffect } from 'expo-router';
import DiagnosticsModal from '../components/DiagnosticsModal';
import MigrationAlert from '../components/MigrationAlert';
import { Event } from '../types';
import { commonStyles, colors } from '../styles/commonStyles';

const MainScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentView, setCurrentView] = useState<'main' | 'calendar'>('main');
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [showTools, setShowTools] = useState<boolean>(false);
  const [showMigrationAlert, setShowMigrationAlert] = useState<boolean>(true);

  // Load events when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadEventsData();
    }, [])
  );

  useEffect(() => {
    loadEventsData();
  }, []);

  const loadEventsData = useCallback(async () => {
    try {
      console.log('📥 Loading events data...');
      const loadedEvents = await loadEvents();
      setEvents(loadedEvents);
      console.log('✅ Events loaded:', loadedEvents.length);
    } catch (error: any) {
      console.error('❌ Error loading events:', error);
      Alert.alert(
        'Error de Carga',
        `No se pudieron cargar los eventos: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  }, []);

  const handleDateSelect = (date: string) => {
    console.log('📅 Date selected:', date);
    setSelectedDate(date);
    router.push({
      pathname: '/schedule',
      params: { date }
    });
  };

  const getUpcomingEvents = (): Event[] => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    return events
      .filter(event => event.date >= todayString)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  const testDatabaseConnection = async () => {
    try {
      console.log('🧪 Testing database connection...');
      const result = await testDatabaseConnections();
      Alert.alert('Prueba de Conexión', result, [{ text: 'OK' }]);
    } catch (error: any) {
      console.error('❌ Database test error:', error);
      Alert.alert('Error', `Error en prueba: ${error.message}`, [{ text: 'OK' }]);
    }
  };

  const handleNavigation = (path: string) => {
    console.log('🧭 Navigating to:', path);
    router.push(path as any);
  };

  const renderToolsModal = () => {
    if (!showTools) return null;

    return (
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}>
        <View style={{
          backgroundColor: colors.white,
          borderRadius: 20,
          padding: 20,
          width: '80%',
          maxWidth: 300,
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.primary,
            textAlign: 'center',
            marginBottom: 20,
          }}>
            🛠️ Herramientas
          </Text>
          
          <TouchableOpacity
            style={[commonStyles.button, { marginBottom: 10 }]}
            onPress={() => {
              setShowTools(false);
              setShowDiagnostics(true);
            }}
          >
            <Text style={commonStyles.buttonText}>🔍 Diagnósticos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[commonStyles.button, { backgroundColor: colors.secondary, marginBottom: 10 }]}
            onPress={() => {
              setShowTools(false);
              testDatabaseConnection();
            }}
          >
            <Text style={commonStyles.buttonText}>🧪 Probar Conexión</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[commonStyles.button, { backgroundColor: colors.gray }]}
            onPress={() => setShowTools(false)}
          >
            <Text style={[commonStyles.buttonText, { color: colors.text }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderMainScreen = () => (
    <ScrollView style={commonStyles.container}>
      {/* Migration Alert */}
      {showMigrationAlert && (
        <MigrationAlert onDismiss={() => setShowMigrationAlert(false)} />
      )}
      
      <Text style={commonStyles.title}>🎪 Abrakadabra Events</Text>
      
      {/* Quick Stats */}
      <View style={{
        backgroundColor: colors.white,
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        ...commonStyles.shadow,
      }}>
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: colors.primary,
          marginBottom: 10,
        }}>
          📊 Resumen
        </Text>
        <Text style={{ color: colors.text, marginBottom: 5 }}>
          Total de eventos: {events.length}
        </Text>
        <Text style={{ color: colors.text, marginBottom: 5 }}>
          Próximos eventos: {getUpcomingEvents().length}
        </Text>
        <Text style={{ color: colors.text }}>
          Eventos pagados: {events.filter(e => e.isPaid).length}
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={{
        backgroundColor: colors.white,
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        ...commonStyles.shadow,
      }}>
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: colors.primary,
          marginBottom: 15,
        }}>
          🚀 Acciones Rápidas
        </Text>
        
        <TouchableOpacity
          style={[commonStyles.button, { marginBottom: 10 }]}
          onPress={() => setCurrentView('calendar')}
        >
          <Text style={commonStyles.buttonText}>📅 Seleccionar Fechas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[commonStyles.button, { marginBottom: 10 }]}
          onPress={() => handleNavigation('/events')}
        >
          <Text style={commonStyles.buttonText}>👁️ Ver Eventos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[commonStyles.button, { marginBottom: 10 }]}
          onPress={() => handleNavigation('/packages')}
        >
          <Text style={commonStyles.buttonText}>📦 Paquetes</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Events */}
      {getUpcomingEvents().length > 0 && (
        <View style={{
          backgroundColor: colors.white,
          borderRadius: 15,
          padding: 20,
          marginBottom: 20,
          ...commonStyles.shadow,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.primary,
            marginBottom: 15,
          }}>
            📅 Próximos Eventos
          </Text>
          
          {getUpcomingEvents().map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => router.push(`/event/${event.id}`)}
            />
          ))}
        </View>
      )}

      {/* Tools Button */}
      <TouchableOpacity
        style={[
          commonStyles.button,
          { 
            backgroundColor: colors.secondary,
            marginBottom: 30,
          }
        ]}
        onPress={() => setShowTools(true)}
      >
        <Text style={commonStyles.buttonText}>🛠️ Herramientas</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCalendarScreen = () => (
    <View style={commonStyles.container}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
      }}>
        <TouchableOpacity
          style={[commonStyles.button, { backgroundColor: colors.gray, flex: 0.3 }]}
          onPress={() => setCurrentView('main')}
        >
          <Text style={[commonStyles.buttonText, { color: colors.text }]}>← Volver</Text>
        </TouchableOpacity>
        
        <Text style={[commonStyles.title, { flex: 0.4, textAlign: 'center' }]}>
          📅 Calendario
        </Text>
        
        <View style={{ flex: 0.3 }} />
      </View>

      <CalendarView
        events={events}
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
      />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {currentView === 'main' ? renderMainScreen() : renderCalendarScreen()}
      
      {/* Tools Modal */}
      {renderToolsModal()}
      
      {/* Diagnostics Modal */}
      <DiagnosticsModal
        visible={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
      />
    </View>
  );
};

export default MainScreen;
