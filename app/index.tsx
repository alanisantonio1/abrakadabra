
import { loadEvents } from '../utils/storage';
import { runGoogleSheetsDiagnostics, testSaveToGoogleSheets } from '../utils/googleSheets';
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

  const testGoogleSheets = async () => {
    try {
      console.log('🧪 Testing Google Sheets connection...');
      const diagnostics = await runGoogleSheetsDiagnostics();
      Alert.alert('Diagnósticos Google Sheets', diagnostics);
    } catch (error) {
      console.error('❌ Error testing Google Sheets:', error);
      Alert.alert('Error', 'Error al probar Google Sheets: ' + error);
    }
  };

  const testSaveEvent = async () => {
    try {
      console.log('🧪 Testing save event to Google Sheets...');
      const result = await testSaveToGoogleSheets();
      Alert.alert(
        'Prueba de Guardado',
        result ? '✅ Evento de prueba guardado exitosamente' : '❌ Error al guardar evento de prueba'
      );
    } catch (error) {
      console.error('❌ Error testing save:', error);
      Alert.alert('Error', 'Error al probar guardado: ' + error);
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

          {/* Debug buttons - temporary */}
          <View style={{ width: '100%', marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#eee' }}>
            <Text style={{ textAlign: 'center', fontSize: 12, color: '#666', marginBottom: 10 }}>
              Herramientas de Diagnóstico
            </Text>
            <TouchableOpacity
              style={[
                commonStyles.primaryButton, 
                { 
                  width: '100%',
                  marginBottom: 8,
                  backgroundColor: '#666',
                  paddingVertical: 8
                }
              ]}
              onPress={testGoogleSheets}
            >
              <Text style={[commonStyles.buttonText, { fontSize: 12 }]}>Probar Conexión Google Sheets</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                commonStyles.primaryButton, 
                { 
                  width: '100%',
                  marginBottom: 8,
                  backgroundColor: '#888',
                  paddingVertical: 8
                }
              ]}
              onPress={testSaveEvent}
            >
              <Text style={[commonStyles.buttonText, { fontSize: 12 }]}>Probar Guardar Evento</Text>
            </TouchableOpacity>
          </View>
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
            Próximos Eventos ({events.length} total)
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
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 10 }]}>
                No hay eventos próximos
              </Text>
              <Text style={[commonStyles.text, { textAlign: 'center', fontSize: 14, color: '#666' }]}>
                Los eventos se cargan automáticamente desde Google Sheets
              </Text>
            </View>
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
