
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { loadEvents, testDatabaseConnections } from '../utils/storage';
import CalendarView from '../components/CalendarView';
import EventCard from '../components/EventCard';
import DiagnosticsModal from '../components/DiagnosticsModal';
import { Event } from '../types';

const MainScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentView, setCurrentView] = useState<'main' | 'calendar'>('main');
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [showToolsModal, setShowToolsModal] = useState<boolean>(false);

  // Load events when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 MainScreen focused, loading events...');
      loadEventsData();
    }, [])
  );

  useEffect(() => {
    console.log('🚀 MainScreen mounted, loading initial data...');
    loadEventsData();
  }, []);

  const loadEventsData = async () => {
    try {
      console.log('📥 Loading events data...');
      const eventsData = await loadEvents();
      setEvents(eventsData);
      console.log('✅ Events loaded:', eventsData.length);
    } catch (error: any) {
      console.error('❌ Error loading events:', error);
      Alert.alert(
        'Error',
        `No se pudieron cargar los eventos: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleDateSelect = (date: string) => {
    console.log('📅 Date selected:', date);
    setSelectedDate(date);
    
    // Show confirmation alert for saving the date
    Alert.alert(
      '📅 Fecha Seleccionada',
      `Has seleccionado: ${new Date(date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => {
            setSelectedDate('');
            console.log('❌ Date selection cancelled');
          }
        },
        {
          text: 'Agendar Evento',
          onPress: () => {
            console.log('✅ Navigating to schedule with date:', date);
            router.push(`/schedule?date=${date}`);
          }
        }
      ]
    );
  };

  const getUpcomingEvents = (): Event[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  const testDatabaseConnection = async () => {
    try {
      console.log('🧪 Testing database connections...');
      const report = await testDatabaseConnections();
      Alert.alert(
        '🔍 Diagnóstico de Conexiones',
        report,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('❌ Error testing connections:', error);
      Alert.alert(
        'Error',
        `Error en diagnóstico: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleNavigation = (path: string) => {
    console.log('🧭 Navigating to:', path);
    router.push(path);
  };

  const renderToolsModal = () => {
    if (!showToolsModal) return null;

    return (
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        zIndex: 1000
      }}>
        <View style={{
          backgroundColor: colors.white,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 20,
          paddingBottom: 40
        }}>
          <Text style={[
            commonStyles.sectionTitle,
            { textAlign: 'center', marginBottom: 20, color: colors.text }
          ]}>
            🛠️ Herramientas
          </Text>
          
          <TouchableOpacity
            style={[
              commonStyles.toolButton,
              {
                backgroundColor: colors.primary,
                padding: 15,
                borderRadius: 10,
                marginBottom: 10,
                alignItems: 'center'
              }
            ]}
            onPress={() => {
              setShowToolsModal(false);
              setShowDiagnostics(true);
            }}
          >
            <Text style={[commonStyles.toolButtonText, { color: colors.white, fontSize: 16 }]}>
              🔍 Diagnóstico del Sistema
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              commonStyles.toolButton,
              {
                backgroundColor: colors.secondary,
                padding: 15,
                borderRadius: 10,
                marginBottom: 20,
                alignItems: 'center'
              }
            ]}
            onPress={() => {
              setShowToolsModal(false);
              testDatabaseConnection();
            }}
          >
            <Text style={[commonStyles.toolButtonText, { color: colors.white, fontSize: 16 }]}>
              🧪 Probar Conexiones
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              commonStyles.closeButton,
              {
                backgroundColor: colors.lightGray,
                padding: 15,
                borderRadius: 10,
                alignItems: 'center'
              }
            ]}
            onPress={() => setShowToolsModal(false)}
          >
            <Text style={[commonStyles.closeButtonText, { color: colors.text, fontSize: 16 }]}>
              ❌ Cerrar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderMainScreen = () => (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.title}>🎪 Abrakadabra Events</Text>
        <Text style={commonStyles.subtitle}>Gestión de Eventos Infantiles</Text>
      </View>

      {/* Quick Stats */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>📊 Resumen</Text>
        <View style={[
          commonStyles.statsContainer,
          {
            flexDirection: 'row',
            justifyContent: 'space-around',
            backgroundColor: colors.cardBackground,
            padding: 15,
            borderRadius: 10,
            marginBottom: 10
          }
        ]}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[commonStyles.statNumber, { fontSize: 24, fontWeight: 'bold', color: colors.primary }]}>
              {events.length}
            </Text>
            <Text style={[commonStyles.statLabel, { color: colors.text, fontSize: 12 }]}>
              Total Eventos
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[commonStyles.statNumber, { fontSize: 24, fontWeight: 'bold', color: colors.success }]}>
              {events.filter(e => e.isPaid).length}
            </Text>
            <Text style={[commonStyles.statLabel, { color: colors.text, fontSize: 12 }]}>
              Pagados
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[commonStyles.statNumber, { fontSize: 24, fontWeight: 'bold', color: colors.warning }]}>
              {events.filter(e => !e.isPaid).length}
            </Text>
            <Text style={[commonStyles.statLabel, { color: colors.text, fontSize: 12 }]}>
              Pendientes
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>⚡ Acciones Rápidas</Text>
        <View style={[
          commonStyles.quickActions,
          {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10
          }
        ]}>
          <TouchableOpacity
            style={[
              commonStyles.quickActionButton,
              {
                flex: 1,
                backgroundColor: colors.primary,
                padding: 15,
                borderRadius: 10,
                alignItems: 'center',
                marginRight: 5
              }
            ]}
            onPress={() => setCurrentView('calendar')}
          >
            <Text style={[commonStyles.quickActionText, { color: colors.white, fontSize: 14, fontWeight: 'bold' }]}>
              📅 Seleccionar Fecha
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              commonStyles.quickActionButton,
              {
                flex: 1,
                backgroundColor: colors.secondary,
                padding: 15,
                borderRadius: 10,
                alignItems: 'center',
                marginLeft: 5
              }
            ]}
            onPress={() => handleNavigation('/events')}
          >
            <Text style={[commonStyles.quickActionText, { color: colors.white, fontSize: 14, fontWeight: 'bold' }]}>
              📋 Ver Eventos
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[
            commonStyles.quickActionButton,
            {
              backgroundColor: colors.accent,
              padding: 15,
              borderRadius: 10,
              alignItems: 'center'
            }
          ]}
          onPress={() => handleNavigation('/packages')}
        >
          <Text style={[commonStyles.quickActionText, { color: colors.white, fontSize: 14, fontWeight: 'bold' }]}>
            📦 Ver Paquetes
          </Text>
        </TouchableOpacity>
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
              onMarkAsPaid={async () => {
                // This will be handled in the EventCard component
                await loadEventsData();
              }}
            />
          ))
        ) : (
          <View style={[
            commonStyles.emptyState,
            {
              backgroundColor: colors.lightGray,
              padding: 20,
              borderRadius: 10,
              alignItems: 'center'
            }
          ]}>
            <Text style={[commonStyles.emptyStateText, { color: colors.textLight, fontSize: 16 }]}>
              📭 No hay eventos próximos
            </Text>
            <Text style={[commonStyles.emptyStateSubtext, { color: colors.textLight, fontSize: 14, marginTop: 5 }]}>
              Selecciona una fecha para agendar un nuevo evento
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderCalendarScreen = () => (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={commonStyles.backButton}
          onPress={() => setCurrentView('main')}
        >
          <Text style={commonStyles.buttonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={commonStyles.title}>📅 Seleccionar Fecha</Text>
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
      
      {/* Tools Button - Fixed at bottom */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 30,
          right: 20,
          backgroundColor: colors.primary,
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
          zIndex: 999
        }}
        onPress={() => setShowToolsModal(true)}
      >
        <Text style={{ fontSize: 24 }}>🛠️</Text>
      </TouchableOpacity>

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
