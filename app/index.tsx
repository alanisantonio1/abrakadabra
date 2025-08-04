
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { Event } from '../types';
import { loadEvents } from '../utils/storage';
import CalendarView from '../components/CalendarView';
import EventCard from '../components/EventCard';

export default function MainScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'calendar' | 'events' | 'packages'>('calendar');

  useEffect(() => {
    loadEventsData();
  }, []);

  const loadEventsData = async () => {
    const loadedEvents = await loadEvents();
    setEvents(loadedEvents);
    console.log('Loaded events:', loadedEvents.length);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    console.log('Selected date:', date);
  };

  const selectedDateEvents = events.filter(event => event.date === selectedDate);
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const renderCalendarTab = () => (
    <ScrollView style={commonStyles.container}>
      <Text style={commonStyles.title}>📅 Calendario Abrakadabra</Text>
      
      <CalendarView
        events={events}
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
      />

      {selectedDate && (
        <View style={{ margin: 16 }}>
          <Text style={commonStyles.subtitle}>
            Eventos del {new Date(selectedDate).toLocaleDateString('es-ES')}
          </Text>
          {selectedDateEvents.length > 0 ? (
            selectedDateEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => router.push(`/event/${event.id}`)}
              />
            ))
          ) : (
            <View style={commonStyles.card}>
              <Text style={commonStyles.text}>✅ No hay eventos programados para esta fecha</Text>
              <TouchableOpacity
                style={[commonStyles.card, { backgroundColor: colors.primary, marginTop: 8 }]}
                onPress={() => router.push(`/schedule?date=${selectedDate}`)}
              >
                <Text style={[commonStyles.text, { color: colors.backgroundAlt, textAlign: 'center' }]}>
                  + Agendar Evento
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );

  const renderEventsTab = () => (
    <ScrollView style={commonStyles.container}>
      <Text style={commonStyles.title}>📋 Próximos Eventos</Text>
      
      <View style={commonStyles.buttonContainer}>
        <TouchableOpacity
          style={[commonStyles.card, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/schedule')}
        >
          <Text style={[commonStyles.text, { color: colors.backgroundAlt, textAlign: 'center', fontWeight: '600' }]}>
            + Agendar Nuevo Evento
          </Text>
        </TouchableOpacity>
      </View>

      {upcomingEvents.length > 0 ? (
        upcomingEvents.map(event => (
          <EventCard
            key={event.id}
            event={event}
            onPress={() => router.push(`/event/${event.id}`)}
          />
        ))
      ) : (
        <View style={commonStyles.card}>
          <Text style={commonStyles.text}>No hay eventos próximos programados</Text>
        </View>
      )}

      <View style={commonStyles.buttonContainer}>
        <TouchableOpacity
          style={[commonStyles.card, { backgroundColor: colors.secondary }]}
          onPress={() => router.push('/events')}
        >
          <Text style={[commonStyles.text, { color: colors.backgroundAlt, textAlign: 'center', fontWeight: '600' }]}>
            Ver Todos los Eventos
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderPackagesTab = () => (
    <ScrollView style={commonStyles.container}>
      <Text style={commonStyles.title}>📦 Paquetes Disponibles</Text>
      
      <View style={commonStyles.buttonContainer}>
        <TouchableOpacity
          style={[commonStyles.card, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/packages')}
        >
          <Text style={[commonStyles.text, { color: colors.backgroundAlt, textAlign: 'center', fontWeight: '600' }]}>
            Ver Detalles de Paquetes
          </Text>
        </TouchableOpacity>
      </View>

      <View style={commonStyles.card}>
        <Text style={commonStyles.subtitle}>Resumen de Paquetes</Text>
        <Text style={commonStyles.text}>🎪 <Text style={{ fontWeight: '600' }}>Abra:</Text> Paquete básico desde $2,500</Text>
        <Text style={commonStyles.text}>🎭 <Text style={{ fontWeight: '600' }}>Kadabra:</Text> Paquete intermedio desde $3,500</Text>
        <Text style={commonStyles.text}>✨ <Text style={{ fontWeight: '600' }}>Abrakadabra:</Text> Paquete premium desde $5,000</Text>
      </View>
    </ScrollView>
  );

  return (
    <View style={commonStyles.container}>
      {activeTab === 'calendar' && renderCalendarTab()}
      {activeTab === 'events' && renderEventsTab()}
      {activeTab === 'packages' && renderPackagesTab()}

      <View style={commonStyles.bottomNav}>
        <TouchableOpacity
          style={[
            commonStyles.navButton,
            activeTab === 'calendar' && commonStyles.navButtonActive
          ]}
          onPress={() => setActiveTab('calendar')}
        >
          <Text style={{ fontSize: 20 }}>📅</Text>
          <Text style={[
            commonStyles.navButtonText,
            activeTab === 'calendar' && commonStyles.navButtonTextActive
          ]}>
            Calendario
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            commonStyles.navButton,
            activeTab === 'events' && commonStyles.navButtonActive
          ]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={{ fontSize: 20 }}>📋</Text>
          <Text style={[
            commonStyles.navButtonText,
            activeTab === 'events' && commonStyles.navButtonTextActive
          ]}>
            Eventos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            commonStyles.navButton,
            activeTab === 'packages' && commonStyles.navButtonActive
          ]}
          onPress={() => setActiveTab('packages')}
        >
          <Text style={{ fontSize: 20 }}>📦</Text>
          <Text style={[
            commonStyles.navButtonText,
            activeTab === 'packages' && commonStyles.navButtonTextActive
          ]}>
            Paquetes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
