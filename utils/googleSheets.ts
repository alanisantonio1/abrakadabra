
import { Event } from '../types';

// Google Sheets configuration
const GOOGLE_SHEETS_API_KEY = '8aff616a2f0872fb097d6217fa4685715601daf5'; // From the user's configuration
const SPREADSHEET_ID = '13nNp7c8gSn0L3lCWHbJmHcCUZt9iUY7XUxP7SJLCh6s'; // From the user's configuration
const RANGE = 'Sheet1!A:I'; // Updated to match the documentation

// Column mapping for Google Sheets (based on the documentation)
const COLUMNS = {
  FECHA: 0,           // A
  NOMBRE: 1,          // B
  TELEFONO: 2,        // C
  PAQUETE: 3,         // D
  ESTADO: 4,          // E
  ANTICIPO_PAGADO: 5, // F
  TOTAL_EVENTO: 6,    // G
  FECHA_PAGO: 7,      // H
  NOTIFICADO_LUNES: 8 // I
};

// Test Google Sheets connection
export const testGoogleSheetsConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testing Google Sheets connection...');
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${GOOGLE_SHEETS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok && data.properties) {
      console.log('✅ Google Sheets connection successful');
      console.log('📊 Spreadsheet title:', data.properties.title);
      return true;
    } else {
      console.error('❌ Google Sheets connection failed:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing Google Sheets connection:', error);
    return false;
  }
};

// Get spreadsheet information
export const getSpreadsheetInfo = async (): Promise<any> => {
  try {
    console.log('📊 Getting spreadsheet info...');
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${GOOGLE_SHEETS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Spreadsheet info retrieved');
      return data;
    } else {
      console.error('❌ Error getting spreadsheet info:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting spreadsheet info:', error);
    return null;
  }
};

// Test range access
export const testRangeAccess = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testing range access...');
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${GOOGLE_SHEETS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok && data.values) {
      console.log('✅ Range access successful');
      console.log('📊 Found rows:', data.values.length);
      return true;
    } else {
      console.error('❌ Range access failed:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing range access:', error);
    return false;
  }
};

// Convert Event to Google Sheets row format
const eventToSheetRow = (event: Event): string[] => {
  return [
    event.date,
    `${event.customerName} (${event.childName})`,
    event.customerPhone,
    event.packageType,
    event.isPaid ? 'Pagado' : 'Pendiente',
    event.deposit.toString(),
    event.totalAmount.toString(),
    event.isPaid ? event.date : '',
    'No'
  ];
};

// Convert Google Sheets row to Event
const sheetRowToEvent = (row: any[], index: number): Event | null => {
  if (!row || row.length < 4) return null;

  const rawName = row[COLUMNS.NOMBRE] ?? '';
  const nameMatch = rawName.match(/^(.+?)\s*\((.+?)\)$/);

  return {
    id: `sheet_${index}_${Date.now()}`,
    date: row[COLUMNS.FECHA] ?? '',
    time: '15:00', // Default time since it's not stored in the sheet
    customerName: nameMatch ? nameMatch[1].trim() : rawName,
    childName: nameMatch ? nameMatch[2].trim() : '',
    customerPhone: row[COLUMNS.TELEFONO] ?? '',
    packageType: (row[COLUMNS.PAQUETE] as 'Abra' | 'Kadabra' | 'Abrakadabra') ?? 'Abra',
    totalAmount: parseFloat(row[COLUMNS.TOTAL_EVENTO] ?? '0'),
    deposit: parseFloat(row[COLUMNS.ANTICIPO_PAGADO] ?? '0'),
    remainingAmount: parseFloat(row[COLUMNS.TOTAL_EVENTO] ?? '0') - parseFloat(row[COLUMNS.ANTICIPO_PAGADO] ?? '0'),
    isPaid: String(row[COLUMNS.ESTADO] ?? '').toLowerCase() === 'pagado',
    notes: '',
    createdAt: new Date().toISOString()
  };
};

// Load events from Google Sheets
export const loadEventsFromGoogleSheets = async (): Promise<Event[]> => {
  try {
    console.log('📥 Loading events from Google Sheets...');
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${GOOGLE_SHEETS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Error loading from Google Sheets:', data);
      return [];
    }
    
    if (!data.values || data.values.length <= 1) {
      console.log('📊 No events found in Google Sheets');
      return [];
    }
    
    // Skip header row and convert to events
    const events: Event[] = [];
    const rows = data.values.slice(1); // Skip header
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      // Skip empty rows
      if (!row[COLUMNS.FECHA] || !row[COLUMNS.NOMBRE]) {
        continue;
      }
      
      try {
        const event = sheetRowToEvent(row, i);
        if (event) {
          events.push(event);
        }
      } catch (error) {
        console.warn('⚠️ Error parsing row:', i, error);
      }
    }
    
    console.log('✅ Loaded events from Google Sheets:', events.length);
    return events;
  } catch (error) {
    console.error('❌ Error loading events from Google Sheets:', error);
    return [];
  }
};

// Save event to Google Sheets
export const saveEventToGoogleSheets = async (event: Event): Promise<boolean> => {
  try {
    console.log('💾 Saving event to Google Sheets:', event.id);
    
    // Prepare row data
    const rowData = eventToSheetRow(event);
    
    // Use append API to add new row
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}:append?valueInputOption=RAW&key=${GOOGLE_SHEETS_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowData]
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Event saved to Google Sheets successfully');
      return true;
    } else {
      console.error('❌ Error saving to Google Sheets:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error saving event to Google Sheets:', error);
    return false;
  }
};

