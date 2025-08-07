
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { loadEvents, testDatabaseConnections } from '../utils/storage';
import { Event } from '../types';
import DiagnosticsModal from '../components/DiagnosticsModal';
import EventCard from '../components/EventCard';
import CalendarView from '../components/CalendarView';

const MainScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentView, setCurrentView] = useState<'main' | 'calendar'>('main');

  // Load events when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('📱 MainScreen focused, loading events...');
      loadEventsData();
    }, [])
  );

  useEffect(() => {
    console.log('📱 MainScreen mounted');
    loadEventsData();
  }, []);

  const loadEventsData = async () => {
    try {
      setIsLoading(true);
      console.log('📥 Loading events data...');
      const loadedEvents = await loadEvents();
      setEvents(loadedEvents);
      console.log('✅ Events loaded successfully:', loadedEvents.length);
    } catch (error: any) {
      console.error('❌ Error loading events:', error);
      Alert.alert(
        'Error',
        `No se pudieron cargar los eventos: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: string) => {
    console.log('📅 Date selected:', date);
    setSelectedDate(date);
    setCurrentView('main');
    
    // Navigate to schedule screen with the selected date
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
      .sort((a, b) => {
        const dateComparison = a.date.localeCompare(b.date);
        if (dateComparison === 0) {
          return a.time.localeCompare(b.time);
        }
        return dateComparison;
      })
      .slice(0, 5); // Show only next 5 events
  };

  const testDatabaseConnection = async () => {
    try {
      console.log('🧪 Testing database connection...');
      const result = await testDatabaseConnections();
      Alert.alert(
        'Prueba de Conexión',
        result,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('❌ Error testing connection:', error);
      Alert.alert(
        'Error de Conexión',
        `Error probando conexión: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleNavigation = (path: string) => {
    console.log('🧭 Navigating to:', path);
    router.push(path as any);
  };

  const renderMainScreen = () => (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.title}>🎪 Abrakadabra</Text>
        <Text style={commonStyles.subtitle}>Gestión de Eventos Infantiles</Text>
      </View>

      {/* Quick Actions - Removed AGENDAR button */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Acciones Rápidas</Text>
        <View style={commonStyles.buttonGrid}>
          <TouchableOpacity
            style={[commonStyles.gridButton, { backgroundColor: colors.accent }]}
            onPress={() => setCurrentView('calendar')}
          >
            <Text style={commonStyles.gridButtonText}>🗓️ Seleccionar Fecha</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[commonStyles.gridButton, { backgroundColor: colors.secondary }]}
            onPress={() => handleNavigation('/events')}
          >
            <Text style={commonStyles.gridButtonText}>📋 Ver Eventos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[commonStyles.gridButton, { backgroundColor: colors.warning }]}
            onPress={() => handleNavigation('/packages')}
          >
            <Text style={commonStyles.gridButtonText}>📦 Paquetes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[commonStyles.gridButton, { backgroundColor: colors.info }]}
            onPress={() => setShowDiagnostics(true)}
          >
            <Text style={commonStyles.gridButtonText}>🔍 Diagnósticos</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming Events */}
      <View style={commonStyles.section}>
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>Próximos Eventos</Text>
          <TouchableOpacity
            style={commonStyles.seeAllButton}
            onPress={() => handleNavigation('/events')}
          >
            <Text style={commonStyles.seeAllText}>Ver todos →</Text>
          </TouchableOpacity>
        </View>
        
        {isLoading ? (
          <View style={commonStyles.loadingContainer}>
            <Text style={commonStyles.loadingText}>🔄 Cargando eventos...</Text>
          </View>
        ) : getUpcomingEvents().length > 0 ? (
          getUpcomingEvents().map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => router.push(`/event/${event.id}`)}
              onMarkAsPaid={() => loadEventsData()}
            />
          ))
        ) : (
          <View style={commonStyles.emptyContainer}>
            <Text style={commonStyles.emptyText}>📅 No hay eventos próximos</Text>
            <Text style={commonStyles.emptySubtext}>
              Selecciona una fecha para agendar tu primer evento
            </Text>
          </View>
        )}
      </View>

      {/* Statistics */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Resumen</Text>
        <View style={commonStyles.statsContainer}>
          <View style={[commonStyles.statItem, { backgroundColor: colors.primary }]}>
            <Text style={commonStyles.statNumber}>{events.length}</Text>
            <Text style={commonStyles.statLabel}>Total Eventos</Text>
          </View>
          <View style={[commonStyles.statItem, { backgroundColor: colors.warning }]}>
            <Text style={commonStyles.statNumber}>
              {events.filter(e => !e.isPaid).length}
            </Text>
            <Text style={commonStyles.statLabel}>Pendientes</Text>
          </View>
          <View style={[commonStyles.statItem, { backgroundColor: colors.success }]}>
            <Text style={commonStyles.statNumber}>
              {events.filter(e => e.isPaid).length}
            </Text>
            <Text style={commonStyles.statLabel}>Pagados</Text>
          </View>
        </View>
      </View>

      {/* Quick Tools */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Herramientas</Text>
        <View style={commonStyles.toolsGrid}>
          <TouchableOpacity
            style={[commonStyles.toolButton, { backgroundColor: colors.success }]}
            onPress={testDatabaseConnection}
          >
            <Text style={commonStyles.toolIcon}>🧪</Text>
            <Text style={commonStyles.toolText}>Probar Conexión</Text>
          </TouchableOpacity>
        </View>
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
          style={commonStyles.backButton}
          onPress={() => setCurrentView('main')}
        >
          <Text style={commonStyles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={commonStyles.title}>🗓️ Seleccionar Fecha</Text>
        <Text style={commonStyles.subtitle}>Toca una fecha para agendar un evento</Text>
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
