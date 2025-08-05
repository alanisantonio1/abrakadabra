
import { Event } from '../types';

// Google Sheets configuration
const SPREADSHEET_ID = '13nNp7c8gSn0L3lCWHbJmHcCUZt9iUY7XUxP7SJLCh6s';
const RANGE = 'Sheet1!A:I'; // Columns A-I for all our data
const API_KEY = 'AIzaSyBFupSOezwzthb-vvb3PgTcYf1GrTa3rsc'; // Updated API key

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
  console.log('🔄 Converting event to sheet row:', event);
  
  const row = [
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
  
  console.log('📊 Generated sheet row:', row);
  return row;
};

// Convert Google Sheets row to Event format
const sheetRowToEvent = (row: any[], index: number): Event | null => {
  if (!row || row.length < 4) {
    console.log('⚠️ Invalid row data:', row);
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
    
    console.log('✅ Converted sheet row to event:', event);
    return event;
  } catch (error) {
    console.error('❌ Error converting sheet row to event:', error, row);
    return null;
  }
};

// Test Google Sheets connection
export const testGoogleSheetsConnection = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testing Google Sheets connection...');
    console.log('📋 Spreadsheet ID:', SPREADSHEET_ID);
    console.log('🔑 API Key (first 10 chars):', API_KEY.substring(0, 10) + '...');
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${API_KEY}`;
    console.log('🌐 Test URL:', url);
    
    const response = await fetch(url);
    console.log('📥 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Connection test failed:', response.status, errorText);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Connection test successful. Spreadsheet title:', data.properties?.title);
    return true;
  } catch (error) {
    console.error('❌ Connection test error:', error);
    return false;
  }
};

// Load events from Google Sheets
export const loadEventsFromGoogleSheets = async (): Promise<Event[]> => {
  try {
    console.log('🔄 Loading events from Google Sheets...');
    
    // First test the connection
    const connectionOk = await testGoogleSheetsConnection();
    if (!connectionOk) {
      console.error('❌ Google Sheets connection failed');
      return [];
    }
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    console.log('🌐 Request URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google Sheets API error:', response.status, errorText);
      
      // Try to parse error details
      try {
        const errorData = JSON.parse(errorText);
        console.error('❌ Detailed error:', errorData);
        if (errorData.error?.message) {
          console.error('❌ Error message:', errorData.error.message);
        }
      } catch (parseError) {
        console.error('❌ Could not parse error response');
      }
      
      return [];
    }
    
    const data = await response.json();
    console.log('📊 Google Sheets response:', data);
    
    const rows = data.values || [];
    console.log('📋 Raw rows from Google Sheets:', rows.length, 'rows');
    
    if (rows.length === 0) {
      console.log('📭 No data found in Google Sheets');
      return [];
    }
    
    // Log first few rows for debugging
    console.log('📋 First 3 rows:', rows.slice(0, 3));
    
    // Skip header row (index 0)
    const events: Event[] = [];
    for (let i = 1; i < rows.length; i++) {
      const event = sheetRowToEvent(rows[i], i);
      if (event) {
        events.push(event);
      }
    }
    
    console.log('✅ Events loaded from Google Sheets:', events.length);
    console.log('📋 Loaded events summary:', events.map(e => ({ 
      id: e.id, 
      date: e.date, 
      customer: e.customerName,
      package: e.packageType 
    })));
    
    return events;
  } catch (error) {
    console.error('❌ Error loading events from Google Sheets:', error);
    
    // Log more details about the error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('❌ Network error - check internet connection');
    } else if (error instanceof Error) {
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
    }
    
    return [];
  }
};

// Save event to Google Sheets
export const saveEventToGoogleSheets = async (event: Event): Promise<boolean> => {
  try {
    console.log('💾 Saving event to Google Sheets:', event);
    
    // First test the connection
    const connectionOk = await testGoogleSheetsConnection();
    if (!connectionOk) {
      console.error('❌ Google Sheets connection failed, cannot save');
      return false;
    }
    
    const sheetRow = eventToSheetRow(event);
    console.log('📊 Sheet row data:', sheetRow);
    
    // Use append endpoint to add new row
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS&key=${API_KEY}`;
    console.log('🌐 Append URL:', url);
    
    const requestBody = {
      values: [sheetRow]
    };
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error saving to Google Sheets:', response.status, errorText);
      
      // Try to parse error details
      try {
        const errorData = JSON.parse(errorText);
        console.error('❌ Detailed error:', errorData);
        if (errorData.error?.message) {
          console.error('❌ Error message:', errorData.error.message);
          
          // Check for specific error types
          if (errorData.error.message.includes('permission')) {
            console.error('❌ Permission error - check if spreadsheet is publicly accessible');
          } else if (errorData.error.message.includes('quota')) {
            console.error('❌ Quota exceeded - API limit reached');
          } else if (errorData.error.message.includes('invalid')) {
            console.error('❌ Invalid request - check API key and spreadsheet ID');
          }
        }
        throw new Error(`Google Sheets API Error: ${errorData.error?.message || errorText}`);
      } catch (parseError) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
    }
    
    const result = await response.json();
    console.log('✅ Save response:', result);
    
    // Verify the save was successful
    if (result.updates && result.updates.updatedRows > 0) {
      console.log('✅ Confirmed: Row was added to Google Sheets');
      console.log('📊 Updated range:', result.updates.updatedRange);
      console.log('📊 Updated rows:', result.updates.updatedRows);
      console.log('📊 Updated columns:', result.updates.updatedColumns);
      console.log('📊 Updated cells:', result.updates.updatedCells);
      return true;
    } else {
      console.warn('⚠️ Warning: Save response doesn\'t confirm row addition:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Error saving event to Google Sheets:', error);
    
    // Log more details about the error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('❌ Network error - check internet connection');
    } else if (error instanceof Error) {
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
    }
    
    return false;
  }
};

// Update event in Google Sheets
export const updateEventInGoogleSheets = async (event: Event, rowIndex: number): Promise<boolean> => {
  try {
    console.log('🔄 Updating event in Google Sheets:', event, 'at row:', rowIndex);
    
    const sheetRow = eventToSheetRow(event);
    const range = `Sheet1!A${rowIndex + 1}:I${rowIndex + 1}`; // +1 because sheets are 1-indexed
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?valueInputOption=RAW&key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [sheetRow]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error updating Google Sheets:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Event updated in Google Sheets successfully:', result);
    return true;
  } catch (error) {
    console.error('❌ Error updating event in Google Sheets:', error);
    return false;
  }
};

// Delete event from Google Sheets
export const deleteEventFromGoogleSheets = async (rowIndex: number): Promise<boolean> => {
  try {
    console.log('🗑️ Deleting event from Google Sheets at row:', rowIndex);
    
    // Note: Google Sheets API doesn't have a direct delete row endpoint
    // We need to clear the row content instead
    const range = `Sheet1!A${rowIndex + 1}:I${rowIndex + 1}`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:clear?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error deleting from Google Sheets:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Event deleted from Google Sheets successfully:', result);
    return true;
  } catch (error) {
    console.error('❌ Error deleting event from Google Sheets:', error);
    return false;
  }
};
