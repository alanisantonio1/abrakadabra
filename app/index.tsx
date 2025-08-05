
import { loadEvents, runGoogleSheetsDiagnostics, importEventsFromGoogleSheets, addSampleEvents } from '../utils/storage';
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
      console.log('🔍 Starting Google Sheets diagnostics...');
      const result = await runGoogleSheetsDiagnostics();
      
      Alert.alert(
        'Diagnósticos de Google Sheets',
        result,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Diagnostics error:', error);
      Alert.alert('Error', 'Error ejecutando diagnósticos');
    }
  };

  const importFromGoogleSheets = async () => {
    try {
      Alert.alert(
        'Importar desde Google Sheets',
        'Importando eventos desde Google Sheets...',
        [{ text: 'OK' }]
      );
      
      console.log('📥 Starting import from Google Sheets...');
      const success = await importEventsFromGoogleSheets();
      
      if (success) {
        Alert.alert(
          'Importación Exitosa',
          'Los eventos han sido importados desde Google Sheets.',
          [{ text: 'OK' }]
        );
        loadEventsData(); // Refresh events
      } else {
        Alert.alert(
          'Error de Importación',
          'No se pudieron importar los eventos desde Google Sheets.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Import error:', error);
      Alert.alert('Error', 'Error importando desde Google Sheets');
    }
  };

  const addTestEvents = async () => {
    try {
      Alert.alert(
        'Agregar Eventos de Prueba',
        'Agregando eventos de prueba para verificar la funcionalidad...',
        [{ text: 'OK' }]
      );
      
      console.log('🧪 Adding sample events...');
      const success = await addSampleEvents();
      
      if (success) {
        Alert.alert(
          'Eventos Agregados',
          'Se han agregado eventos de prueba exitosamente.',
          [{ text: 'OK' }]
        );
        loadEventsData(); // Refresh events
      } else {
        Alert.alert(
          'Error',
          'No se pudieron agregar los eventos de prueba.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Add sample events error:', error);
      Alert.alert('Error', 'Error agregando eventos de prueba');
    }
  };

  const renderMainScreen = () => (
    <ScrollView style={commonStyles.container}>
      {/* Centered Header */}
      <View style={{ 
        alignItems: 'center', 
        justifyContent: 'center', 
        paddingVertical: 40,
        paddingHorizontal: 20
      }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: 40
        }}>
          <Text style={[
            commonStyles.title, 
            { 
              fontSize: 32, 
              fontWeight: 'bold', 
              color: colors.primary,
              textAlign: 'center'
            }
          ]}>
            Abrakadabra
          </Text>
          <Text style={{ fontSize: 24, marginLeft: 8 }}>✨</Text>
        </View>

        {/* Centered Buttons */}
        <View style={{ width: '100%', maxWidth: 300, alignItems: 'center' }}>
          <TouchableOpacity
            style={[
              commonStyles.primaryButton, 
              { 
                width: '100%',
                marginBottom: 16,
                backgroundColor: colors.primary
              }
            ]}
            onPress={() => setCurrentView('calendar')}
          >
            <Text style={commonStyles.buttonText}>Ver Disponibilidad</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              commonStyles.primaryButton, 
              { 
                width: '100%',
                marginBottom: 16,
                backgroundColor: colors.secondary
              }
            ]}
            onPress={() => router.push('/events')}
          >
            <Text style={commonStyles.buttonText}>Ver Eventos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              commonStyles.primaryButton, 
              { 
                width: '100%',
                marginBottom: 16,
                backgroundColor: colors.accent
              }
            ]}
            onPress={() => router.push('/packages')}
          >
            <Text style={commonStyles.buttonText}>Ver Paquetes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              commonStyles.primaryButton, 
              { 
                width: '100%',
                marginBottom: 16,
                backgroundColor: '#4CAF50'
              }
            ]}
            onPress={importFromGoogleSheets}
          >
            <Text style={commonStyles.buttonText}>📥 Importar desde Google Sheets</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              commonStyles.primaryButton, 
              { 
                width: '100%',
                marginBottom: 16,
                backgroundColor: '#FF9800'
              }
            ]}
            onPress={addTestEvents}
          >
            <Text style={commonStyles.buttonText}>🧪 Agregar Eventos de Prueba</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              commonStyles.primaryButton, 
              { 
                width: '100%',
                marginBottom: 16,
                backgroundColor: '#FF6B6B'
              }
            ]}
            onPress={runDiagnostics}
          >
            <Text style={commonStyles.buttonText}>🔍 Diagnósticos Google Sheets</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming Events Section */}
      {loading ? (
        <View style={[commonStyles.section, { paddingHorizontal: 20 }]}>
          <Text style={[commonStyles.text, { textAlign: 'center' }]}>Cargando eventos...</Text>
        </View>
      ) : (
        <View style={[commonStyles.section, { paddingHorizontal: 20 }]}>
          <Text style={[commonStyles.sectionTitle, { textAlign: 'center', marginBottom: 20 }]}>
            Próximos Eventos
          </Text>
          {getUpcomingEvents().length > 0 ? (
            getUpcomingEvents().map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => router.push(`/event/${event.id}`)}
              />
            ))
          ) : (
            <Text style={[commonStyles.text, { textAlign: 'center' }]}>
              No hay eventos próximos
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );

  const renderCalendarScreen = () => (
    <View style={commonStyles.container}>
      <View style={[commonStyles.header, { flexDirection: 'column', alignItems: 'center' }]}>
        <TouchableOpacity
          style={[
            commonStyles.backButton, 
            { 
              marginBottom: 15,
              backgroundColor: colors.secondary,
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 8
            }
          ]}
          onPress={() => setCurrentView('main')}
        >
          <Text style={[commonStyles.backButtonText, { color: 'white' }]}>← Volver al Menú</Text>
        </TouchableOpacity>
        <Text style={[commonStyles.title, { textAlign: 'center' }]}>
          Calendario de Disponibilidad
        </Text>
        <Text style={[commonStyles.subtitle, { textAlign: 'center' }]}>
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
