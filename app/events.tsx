
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { loadEvents, updateEvent } from '../utils/storage';
import { Event } from '../types';
import EventCard from '../components/EventCard';
import Button from '../components/Button';

const EventsScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'paid'>('all');

  useEffect(() => {
    console.log('📋 EventsScreen mounted, loading events...');
    loadEventsData();
  }, []);

  const filterEvents = useCallback(() => {
    let filtered = [...events];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(event =>
        event.customerName.toLowerCase().includes(query) ||
        event.childName.toLowerCase().includes(query) ||
        event.customerPhone.includes(query) ||
        event.packageType.toLowerCase().includes(query) ||
        event.date.includes(query)
      );
    }

    // Apply status filter
    if (filterType === 'pending') {
      filtered = filtered.filter(event => !event.isPaid);
    } else if (filterType === 'paid') {
      filtered = filtered.filter(event => event.isPaid);
    }

    setFilteredEvents(filtered);
    console.log(`🔍 Filtered events: ${filtered.length} of ${events.length}`);
  }, [events, searchQuery, filterType]);

  useEffect(() => {
    console.log('🔍 Filtering events...');
    filterEvents();
  }, [events, searchQuery, filterType, filterEvents]);

  const loadEventsData = async () => {
    try {
      setIsLoading(true);
      console.log('📥 Loading events data...');
      const loadedEvents = await loadEvents();
      
      // Sort events by date (newest first)
      const sortedEvents = loadedEvents.sort((a, b) => {
        const dateComparison = b.date.localeCompare(a.date);
        if (dateComparison === 0) {
          return b.time.localeCompare(a.time);
        }
        return dateComparison;
      });
      
      setEvents(sortedEvents);
      console.log('✅ Events loaded successfully:', sortedEvents.length);
    } catch (error: any) {
      console.error('❌ Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPaid = async (eventId: string) => {
    try {
      console.log('💰 Marking event as paid:', eventId);
      const eventToUpdate = events.find(e => e.id === eventId);
      
      if (!eventToUpdate) {
        console.error('❌ Event not found:', eventId);
        return;
      }

      const updatedEvent: Event = {
        ...eventToUpdate,
        isPaid: true,
        remainingAmount: 0
      };

      const result = await updateEvent(updatedEvent);
      
      if (result.success) {
        console.log('✅ Event marked as paid successfully');
        // Reload events to reflect changes
        await loadEventsData();
      } else {
        console.error('❌ Failed to mark event as paid:', result.message);
      }
    } catch (error: any) {
      console.error('❌ Error marking event as paid:', error);
    }
  };

  const renderFilterButtons = () => (
    <View style={commonStyles.filterContainer}>
      <TouchableOpacity
        style={[
          commonStyles.filterButton,
          filterType === 'all' && commonStyles.filterButtonActive
        ]}
        onPress={() => setFilterType('all')}
      >
        <Text style={[
          commonStyles.filterButtonText,
          filterType === 'all' && commonStyles.filterButtonTextActive
        ]}>
          Todos ({events.length})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          commonStyles.filterButton,
          filterType === 'pending' && commonStyles.filterButtonActive
        ]}
        onPress={() => setFilterType('pending')}
      >
        <Text style={[
          commonStyles.filterButtonText,
          filterType === 'pending' && commonStyles.filterButtonTextActive
        ]}>
          Pendientes ({events.filter(e => !e.isPaid).length})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          commonStyles.filterButton,
          filterType === 'paid' && commonStyles.filterButtonActive
        ]}
        onPress={() => setFilterType('paid')}
      >
        <Text style={[
          commonStyles.filterButtonText,
          filterType === 'paid' && commonStyles.filterButtonTextActive
        ]}>
          Pagados ({events.filter(e => e.isPaid).length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={commonStyles.backButton}
          onPress={() => router.back()}
        >
          <Text style={commonStyles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={commonStyles.title}>📋 Eventos</Text>
      </View>

      {/* Search Bar */}
      <View style={commonStyles.section}>
        <TextInput
          style={commonStyles.searchInput}
          placeholder="Buscar por nombre, teléfono, paquete o fecha..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.gray}
        />
      </View>

      {/* Filter Buttons */}
      <View style={commonStyles.section}>
        {renderFilterButtons()}
      </View>

      {/* Add New Event Button */}
      <View style={commonStyles.section}>
        <Button
          title="➕ Agregar Nuevo Evento"
          onPress={() => router.push('/schedule')}
          style={buttonStyles.primary}
        />
      </View>

      {/* Events List */}
      <ScrollView style={commonStyles.section}>
        {isLoading ? (
          <Text style={commonStyles.loadingText}>Cargando eventos...</Text>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => router.push(`/event/${event.id}`)}
              onMarkAsPaid={() => handleMarkAsPaid(event.id)}
            />
          ))
        ) : (
          <View style={commonStyles.emptyContainer}>
            <Text style={commonStyles.emptyText}>
              {searchQuery || filterType !== 'all' 
                ? 'No se encontraron eventos con los filtros aplicados'
                : 'No hay eventos registrados'
              }
            </Text>
            {!searchQuery && filterType === 'all' && (
              <Button
                title="➕ Crear Primer Evento"
                onPress={() => router.push('/schedule')}
                style={[buttonStyles.primary, { marginTop: 15 }]}
              />
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default EventsScreen;
