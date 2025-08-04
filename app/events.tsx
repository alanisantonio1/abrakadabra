
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { Event } from '../types';
import { loadEvents, saveEvents } from '../utils/storage';
import EventCard from '../components/EventCard';
import Button from '../components/Button';

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'pending' | 'paid'>('all');

  useEffect(() => {
    loadEventsData();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, filterType]);

  const loadEventsData = async () => {
    const loadedEvents = await loadEvents();
    setEvents(loadedEvents);
  };

  const filterEvents = () => {
    let filtered = [...events];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.packageType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    switch (filterType) {
      case 'upcoming':
        filtered = filtered.filter(event => new Date(event.date) >= new Date());
        break;
      case 'pending':
        filtered = filtered.filter(event => !event.isPaid);
        break;
      case 'paid':
        filtered = filtered.filter(event => event.isPaid);
        break;
    }

    // Sort by date
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredEvents(filtered);
  };

  const handleMarkAsPaid = async (eventId: string) => {
    const updatedEvents = events.map(event =>
      event.id === eventId
        ? { ...event, isPaid: true, remainingAmount: 0 }
        : event
    );
    
    setEvents(updatedEvents);
    await saveEvents(updatedEvents);
  };

  const renderFilterButtons = () => (
    <View style={{ flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, gap: 8 }}>
      {[
        { key: 'all', label: 'Todos' },
        { key: 'upcoming', label: 'Próximos' },
        { key: 'pending', label: 'Pendientes' },
        { key: 'paid', label: 'Pagados' }
      ].map(filter => (
        <TouchableOpacity
          key={filter.key}
          style={[
            {
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            },
            filterType === filter.key && { backgroundColor: colors.primary, borderColor: colors.primary }
          ]}
          onPress={() => setFilterType(filter.key as any)}
        >
          <Text style={[
            { fontSize: 12, fontWeight: '600', color: colors.text },
            filterType === filter.key && { color: colors.backgroundAlt }
          ]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={commonStyles.container}>
      <Text style={commonStyles.title}>📋 Gestión de Eventos</Text>

      <View style={commonStyles.buttonContainer}>
        <Button
          text="+ Agendar Nuevo Evento"
          onPress={() => router.push('/schedule')}
          style={buttonStyles.primary}
        />
      </View>

      <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
        <TextInput
          style={commonStyles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por cliente, niño o paquete..."
        />
      </View>

      {renderFilterButtons()}

      <ScrollView style={{ flex: 1 }}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => router.push(`/event/${event.id}`)}
              onMarkAsPaid={() => handleMarkAsPaid(event.id)}
            />
          ))
        ) : (
          <View style={commonStyles.card}>
            <Text style={commonStyles.text}>
              {searchQuery || filterType !== 'all' 
                ? 'No se encontraron eventos con los filtros aplicados'
                : 'No hay eventos registrados'
              }
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={commonStyles.buttonContainer}>
        <Button
          text="← Volver"
          onPress={() => router.back()}
          style={buttonStyles.backButton}
        />
      </View>
    </View>
  );
}
