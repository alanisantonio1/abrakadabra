
import { Event } from '../types';

// Google Sheets configuration
const SPREADSHEET_ID = '13nNp7c8gSn0L3lCWHbJmHcCUZt9iUY7XUxP7SJLCh6s';
const RANGE = 'Sheet1!A:I'; // Columns A-I for all our data
const API_KEY = '8aff616a2f0872fb097d6217fa4685715601daf5'; // Your provided API key

// Column mapping to match your Google Sheet exactly
// Fecha	Nombre	Teléfono	Paquete	Estado	AnticipoPagado	TotalEvento	FechaPago	NotificadoLunes
const COLUMN_MAPPING = {
  fecha: 0,           // A - Fecha
  nombre: 1,          // B - Nombre  
  telefono: 2,        // C - Teléfono
  paquete: 3,         // D - Paquete
  estado: 4,          // E - Estado
  anticipoPagado: 5,  // F - AnticipoPagado
  totalEvento: 6,     // G - TotalEvento
  fechaPago: 7,       // H - FechaPago
  notificadoLunes: 8  // I - NotificadoLunes
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
const eventToSheetRow = (event: Event): string[] => {
  console.log('Converting event to sheet row:', event);
  
  return [
    event.date,                                    // Fecha
    `${event.customerName} (${event.childName})`, // Nombre
    event.customerPhone,                           // Teléfono
    event.packageType,                            // Paquete
    event.isPaid ? 'Pagado' : 'Pendiente',       // Estado
    event.deposit.toString(),                      // AnticipoPagado
    event.totalAmount.toString(),                  // TotalEvento
    event.isPaid ? event.date : '',               // FechaPago
    'No'                                          // NotificadoLunes
  ];
};

// Convert Google Sheets row to Event format
const sheetRowToEvent = (row: any[], index: number): Event | null => {
  if (!row || row.length < 4) {
    console.log('Invalid row data:', row);
    return null;
  }
  
  try {
    const fecha = row[COLUMN_MAPPING.fecha] || '';
    const nombre = row[COLUMN_MAPPING.nombre] || '';
    const telefono = row[COLUMN_MAPPING.telefono] || '';
    const paquete = row[COLUMN_MAPPING.paquete] || '';
    const anticipoPagado = parseFloat(row[COLUMN_MAPPING.anticipoPagado] || '0');
    const totalEvento = parseFloat(row[COLUMN_MAPPING.totalEvento] || '0');
    const estado = row[COLUMN_MAPPING.estado] || '';
    
    // Extract customer name and child name from "CustomerName (ChildName)" format
    const nameMatch = nombre.match(/^(.+?)\s*\((.+?)\)$/);
    const customerName = nameMatch ? nameMatch[1].trim() : nombre;
    const childName = nameMatch ? nameMatch[2].trim() : '';
    
    const event: Event = {
      id: `sheet_${index}_${fecha.replace(/-/g, '')}`,
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
    
    console.log('Converted sheet row to event:', event);
    return event;
  } catch (error) {
    console.error('Error converting sheet row to event:', error, row);
    return null;
  }
};

// Load events from Google Sheets
export const loadEventsFromGoogleSheets = async (): Promise<Event[]> => {
  try {
    console.log('Loading events from Google Sheets...');
    console.log('Using Spreadsheet ID:', SPREADSHEET_ID);
    console.log('Using API Key:', API_KEY);
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    console.log('Request URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Sheets API error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Google Sheets response:', data);
    
    const rows = data.values || [];
    console.log('Raw rows from Google Sheets:', rows);
    
    if (rows.length === 0) {
      console.log('No data found in Google Sheets');
      return [];
    }
    
    // Skip header row (index 0)
    const events: Event[] = [];
    for (let i = 1; i < rows.length; i++) {
      const event = sheetRowToEvent(rows[i], i);
      if (event) {
        events.push(event);
      }
    }
    
    console.log('Events loaded from Google Sheets:', events.length);
    console.log('Loaded events:', events);
    return events;
  } catch (error) {
    console.error('Error loading events from Google Sheets:', error);
    return [];
  }
};

// Save event to Google Sheets
export const saveEventToGoogleSheets = async (event: Event): Promise<boolean> => {
  try {
    console.log('Saving event to Google Sheets:', event);
    
    const sheetRow = eventToSheetRow(event);
    console.log('Sheet row data:', sheetRow);
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}:append?valueInputOption=RAW&key=${API_KEY}`;
    console.log('Append URL:', url);
    
    const requestBody = {
      values: [sheetRow]
    };
    console.log('Request body:', requestBody);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error saving to Google Sheets:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Event saved to Google Sheets successfully:', result);
    return true;
  } catch (error) {
    console.error('Error saving event to Google Sheets:', error);
    return false;
  }
};

// Update event in Google Sheets
export const updateEventInGoogleSheets = async (event: Event, rowIndex: number): Promise<boolean> => {
  try {
    console.log('Updating event in Google Sheets:', event, 'at row:', rowIndex);
    
    const sheetRow = eventToSheetRow(event);
    const range = `Sheet1!A${rowIndex + 1}:I${rowIndex + 1}`; // +1 because sheets are 1-indexed
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?valueInputOption=RAW&key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [sheetRow]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error updating Google Sheets:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    console.log('Event updated in Google Sheets successfully');
    return true;
  } catch (error) {
    console.error('Error updating event in Google Sheets:', error);
    return false;
  }
};

// Delete event from Google Sheets
export const deleteEventFromGoogleSheets = async (rowIndex: number): Promise<boolean> => {
  try {
    console.log('Deleting event from Google Sheets at row:', rowIndex);
    
    // Note: Google Sheets API doesn't have a direct delete row endpoint
    // We need to clear the row content instead
    const range = `Sheet1!A${rowIndex + 1}:I${rowIndex + 1}`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:clear?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error deleting from Google Sheets:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    console.log('Event deleted from Google Sheets successfully');
    return true;
  } catch (error) {
    console.error('Error deleting event from Google Sheets:', error);
    return false;
  }
};
