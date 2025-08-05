
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import CalendarView from '../components/CalendarView';
import EventCard from '../components/EventCard';
import { Event } from '../types';
import { loadEvents } from '../utils/storage';
import { runGoogleSheetsDiagnostics, testSaveToGoogleSheets } from '../utils/googleSheets';
import { commonStyles, colors } from '../styles/commonStyles';

export default function MainScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentView, setCurrentView] = useState<'main' | 'calendar'>('main');

  useEffect(() => {
    loadEventsData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEventsData();
    }, [])
  );

  const loadEventsData = async () => {
    try {
      console.log('🔄 Loading events data...');
      const loadedEvents = await loadEvents();
      setEvents(loadedEvents);
      console.log('✅ Events loaded:', loadedEvents.length);
    } catch (error) {
      console.error('❌ Error loading events:', error);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    router.push(`/schedule?date=${date}`);
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  };

  const testGoogleSheets = async () => {
    try {
      console.log('🧪 Running Google Sheets diagnostics...');
      const diagnostics = await runGoogleSheetsDiagnostics();
      
      Alert.alert(
        'Diagnósticos Google Sheets',
        diagnostics,
        [
          { text: 'OK' }
        ],
        { 
          cancelable: true
        }
      );
    } catch (error) {
      console.error('❌ Error running diagnostics:', error);
      Alert.alert(
        'Error',
        'Error al ejecutar diagnósticos: ' + error,
        [{ text: 'OK' }]
      );
    }
  };

  const testSaveEvent = async () => {
    try {
      console.log('🧪 Testing save event...');
      const result = await testSaveToGoogleSheets();
      
      let message = '';
      let title = '';
      
      if (result.success) {
        title = '✅ Prueba Exitosa';
        message = 'El evento de prueba se guardó correctamente en Google Sheets.\n\n' +
                 '⚠️ IMPORTANTE: Elimina la fila de prueba de tu hoja de cálculo.';
      } else {
        title = '❌ Prueba Fallida';
        message = `No se pudo guardar en Google Sheets:\n\n${result.error}\n\n` +
                 'Los eventos se guardarán solo localmente hasta que se resuelva el problema.';
        
        if (result.error?.includes('permisos de escritura')) {
          message += '\n\n💡 SOLUCIÓN:\n' +
                    'Para escribir a Google Sheets necesitas:\n' +
                    '1. Configurar OAuth 2.0, o\n' +
                    '2. Usar una cuenta de servicio\n\n' +
                    'Mientras tanto, puedes leer eventos desde la hoja pero no escribir nuevos.';
        }
      }
      
      Alert.alert(title, message, [{ text: 'OK' }]);
    } catch (error) {
      console.error('❌ Error testing save:', error);
      Alert.alert(
        'Error',
        'Error al probar guardado: ' + error,
        [{ text: 'OK' }]
      );
    }
  };

  const renderMainScreen = () => (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.title}>🎪 Abrakadabra</Text>
        <Text style={commonStyles.subtitle}>Gestión de Eventos</Text>
      </View>

      <View style={commonStyles.section}>
        <View style={commonStyles.buttonGrid}>
          <TouchableOpacity
            style={[commonStyles.gridButton, { backgroundColor: colors.primary }]}
            onPress={() => setCurrentView('calendar')}
          >
            <Text style={commonStyles.gridButtonText}>📅</Text>
            <Text style={commonStyles.gridButtonLabel}>Calendario</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.gridButton, { backgroundColor: colors.secondary }]}
            onPress={() => router.push('/events')}
          >
            <Text style={commonStyles.gridButtonText}>📋</Text>
            <Text style={commonStyles.gridButtonLabel}>Ver Eventos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.gridButton, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/packages')}
          >
            <Text style={commonStyles.gridButtonText}>🎁</Text>
            <Text style={commonStyles.gridButtonLabel}>Paquetes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.gridButton, { backgroundColor: '#FF6B6B' }]}
            onPress={testGoogleSheets}
          >
            <Text style={commonStyles.gridButtonText}>🔧</Text>
            <Text style={commonStyles.gridButtonLabel}>Probar Conexión</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Test Save Button - Only show if there are connection issues */}
      <View style={commonStyles.section}>
        <TouchableOpacity
          style={[commonStyles.button, { backgroundColor: '#FFA500', marginBottom: 10 }]}
          onPress={testSaveEvent}
        >
          <Text style={[commonStyles.buttonText, { color: 'white' }]}>
            🧪 Probar Guardado en Google Sheets
          </Text>
        </TouchableOpacity>
      </View>

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
          <View style={commonStyles.emptyState}>
            <Text style={commonStyles.emptyStateText}>
              No hay eventos próximos
            </Text>
            <Text style={commonStyles.emptyStateSubtext}>
              Usa el calendario para agendar un nuevo evento
            </Text>
          </View>
        )}
      </View>

      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Estadísticas</Text>
        <View style={commonStyles.statsContainer}>
          <View style={commonStyles.statItem}>
            <Text style={commonStyles.statNumber}>{events.length}</Text>
            <Text style={commonStyles.statLabel}>Total Eventos</Text>
          </View>
          <View style={commonStyles.statItem}>
            <Text style={commonStyles.statNumber}>
              {events.filter(e => e.isPaid).length}
            </Text>
            <Text style={commonStyles.statLabel}>Pagados</Text>
          </View>
          <View style={commonStyles.statItem}>
            <Text style={commonStyles.statNumber}>
              {events.filter(e => !e.isPaid).length}
            </Text>
            <Text style={commonStyles.statLabel}>Pendientes</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderCalendarScreen = () => (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={[commonStyles.backButton, { backgroundColor: colors.secondary }]}
          onPress={() => setCurrentView('main')}
        >
          <Text style={[commonStyles.backButtonText, { color: 'white' }]}>← Volver</Text>
        </TouchableOpacity>
        <Text style={commonStyles.title}>Calendario</Text>
        <Text style={commonStyles.subtitle}>Selecciona una fecha para agendar</Text>
      </View>

      <CalendarView
        events={events}
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
      />
    </View>
  );

  return currentView === 'main' ? renderMainScreen() : renderCalendarScreen();
}
