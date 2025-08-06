
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Event } from '../types';
import { commonStyles, colors } from '../styles/commonStyles';
import CalendarView from '../components/CalendarView';
import EventCard from '../components/EventCard';
import DiagnosticsModal from '../components/DiagnosticsModal';
import { loadEvents } from '../utils/storage';
import { testDatabaseConnections } from '../utils/storage';

const MainScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentView, setCurrentView] = useState<'main' | 'calendar'>('main');
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Load events when screen comes into focus
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
      console.log('📥 Loading events data...');
      const loadedEvents = await loadEvents();
      setEvents(loadedEvents);
      console.log('✅ Events loaded:', loadedEvents.length);
    } catch (error) {
      console.error('❌ Error loading events:', error);
      Alert.alert('Error', 'No se pudieron cargar los eventos');
    }
  };

  const handleDateSelect = (date: string) => {
    console.log('📅 Date selected in calendar:', date);
    setSelectedDate(date);
    
    // Check if the date has events
    const dateEvents = events.filter(event => event.date === date);
    
    if (dateEvents.length > 0) {
      // If date has events, show them in the calendar view
      console.log('📋 Date has events, staying in calendar view');
      // Don't navigate away, just update selected date to show events
    } else {
      // If date is available, navigate to schedule with pre-selected date
      console.log('➕ Date is available, navigating to schedule');
      router.push({
        pathname: '/schedule',
        params: { date: date }
      });
    }
  };

  const getUpcomingEvents = (): Event[] => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    return events
      .filter(event => event.date >= todayString)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  const testGoogleSheets = async () => {
    try {
      console.log('🧪 Testing Google Sheets connection...');
      const result = await testDatabaseConnections();
      
      Alert.alert(
        '🔍 Diagnósticos de Conexión',
        result,
        [
          { text: 'Ver detalles', onPress: () => setShowDiagnostics(true) },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('❌ Error testing connections:', error);
      Alert.alert('Error', `Error en diagnósticos: ${error}`);
    }
  };

  const renderMainScreen = () => (
    <ScrollView style={commonStyles.container}>
      {/* Header */}
      <View style={commonStyles.header}>
        <Text style={commonStyles.title}>🎪 Abrakadabra</Text>
        <Text style={commonStyles.subtitle}>Gestión de Eventos</Text>
      </View>

      {/* Quick Actions */}
      <View style={commonStyles.section}>
        <View style={commonStyles.buttonRow}>
          <TouchableOpacity
            style={[commonStyles.button, { backgroundColor: colors.primary, flex: 1 }]}
            onPress={() => router.push('/schedule')}
          >
            <Text style={commonStyles.buttonText}>➕ Nuevo Evento</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[commonStyles.button, { backgroundColor: colors.secondary, flex: 1 }]}
            onPress={() => setCurrentView('calendar')}
          >
            <Text style={commonStyles.buttonText}>📅 Calendario</Text>
          </TouchableOpacity>
        </View>

        <View style={commonStyles.buttonRow}>
          <TouchableOpacity
            style={[commonStyles.button, { backgroundColor: colors.accent, flex: 1 }]}
            onPress={() => router.push('/events')}
          >
            <Text style={commonStyles.buttonText}>📋 Ver Eventos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[commonStyles.button, { backgroundColor: colors.warning, flex: 1 }]}
            onPress={() => setShowDiagnostics(true)}
          >
            <Text style={commonStyles.buttonText}>🔍 Diagnósticos</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[commonStyles.button, { backgroundColor: colors.info }]}
          onPress={() => router.push('/packages')}
        >
          <Text style={commonStyles.buttonText}>📦 Ver Paquetes</Text>
        </TouchableOpacity>
      </View>

      {/* Google Sheets Status */}
      <View style={commonStyles.section}>
        <View style={[commonStyles.card, { backgroundColor: colors.surface }]}>
          <Text style={[commonStyles.cardTitle, { color: colors.text }]}>
            📊 Estado de Google Sheets
          </Text>
          <Text style={[commonStyles.cardText, { color: colors.textSecondary }]}>
            Toca "Diagnósticos" para verificar la conexión y permisos de escritura
          </Text>
          
          <TouchableOpacity
            style={[commonStyles.button, { backgroundColor: colors.primary, marginTop: 12 }]}
            onPress={testGoogleSheets}
          >
            <Text style={commonStyles.buttonText}>🧪 Probar Conexión</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming Events */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>📅 Próximos Eventos</Text>
        
        {getUpcomingEvents().length > 0 ? (
          getUpcomingEvents().map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => router.push(`/event/${event.id}`)}
              onMarkAsPaid={() => {
                // Handle mark as paid
                console.log('Mark as paid:', event.id);
              }}
            />
          ))
        ) : (
          <View style={commonStyles.card}>
            <Text style={commonStyles.cardText}>
              No hay eventos próximos programados
            </Text>
            <Text style={[commonStyles.cardText, { fontSize: 14, marginTop: 8, color: colors.textSecondary }]}>
              Usa el calendario para seleccionar una fecha disponible y agendar un evento
            </Text>
          </View>
        )}
      </View>

      {/* Statistics */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>📊 Estadísticas</Text>
        <View style={commonStyles.card}>
          <Text style={commonStyles.cardText}>
            Total de eventos: {events.length}
          </Text>
          <Text style={commonStyles.cardText}>
            Eventos pagados: {events.filter(e => e.isPaid).length}
          </Text>
          <Text style={commonStyles.cardText}>
            Eventos pendientes: {events.filter(e => !e.isPaid).length}
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderCalendarScreen = () => (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity
          onPress={() => setCurrentView('main')}
          style={[commonStyles.button, { backgroundColor: colors.secondary }]}
        >
          <Text style={commonStyles.buttonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={commonStyles.title}>📅 Calendario</Text>
      </View>

      <View style={[commonStyles.card, { margin: 16, padding: 16, backgroundColor: colors.info + '20' }]}>
        <Text style={[commonStyles.cardText, { color: colors.text, textAlign: 'center', fontWeight: '600' }]}>
          💡 Toca una fecha verde para agendar un evento
        </Text>
        <Text style={[commonStyles.cardText, { color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 4 }]}>
          Las fechas rojas muestran eventos existentes
        </Text>
      </View>

      <CalendarView
        events={events}
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
      />

      {selectedDate && (
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>
            Eventos para {new Date(selectedDate).toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          {events
            .filter(event => event.date === selectedDate)
            .map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => router.push(`/event/${event.id}`)}
              />
            ))}
          
          {events.filter(event => event.date === selectedDate).length === 0 && (
            <View style={commonStyles.card}>
              <Text style={[commonStyles.cardText, { textAlign: 'center', color: colors.success, fontWeight: '600' }]}>
                ✅ Fecha disponible para agendar
              </Text>
              <TouchableOpacity
                style={[commonStyles.button, { backgroundColor: colors.primary, marginTop: 12 }]}
                onPress={() => router.push({
                  pathname: '/schedule',
                  params: { date: selectedDate }
                })}
              >
                <Text style={commonStyles.buttonText}>➕ Agendar Evento</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <>
      {currentView === 'main' ? renderMainScreen() : renderCalendarScreen()}
      
      <DiagnosticsModal
        visible={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
      />
    </>
  );
};

export default MainScreen;