// Update event in Google Sheets (find and replace)
export const updateEventInGoogleSheets = async (event: Event): Promise<boolean> => {
  try {
    console.log('🔄 Updating event in Google Sheets:', event.id);
    
    // First, load all events to find the row
    const allEvents = await loadEventsFromGoogleSheets();
    const eventIndex = allEvents.findIndex(e => 
      e.date === event.date && 
      e.customerName === event.customerName && 
      e.customerPhone === event.customerPhone
    );
    
    if (eventIndex === -1) {
      console.warn('⚠️ Event not found in Google Sheets, adding as new');
      return await saveEventToGoogleSheets(event);
    }
    
    // Calculate actual row number (add 2: 1 for header, 1 for 0-based index)
    const rowNumber = eventIndex + 2;
    const range = `Sheet1!A${rowNumber}:I${rowNumber}`;
    
    // Prepare row data
    const rowData = eventToSheetRow(event);
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?valueInputOption=RAW&key=${GOOGLE_SHEETS_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowData]
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Event updated in Google Sheets successfully');
      return true;
    } else {
      console.error('❌ Error updating in Google Sheets:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error updating event in Google Sheets:', error);
    return false;
  }
};

// Delete event from Google Sheets (clear row)
export const deleteEventFromGoogleSheets = async (event: Event): Promise<boolean> => {
  try {
    console.log('🗑️ Deleting event from Google Sheets:', event.id);
    
    // First, load all events to find the row
    const allEvents = await loadEventsFromGoogleSheets();
    const eventIndex = allEvents.findIndex(e => 
      e.date === event.date && 
      e.customerName === event.customerName && 
      e.customerPhone === event.customerPhone
    );
    
    if (eventIndex === -1) {
      console.warn('⚠️ Event not found in Google Sheets');
      return false;
    }
    
    // Calculate actual row number (add 2: 1 for header, 1 for 0-based index)
    const rowNumber = eventIndex + 2;
    const range = `Sheet1!A${rowNumber}:I${rowNumber}`;
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:clear?key=${GOOGLE_SHEETS_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Event deleted from Google Sheets successfully');
      return true;
    } else {
      console.error('❌ Error deleting from Google Sheets:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error deleting event from Google Sheets:', error);
    return false;
  }
};

// Run diagnostics for Google Sheets
export const runGoogleSheetsDiagnostics = async (): Promise<string> => {
  try {
    console.log('🧪 Running Google Sheets diagnostics...');
    
    let diagnostics = '🔍 DIAGNÓSTICOS GOOGLE SHEETS\n\n';
    
    // Test 1: Basic connection
    const connectionTest = await testGoogleSheetsConnection();
    diagnostics += `1. Conexión básica: ${connectionTest ? '✅ OK' : '❌ FALLO'}\n`;
    
    if (!connectionTest) {
      diagnostics += '   - Verifica la API key y el ID de la hoja\n';
      diagnostics += `   - API Key: ${GOOGLE_SHEETS_API_KEY.substring(0, 10)}...\n`;
      diagnostics += `   - Spreadsheet ID: ${SPREADSHEET_ID}\n`;
      return diagnostics;
    }
    
    // Test 2: Spreadsheet info
    const info = await getSpreadsheetInfo();
    if (info) {
      diagnostics += `2. Información de la hoja: ✅ OK\n`;
      diagnostics += `   - Título: ${info.properties?.title || 'N/A'}\n`;
    } else {
      diagnostics += `2. Información de la hoja: ❌ FALLO\n`;
    }
    
    // Test 3: Range access
    const rangeTest = await testRangeAccess();
    diagnostics += `3. Acceso al rango: ${rangeTest ? '✅ OK' : '❌ FALLO'}\n`;
    
    if (!rangeTest) {
      diagnostics += '   - Verifica que el rango existe y es accesible\n';
      diagnostics += `   - Rango: ${RANGE}\n`;
      return diagnostics;
    }
    
    // Test 4: Load events
    const events = await loadEventsFromGoogleSheets();
    diagnostics += `4. Carga de eventos: ✅ OK\n`;
    diagnostics += `   - Eventos encontrados: ${events.length}\n`;
    
    if (events.length === 0) {
      diagnostics += '   - No hay eventos en la hoja o están en formato incorrecto\n';
      diagnostics += '   - Verifica que las columnas sean: Fecha, Nombre, Teléfono, Paquete, Estado, AnticipoPagado, TotalEvento, FechaPago, NotificadoLunes\n';
    } else {
      diagnostics += `   - Último evento: ${events[events.length - 1].customerName} - ${events[events.length - 1].date}\n`;
    }
    
    diagnostics += '\n✅ Diagnósticos completados';
    diagnostics += '\n\n📋 Configuración actual:';
    diagnostics += `\n   - Spreadsheet ID: ${SPREADSHEET_ID}`;
    diagnostics += `\n   - Rango: ${RANGE}`;
    diagnostics += `\n   - API Key: ${GOOGLE_SHEETS_API_KEY.substring(0, 10)}...`;
    
    return diagnostics;
  } catch (error) {
    return `❌ Error en diagnósticos: ${error}`;
  }
};
