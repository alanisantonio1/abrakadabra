
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event } from '../types';
import { loadEventsFromGoogleSheets, saveEventToGoogleSheets } from './googleSheets';

const EVENTS_KEY = 'abrakadabra_events';

// Load events from AsyncStorage only (for backup)
const loadEventsFromLocalStorage = async (): Promise<Event[]> => {
  try {
    const stored = await AsyncStorage.getItem(EVENTS_KEY);
    if (stored) {
      const events = JSON.parse(stored);
      console.log('Events loaded from AsyncStorage:', events.length);
      return events;
    }
    return [];
  } catch (error) {
    console.error('Error loading events from AsyncStorage:', error);
    return [];
  }
};

// Save events to AsyncStorage
const saveEventsToLocalStorage = async (events: Event[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    console.log('Events saved to AsyncStorage successfully:', events.length);
  } catch (error) {
    console.error('Error saving events to AsyncStorage:', error);
  }
};

// Primary load function - tries Google Sheets first, falls back to AsyncStorage
export const loadEvents = async (): Promise<Event[]> => {
  try {
    console.log('Loading events...');
    
    // Try to load from Google Sheets first
    let events = await loadEventsFromGoogleSheets();
    
    // If Google Sheets fails or returns empty, try AsyncStorage
    if (events.length === 0) {
      console.log('No events from Google Sheets, trying AsyncStorage...');
      events = await loadEventsFromLocalStorage();
    } else {
      // Save to AsyncStorage as cache if we got data from Google Sheets
      await saveEventsToLocalStorage(events);
    }
    
    console.log('Events loaded successfully:', events.length);
    console.log('Loaded events:', events.map((e: Event) => ({ 
      id: e.id, 
      date: e.date, 
      customerName: e.customerName,
      packageType: e.packageType 
    })));
    
    return events;
  } catch (error) {
    console.error('Error loading events:', error);
    // Fallback to AsyncStorage if everything fails
    return await loadEventsFromLocalStorage();
  }
};

// Check if a date already has events
export const checkDateAvailability = async (date: string): Promise<{ isAvailable: boolean; existingEvents: Event[] }> => {
  try {
    const events = await loadEvents();
    const existingEvents = events.filter(event => event.date === date);
    
    console.log(`Date ${date} availability check:`, {
      isAvailable: existingEvents.length === 0,
      existingEventsCount: existingEvents.length
    });
    
    return {
      isAvailable: existingEvents.length === 0,
      existingEvents
    };
  } catch (error) {
    console.error('Error checking date availability:', error);
    return { isAvailable: true, existingEvents: [] };
  }
};

// Hybrid storage: Use Google Sheets as primary, AsyncStorage as backup/cache
export const saveEvents = async (events: Event[]): Promise<void> => {
  try {
    console.log('Saving events...', events.length);
    
    // Save to AsyncStorage immediately for offline access
    await saveEventsToLocalStorage(events);
    
    console.log('Events saved successfully:', events.length);
  } catch (error) {
    console.error('Error saving events:', error);
  }
};

export const generateEventId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Save a single event (used when creating new events)
export const saveEvent = async (event: Event): Promise<void> => {
  try {
    console.log('Saving single event:', event);
    
    // Check if date already has events (additional safety check)
    const { existingEvents } = await checkDateAvailability(event.date);
    if (existingEvents.length > 0) {
      console.warn('Warning: Saving event to date that already has events:', existingEvents.length);
    }
    
    // First, try to save to Google Sheets
    const savedToSheets = await saveEventToGoogleSheets(event);
    
    if (savedToSheets) {
      console.log('Event saved to Google Sheets successfully');
    } else {
      console.log('Failed to save to Google Sheets, will save locally only');
    }
    
    // Load existing events from local storage
    const existingLocalEvents = await loadEventsFromLocalStorage();
    
    // Add or update the event in local storage
    const eventIndex = existingLocalEvents.findIndex(e => e.id === event.id);
    if (eventIndex >= 0) {
      existingLocalEvents[eventIndex] = event;
    } else {
      existingLocalEvents.push(event);
    }
    
    // Save all events to local storage
    await saveEventsToLocalStorage(existingLocalEvents);
    
    console.log('Single event saved successfully');
  } catch (error) {
    console.error('Error saving single event:', error);
    throw error;
  }
};

// Update an existing event
export const updateEvent = async (event: Event): Promise<void> => {
  try {
    console.log('Updating event:', event);
    
    // Load existing events
    const existingEvents = await loadEventsFromLocalStorage();
    
    // Find and update the event
    const eventIndex = existingEvents.findIndex(e => e.id === event.id);
    if (eventIndex >= 0) {
      existingEvents[eventIndex] = event;
      await saveEventsToLocalStorage(existingEvents);
      console.log('Event updated successfully');
    } else {
      console.error('Event not found for update:', event.id);
      throw new Error('Event not found');
    }
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    console.log('Deleting event:', eventId);
    
    // Load existing events
    const existingEvents = await loadEventsFromLocalStorage();
    
    // Filter out the event to delete
    const filteredEvents = existingEvents.filter(e => e.id !== eventId);
    
    if (filteredEvents.length === existingEvents.length) {
      console.error('Event not found for deletion:', eventId);
      throw new Error('Event not found');
    }
    
    // Save the filtered events
    await saveEventsToLocalStorage(filteredEvents);
    
    console.log('Event deleted successfully');
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};
