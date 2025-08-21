
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import CalendarView from '../components/CalendarView';
import { loadEvents, testDatabaseConnections } from '../utils/storage';
import EventCard from '../components/EventCard';
import { router, useFocusEffect } from 'expo-router';
import DiagnosticsModal from '../components/DiagnosticsModal';
import MigrationAlert from '../components/MigrationAlert';
import Button from '../components/Button';
import { Event } from '../types';
import { commonStyles, colors } from '../styles/commonStyles';

const MainScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentView, setCurrentView] = useState<'main' | 'calendar'>('main');
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [showTools, setShowTools] = useState<boolean>(false);
  const [showMigrationAlert, setShowMigrationAlert] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

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
      setLoading(true);
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
    } finally {
      setLoading(false);
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

  // FIXED: Helper function to parse date string correctly without timezone issues
  const parseDateString = (dateString: string): { year: number; month: number; day: number } => {
    const parts = dateString.split('-');
    return {
      year: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10) - 1, // Convert to 0-based month
      day: parseInt(parts[2], 10)
    };
  };

  // FIXED: Helper function to compare dates without timezone issues
  const compareDates = (dateA: string, dateB: string): number => {
    const a = parseDateString(dateA);
    const b = parseDateString(dateB);
    
    // Compare year first
    if (a.year !== b.year) {
      return a.year - b.year;
    }
    
    // Then month
    if (a.month !== b.month) {
      return a.month - b.month;
    }
    
    // Finally day
    return a.day - b.day;
  };

  const getUpcomingEvents = (): Event[] => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    console.log('📅 UPCOMING EVENTS: Getting upcoming events...');
    console.log('📅 UPCOMING EVENTS: Today string:', todayString);
    
    const upcomingEvents = events
      .filter(event => {
        const isUpcoming = event.date >= todayString;
        console.log(`📅 UPCOMING EVENTS: Event ${event.childName} (${event.date}) - Upcoming: ${isUpcoming}`);
        return isUpcoming;
      })
      .sort((a, b) => {
        const comparison = compareDates(a.date, b.date);
        console.log(`📅 UPCOMING EVENTS: Comparing ${a.date} vs ${b.date} = ${comparison}`);
        return comparison;
      })
      .slice(0, 5);
    
    console.log('📅 UPCOMING EVENTS: Final upcoming events:', upcomingEvents.map(e => `${e.childName} (${e.date})`));
    
    return upcomingEvents;
  };

  const getEventStats = () => {
    const totalEvents = events.length;
    const upcomingEvents = getUpcomingEvents().length;
    const paidEvents = events.filter(e => e.isPaid).length;
    const pendingPayments = events.filter(e => !e.isPaid).length;
    
    return { totalEvents, upcomingEvents, paidEvents, pendingPayments };
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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}>
        <View style={{
          backgroundColor: colors.white,
          borderRadius: 24,
          padding: 24,
          width: '85%',
          maxWidth: 320,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          elevation: 12,
        }}>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.primary,
            textAlign: 'center',
            marginBottom: 24,
          }}>
            🛠️ Herramientas
          </Text>
          
          <Button
            text="🔍 Diagnósticos"
            onPress={() => {
              setShowTools(false);
              setShowDiagnostics(true);
            }}
            variant="primary"
            style={{ marginBottom: 12 }}
          />
          
          <Button
            text="🧪 Probar Conexión"
            onPress={() => {
              setShowTools(false);
              testDatabaseConnection();
            }}
            variant="secondary"
            style={{ marginBottom: 12 }}
          />
          
          <Button
            text="Cancelar"
            onPress={() => setShowTools(false)}
            variant="outline"
          />
        </View>
      </View>
    );
  };

  const renderMainScreen = () => {
    const stats = getEventStats();
    
    return (
      <ScrollView style={commonStyles.container} showsVerticalScrollIndicator={false}>
        {/* Migration Alert */}
        {showMigrationAlert && (
          <MigrationAlert onDismiss={() => setShowMigrationAlert(false)} />
        )}
        
        {/* Header */}
        <View style={commonStyles.header}>
          <Text style={commonStyles.title}>🎪 Abrakadabra Events</Text>
          <Text style={commonStyles.subtitle}>
            Gestión de eventos y reservaciones
          </Text>
        </View>
        
        {/* Quick Stats */}
        <View style={commonStyles.statsContainer}>
          <View style={{ alignItems: 'center' }}>
            <Text style={commonStyles.statNumber}>{stats.totalEvents}</Text>
            <Text style={commonStyles.statLabel}>Total</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[commonStyles.statNumber, { color: colors.info }]}>
              {stats.upcomingEvents}
            </Text>
            <Text style={commonStyles.statLabel}>Próximos</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[commonStyles.statNumber, { color: colors.success }]}>
              {stats.paidEvents}
            </Text>
            <Text style={commonStyles.statLabel}>Pagados</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[commonStyles.statNumber, { color: colors.warning }]}>
              {stats.pendingPayments}
            </Text>
            <Text style={commonStyles.statLabel}>Pendientes</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={commonStyles.card}>
          <Text style={commonStyles.sectionTitle}>🚀 Acciones Rápidas</Text>
          
          <View style={commonStyles.quickActions}>
            <Button
              text="📅 Seleccionar Fechas"
              onPress={() => setCurrentView('calendar')}
              variant="primary"
              icon="📅"
            />
            
            <Button
              text="👁️ Ver Eventos"
              onPress={() => handleNavigation('/events')}
              variant="secondary"
              icon="👁️"
            />
            
            <Button
              text="📦 Paquetes"
              onPress={() => handleNavigation('/packages')}
              variant="accent"
              icon="📦"
            />
          </View>
        </View>

        {/* Upcoming Events */}
        {getUpcomingEvents().length > 0 && (
          <View style={commonStyles.card}>
            <Text style={commonStyles.sectionTitle}>📅 Próximos Eventos</Text>
            
            {getUpcomingEvents().map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => router.push(`/event/${event.id}`)}
              />
            ))}
            
            {events.length > 5 && (
              <Button
                text="Ver todos los eventos"
                onPress={() => handleNavigation('/events')}
                variant="outline"
                size="small"
              />
            )}
          </View>
        )}

        {/* Empty State */}
        {events.length === 0 && !loading && (
          <View style={commonStyles.emptyState}>
            <Text style={commonStyles.emptyStateText}>
              🎈 ¡Bienvenido a Abrakadabra!
            </Text>
            <Text style={commonStyles.emptyStateSubtext}>
              No hay eventos registrados. Comienza creando tu primer evento.
            </Text>
            <Button
              text="📅 Crear Primer Evento"
              onPress={() => setCurrentView('calendar')}
              variant="primary"
              style={{ marginTop: 16 }}
            />
          </View>
        )}

        {/* Tools Button */}
        <Button
          text="🛠️ Herramientas"
          onPress={() => setShowTools(true)}
          variant="secondary"
          style={{ marginBottom: 30 }}
        />
      </ScrollView>
    );
  };

  const renderCalendarScreen = () => (
    <View style={commonStyles.container}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
      }}>
        <Button
          text="← Volver"
          onPress={() => setCurrentView('main')}
          variant="outline"
          size="small"
          style={{ flex: 0.3 }}
        />
        
        <Text style={[commonStyles.title, { flex: 0.4, textAlign: 'center', fontSize: 20 }]}>
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

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={commonStyles.loadingText}>🔄 Cargando eventos...</Text>
      </View>
    );
  }

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
