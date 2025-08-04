
import { Event } from '../types';

const EVENTS_KEY = 'abrakadabra_events';

export const saveEvents = async (events: Event[]): Promise<void> => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    }
    console.log('Events saved successfully:', events.length);
  } catch (error) {
    console.error('Error saving events:', error);
  }
};

export const loadEvents = async (): Promise<Event[]> => {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(EVENTS_KEY);
      if (stored) {
        const events = JSON.parse(stored);
        console.log('Events loaded successfully:', events.length);
        return events;
      }
    }
    return [];
  } catch (error) {
    console.error('Error loading events:', error);
    return [];
  }
};

export const generateEventId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};
