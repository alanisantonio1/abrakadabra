
import { Event } from '../types';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import EventCard from '../components/EventCard';
import Button from '../components/Button';
import { loadEvents, updateEvent } from '../utils/storage';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'paid' | 'pending'>('all');

  useEffect(() => {
    loadEventsData();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, filterType]);

  const loadEventsData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading events...');
      const loadedEvents = await loadEvents();
      setEvents(loadedEvents);
      console.log('✅ Events loaded:', loadedEvents.length);
    } catch (error) {
      console.error('❌ Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.customerName.toLowerCase().includes(query) ||
        event.childName.toLowerCase().includes(query) ||
        event.customerPhone.includes(query) ||
        event.packageType.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    const today = new Date().toISOString().split('T')[0];
    
    switch (filterType) {
      case 'upcoming':
        filtered = filtered.filter(event => event.date >= today);
        break;
      case 'paid':
        filtered = filtered.filter(event => event.isPaid);
        break;
      case 'pending':
        filtered = filtered.filter(event => !event.isPaid);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => b.date.localeCompare(a.date));

    setFilteredEvents(filtered);
  };

  const handleMarkAsPaid = async (eventId: string) => {
    try {
      console.log('💰 Marking event as paid:', eventId);
      
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      const updatedEvent: Event = {
        ...event,
        isPaid: true,
        remainingAmount: 0,
        deposit: event.totalAmount
      };

      const success = await updateEvent(updatedEvent);
      
      if (success) {
        // Update local state
        setEvents(prevEvents =>
          prevEvents.map(e => e.id === eventId ? updatedEvent : e)
        );
        console.log('✅ Event marked as paid successfully');
      }
    } catch (error) {
      console.error('❌ Error marking event as paid:', error);
    }
  };

  const renderFilterButtons = () => (
    <View style={{ 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      justifyContent: 'space-around',
      marginBottom: 20,
      paddingHorizontal: 10
    }}>
      {[
        { key: 'all', label: 'Todos' },
        { key: 'upcoming', label: 'Próximos' },
        { key: 'paid', label: 'Pagados' },
        { key: 'pending', label: 'Pendientes' }
      ].map(filter => (
        <TouchableOpacity
          key={filter.key}
          style={[
            {
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 20,
              marginHorizontal: 4,
              marginVertical: 4,
              borderWidth: 1,
              borderColor: colors.primary
            },
            filterType === filter.key && {
              backgroundColor: colors.primary
            }
          ]}
          onPress={() => setFilterType(filter.key as any)}
        >
          <Text style={[
            { fontSize: 14, textAlign: 'center' },
            filterType === filter.key ? { color: 'white' } : { color: colors.primary }
          ]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={[commonStyles.backButton, { backgroundColor: colors.secondary }]}
          onPress={() => router.back()}
        >
          <Text style={[commonStyles.backButtonText, { color: 'white' }]}>← Volver</Text>
        </TouchableOpacity>
        <Text style={commonStyles.title}>Eventos Agendados</Text>
        <Text style={commonStyles.subtitle}>
          {loading ? 'Cargando...' : `${filteredEvents.length} de ${events.length} eventos`}
        </Text>
      </View>

      <View style={[commonStyles.section, { paddingTop: 0 }]}>
        {/* Search Bar */}
        <TextInput
          style={[
            commonStyles.input,
            { 
              marginBottom: 20,
              backgroundColor: '#f8f9fa',
              borderColor: '#e9ecef'
            }
          ]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por nombre, teléfono o paquete..."
          placeholderTextColor="#6c757d"
        />

        {/* Filter Buttons */}
        {renderFilterButtons()}

        {/* Refresh Button */}
        <Button
          text="🔄 Actualizar desde Google Sheets"
          onPress={loadEventsData}
          style={[
            buttonStyles.secondary,
            { 
              backgroundColor: colors.accent,
              marginBottom: 20
            }
          ]}
          textStyle={{ color: 'white' }}
        />
      </View>

      {/* Events List */}
      <ScrollView style={{ flex: 1 }}>
        {loading ? (
          <View style={[commonStyles.section, { alignItems: 'center' }]}>
            <Text style={commonStyles.text}>Cargando eventos...</Text>
          </View>
        ) : filteredEvents.length > 0 ? (
          <View style={commonStyles.section}>
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => router.push(`/event/${event.id}`)}
                onMarkAsPaid={() => handleMarkAsPaid(event.id)}
              />
            ))}
          </View>
        ) : (
          <View style={[commonStyles.section, { alignItems: 'center' }]}>
            <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 10 }]}>
              {searchQuery || filterType !== 'all' 
                ? 'No se encontraron eventos con los filtros aplicados'
                : 'No hay eventos agendados'
              }
            </Text>
            <Text style={[commonStyles.text, { textAlign: 'center', fontSize: 14, color: '#666' }]}>
              Los eventos se cargan automáticamente desde Google Sheets
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
