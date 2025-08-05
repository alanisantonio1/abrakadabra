
import { Event } from '../types';

// Google Sheets configuration
const SPREADSHEET_ID = '13nNp7c8gSn0L3lCWHbJmHcCUZt9iUY7XUxP7SJLCh6s';
const RANGE = 'Sheet1!A:I'; // Columns A-I for all our data
const API_KEY = 'YOUR_GOOGLE_SHEETS_API_KEY'; // You need to replace this

// Column mapping to match your Google Sheet
// Fecha	Nombre	Teléfono	Paquete	Estado	AnticipoPagado	TotalEvento	FechaPago	NotificadoLunes
const COLUMN_MAPPING = {
  fecha: 0,           // A
  nombre: 1,          // B  
  telefono: 2,        // C
  paquete: 3,         // D
  estado: 4,          // E
  anticipoPagado: 5,  // F
  totalEvento: 6,     // G
  fechaPago: 7,       // H
  notificadoLunes: 8  // I
};

interface GoogleSheetsRow {
  fecha: string;
  nombre: string;
  telefono: string;
  paquete: string;
  estado: string;
  anticipoPagado: string;
  totalEvento: string;
  fechaPago: string;
  notificadoLunes: string;
}

// Convert Event to Google Sheets row format
const eventToSheetRow = (event: Event): GoogleSheetsRow => {
  return {
    fecha: event.date,
    nombre: `${event.customerName} (${event.childName})`,
    telefono: event.customerPhone,
    paquete: event.packageType,
    estado: event.isPaid ? 'Pagado' : 'Pendiente',
    anticipoPagado: event.deposit.toString(),
    totalEvento: event.totalAmount.toString(),
    fechaPago: event.isPaid ? event.date : '',
    notificadoLunes: 'No'
  };
};

// Convert Google Sheets row to Event format
const sheetRowToEvent = (row: any[], index: number): Event | null => {
  if (!row || row.length < 4) return null;
  
  const fecha = row[COLUMN_MAPPING.fecha] || '';
  const nombre = row[COLUMN_MAPPING.nombre] || '';
  const telefono = row[COLUMN_MAPPING.telefono] || '';
  const paquete = row[COLUMN_MAPPING.paquete] || '';
  const anticipoPagado = parseFloat(row[COLUMN_MAPPING.anticipoPagado] || '0');
  const totalEvento = parseFloat(row[COLUMN_MAPPING.totalEvento] || '0');
  const estado = row[COLUMN_MAPPING.estado] || '';
  
  // Extract customer name and child name
  const nameMatch = nombre.match(/^(.+?)\s*\((.+?)\)$/);
  const customerName = nameMatch ? nameMatch[1].trim() : nombre;
  const childName = nameMatch ? nameMatch[2].trim() : '';
  
  return {
    id: `sheet_${index}_${Date.now()}`,
    date: fecha,
    time: '15:00', // Default time since it's not in the sheet
    customerName,
    customerPhone: telefono,
    childName,
    packageType: paquete as 'Abra' | 'Kadabra' | 'Abrakadabra',
    totalAmount: totalEvento,
    deposit: anticipoPagado,
    remainingAmount: totalEvento - anticipoPagado,
    isPaid: estado.toLowerCase() === 'pagado',
    notes: '',
    createdAt: new Date().toISOString()
  };
};

// Load events from Google Sheets
export const loadEventsFromGoogleSheets = async (): Promise<Event[]> => {
  try {
    console.log('Loading events from Google Sheets...');
    
    // For now, we'll use a mock implementation since we need proper authentication
    // In a real implementation, you would use the Google Sheets API
    const mockEvents: Event[] = [
      {
        id: 'mock_1',
        date: '2024-01-15',
        time: '15:00',
        customerName: 'María García',
        customerPhone: '555-0123',
        childName: 'Sofia',
        packageType: 'Abrakadabra',
        totalAmount: 5000,
        deposit: 2500,
        remainingAmount: 2500,
        isPaid: false,
        notes: 'Evento de prueba',
        createdAt: new Date().toISOString()
      }
    ];
    
    console.log('Mock events loaded:', mockEvents.length);
    return mockEvents;
    
    // Real implementation would look like this:
    /*
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const rows = data.values || [];
    
    // Skip header row
    const events: Event[] = [];
    for (let i = 1; i < rows.length; i++) {
      const event = sheetRowToEvent(rows[i], i);
      if (event) {
        events.push(event);
      }
    }
    
    console.log('Events loaded from Google Sheets:', events.length);
    return events;
    */
  } catch (error) {
    console.error('Error loading events from Google Sheets:', error);
    return [];
  }
};

// Save event to Google Sheets
export const saveEventToGoogleSheets = async (event: Event): Promise<boolean> => {
  try {
    console.log('Saving event to Google Sheets:', event);
    
    // For now, we'll use a mock implementation
    // In a real implementation, you would append to the Google Sheet
    console.log('Event would be saved to Google Sheets with data:', eventToSheetRow(event));
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
    
    // Real implementation would look like this:
    /*
    const sheetRow = eventToSheetRow(event);
    const values = [
      [
        sheetRow.fecha,
        sheetRow.nombre,
        sheetRow.telefono,
        sheetRow.paquete,
        sheetRow.estado,
        sheetRow.anticipoPagado,
        sheetRow.totalEvento,
        sheetRow.fechaPago,
        sheetRow.notificadoLunes
      ]
    ];
    
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}:append?valueInputOption=RAW&key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: values
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    console.log('Event saved to Google Sheets successfully');
    return true;
    */
  } catch (error) {
    console.error('Error saving event to Google Sheets:', error);
    return false;
  }
};

// Update event in Google Sheets
export const updateEventInGoogleSheets = async (event: Event, rowIndex: number): Promise<boolean> => {
  try {
    console.log('Updating event in Google Sheets:', event);
    
    // Mock implementation
    console.log('Event would be updated in Google Sheets at row:', rowIndex);
    return true;
    
    // Real implementation would update the specific row
  } catch (error) {
    console.error('Error updating event in Google Sheets:', error);
    return false;
  }
};

// Delete event from Google Sheets
export const deleteEventFromGoogleSheets = async (rowIndex: number): Promise<boolean> => {
  try {
    console.log('Deleting event from Google Sheets at row:', rowIndex);
    
    // Mock implementation
    return true;
    
    // Real implementation would delete the specific row
  } catch (error) {
    console.error('Error deleting event from Google Sheets:', error);
    return false;
  }
};
