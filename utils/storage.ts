
import { Event } from '../types';
import { loadEventsFromGoogleSheets, saveEventToGoogleSheets } from './googleSheets';

const EVENTS_KEY = 'abrakadabra_events';

// Hybrid storage: Use Google Sheets as primary, localStorage as backup/cache
export const saveEvents = async (events: Event[]): Promise<void> => {
  try {
    console.log('Saving events...', events.length);
    
    // Save to localStorage immediately for offline access
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
      console.log('Events saved to localStorage successfully');
    }
    
    // Also save to Google Sheets (for new events)
    const existingEvents = await loadEventsFromLocalStorage();
    const newEvents = events.filter(event => 
      !existingEvents.find(existing => existing.id === event.id)
    );
    
    for (const newEvent of newEvents) {
      await saveEventToGoogleSheets(newEvent);
    }
    
    console.log('Events saved successfully:', events.length);
  } catch (error) {
    console.error('Error saving events:', error);
  }
};

// Load events from localStorage only (for backup)
const loadEventsFromLocalStorage = async (): Promise<Event[]> => {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(EVENTS_KEY);
      if (stored) {
        const events = JSON.parse(stored);
        return events;
      }
    }
    return [];
  } catch (error) {
    console.error('Error loading events from localStorage:', error);
    return [];
  }
};

// Primary load function - tries Google Sheets first, falls back to localStorage
export const loadEvents = async (): Promise<Event[]> => {
  try {
    console.log('Loading events...');
    
    // Try to load from Google Sheets first
    let events = await loadEventsFromGoogleSheets();
    
    // If Google Sheets fails or returns empty, try localStorage
    if (events.length === 0) {
      console.log('No events from Google Sheets, trying localStorage...');
      events = await loadEventsFromLocalStorage();
    }
    
    // Save to localStorage as cache
    if (events.length > 0 && typeof localStorage !== 'undefined') {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
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
    return [];
  }
};

export const generateEventId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Save a single event (used when creating new events)
export const saveEvent = async (event: Event): Promise<void> => {
  try {
    console.log('Saving single event:', event);
    
    // Load existing events
    const existingEvents = await loadEvents();
    
    // Add or update the event
    const eventIndex = existingEvents.findIndex(e => e.id === event.id);
    if (eventIndex >= 0) {
      existingEvents[eventIndex] = event;
    } else {
      existingEvents.push(event);
    }
    
    // Save all events
    await saveEvents(existingEvents);
    
    console.log('Single event saved successfully');
  } catch (error) {
    console.error('Error saving single event:', error);
    throw error;
  }
};
