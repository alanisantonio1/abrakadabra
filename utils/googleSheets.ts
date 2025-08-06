
import { Event } from '../types';

// Google Sheets configuration
const GOOGLE_SHEETS_API_KEY = 'AIzaSyBFupSOezwzthb-vvb3PgTcYf1GrTa3rsc';
const SPREADSHEET_ID = '13nNp7c8gSn0L3lCWHbJmHcCUZt9iUY7XUxP7SJLCh6s';
const RANGE = 'Sheet1!A:I';

// Column mapping for Google Sheets
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
    
    if (response.ok) {
      console.log('✅ Range access successful');
      console.log('📊 Found rows:', data.values ? data.values.length : 0);
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

// Test write permissions
export const testWritePermissions = async (): Promise<{ canWrite: boolean; error?: string }> => {
  try {
    console.log('🔍 Testing write permissions...');
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}:append?valueInputOption=RAW&key=${GOOGLE_SHEETS_API_KEY}`;
    
    const testData = {
      values: [['TEST_WRITE_PERMISSION', 'DELETE_THIS_ROW', '', '', '', '', '', '', '']]
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Write permissions test successful');
      return { canWrite: true };
    } else {
      console.error('❌ Write permissions test failed:', response.status, data);
      
      if (response.status === 401) {
        return { 
          canWrite: false, 
          error: 'API key no tiene permisos de escritura. Necesitas configurar OAuth2 con una cuenta de servicio.' 
        };
      } else if (response.status === 403) {
        return { 
          canWrite: false, 
          error: 'Acceso denegado. Verifica que la hoja esté compartida correctamente.' 
        };
      } else {
        return { 
          canWrite: false, 
          error: `Error ${response.status}: ${data.error?.message || 'Error desconocido'}` 
        };
      }
    }
  } catch (error) {
    console.error('❌ Error testing write permissions:', error);
    return { 
      canWrite: false, 
      error: `Error de conexión: ${error}` 
    };
  }
};

// Format date for Google Sheets
const formatDateForSheets = (dateString: string): string => {
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return dateString;
  } catch (error) {
    console.warn('⚠️ Error formatting date:', dateString, error);
    return dateString;
  }
};

// Convert Event to Google Sheets row format
const eventToSheetRow = (event: Event): string[] => {
  const formattedDate = formatDateForSheets(event.date);
  console.log('📅 Formatting event for sheets:', {
    originalDate: event.date,
    formattedDate: formattedDate,
    customerName: event.customerName,
    childName: event.childName
  });

  return [
    formattedDate,
    `${event.customerName} (${event.childName})`,
    event.customerPhone,
    event.packageType,
    event.isPaid ? 'Pagado' : 'Pendiente',
    event.deposit.toString(),
    event.totalAmount.toString(),
    event.isPaid ? formattedDate : '',
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
    time: '15:00',
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
    
    const events: Event[] = [];
    const rows = data.values.slice(1);
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
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
export const saveEventToGoogleSheets = async (event: Event): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('💾 Saving event to Google Sheets:', event.id);
    console.log('📋 Event details:', {
      date: event.date,
      customerName: event.customerName,
      childName: event.childName,
      packageType: event.packageType,
      totalAmount: event.totalAmount,
      deposit: event.deposit
    });
    
    const rowData = eventToSheetRow(event);
    console.log('📊 Row data for sheets:', rowData);
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}:append?valueInputOption=RAW&key=${GOOGLE_SHEETS_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [rowData] })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Event saved to Google Sheets successfully');
      return { success: true };
    } else {
      console.error('❌ Save failed:', response.status, data);
      
      let errorMessage = 'Error desconocido';
      
      if (response.status === 401) {
        errorMessage = 'API key no tiene permisos de escritura. Necesitas configurar OAuth2 con una cuenta de servicio.';
      } else if (response.status === 403) {
        errorMessage = 'Acceso denegado. Verifica los permisos de la hoja.';
      } else if (response.status === 400) {
        errorMessage = 'Datos inválidos o formato incorrecto.';
      } else if (data.error?.message) {
        errorMessage = data.error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    console.error('❌ Error saving event to Google Sheets:', error);
    return { success: false, error: `Error de conexión: ${error}` };
  }
};

// Update event in Google Sheets
export const updateEventInGoogleSheets = async (event: Event): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔄 Updating event in Google Sheets:', event.id);
    
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
    
    const rowNumber = eventIndex + 2;
    const range = `Sheet1!A${rowNumber}:I${rowNumber}`;
    const rowData = eventToSheetRow(event);
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?valueInputOption=RAW&key=${GOOGLE_SHEETS_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [rowData] })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Event updated in Google Sheets successfully');
      return { success: true };
    } else {
      console.error('❌ Update failed:', data);
      
      let errorMessage = 'Error desconocido';
      if (response.status === 401) {
        errorMessage = 'API key no tiene permisos de escritura.';
      } else if (response.status === 403) {
        errorMessage = 'Acceso denegado.';
      } else if (data.error?.message) {
        errorMessage = data.error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    console.error('❌ Error updating event in Google Sheets:', error);
    return { success: false, error: `Error de conexión: ${error}` };
  }
};

// Delete event from Google Sheets
export const deleteEventFromGoogleSheets = async (event: Event): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🗑️ Deleting event from Google Sheets:', event.id);
    
    const allEvents = await loadEventsFromGoogleSheets();
    const eventIndex = allEvents.findIndex(e => 
      e.date === event.date && 
      e.customerName === event.customerName && 
      e.customerPhone === event.customerPhone
    );
    
    if (eventIndex === -1) {
      console.warn('⚠️ Event not found in Google Sheets');
      return { success: false, error: 'Evento no encontrado en Google Sheets' };
    }
    
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
      return { success: true };
    } else {
      console.error('❌ Delete failed:', data);
      
      let errorMessage = 'Error desconocido';
      if (response.status === 401) {
        errorMessage = 'API key no tiene permisos de escritura.';
      } else if (response.status === 403) {
        errorMessage = 'Acceso denegado.';
      } else if (data.error?.message) {
        errorMessage = data.error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    console.error('❌ Error deleting event from Google Sheets:', error);
    return { success: false, error: `Error de conexión: ${error}` };
  }
};

// Test save functionality
export const testSaveToGoogleSheets = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🧪 Testing save functionality...');
    
    const testEvent: Event = {
      id: 'test_' + Date.now(),
      date: '2024-12-31',
      time: '15:00',
      customerName: 'Test Cliente',
      customerPhone: '+52 55 1234 5678',
      childName: 'Test Niño',
      packageType: 'Abra',
      totalAmount: 1000,
      deposit: 500,
      remainingAmount: 500,
      isPaid: false,
      notes: 'Evento de prueba - ELIMINAR',
      createdAt: new Date().toISOString()
    };
    
    const result = await saveEventToGoogleSheets(testEvent);
    console.log('🧪 Test save result:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error testing save functionality:', error);
    return { success: false, error: `Error de prueba: ${error}` };
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
    
    // Test 5: Write permissions
    diagnostics += '\n5. Probando permisos de escritura...\n';
    const writeTest = await testWritePermissions();
    diagnostics += `   - Permisos de escritura: ${writeTest.canWrite ? '✅ OK' : '❌ FALLO'}\n`;
    
    if (!writeTest.canWrite) {
      diagnostics += `   - Error: ${writeTest.error}\n`;
      diagnostics += '\n⚠️ PROBLEMA DETECTADO:\n';
      diagnostics += 'Para habilitar escritura necesitas:\n';
      diagnostics += '1. Configurar OAuth2 con cuenta de servicio, o\n';
      diagnostics += '2. Usar una API key con permisos de escritura\n';
      diagnostics += '\nMientras tanto, los eventos se guardan localmente.\n';
    } else {
      // Test 6: Test save functionality
      diagnostics += '\n6. Probando funcionalidad de guardado...\n';
      const saveTest = await testSaveToGoogleSheets();
      diagnostics += `   - Prueba de guardado: ${saveTest.success ? '✅ OK' : '❌ FALLO'}\n`;
      
      if (!saveTest.success) {
        diagnostics += `   - Error: ${saveTest.error}\n`;
      }
    }
    
    diagnostics += '\n✅ Diagnósticos completados';
    diagnostics += '\n\n📋 Configuración actual:';
    diagnostics += `\n   - Spreadsheet ID: ${SPREADSHEET_ID}`;
    diagnostics += `\n   - Rango: ${RANGE}`;
    diagnostics += `\n   - API Key: ${GOOGLE_SHEETS_API_KEY.substring(0, 10)}...`;
    
    if (!writeTest.canWrite) {
      diagnostics += '\n\n🔧 PASOS PARA HABILITAR ESCRITURA:';
      diagnostics += '\n\nOPCIÓN 1 - OAuth2 con Cuenta de Servicio (Recomendado):';
      diagnostics += '\n1. Ve a Google Cloud Console (console.cloud.google.com)';
      diagnostics += '\n2. Selecciona tu proyecto o crea uno nuevo';
      diagnostics += '\n3. Habilita la API de Google Sheets';
      diagnostics += '\n4. Ve a "Credenciales" > "Crear credenciales" > "Cuenta de servicio"';
      diagnostics += '\n5. Descarga el archivo JSON de credenciales';
      diagnostics += '\n6. Comparte tu hoja de Google Sheets con el email de la cuenta de servicio';
      diagnostics += '\n7. Actualiza el código con las credenciales completas';
      
      diagnostics += '\n\nOPCIÓN 2 - API Key con permisos de escritura:';
      diagnostics += '\n1. Ve a Google Cloud Console';
      diagnostics += '\n2. En "Credenciales", edita tu API key';
      diagnostics += '\n3. Asegúrate de que tenga permisos de escritura para Google Sheets API';
      diagnostics += '\n4. Verifica que la hoja esté compartida públicamente con permisos de edición';
    }
    
    diagnostics += '\n\n📊 ESTADO ACTUAL:';
    diagnostics += '\n✅ Lectura desde Google Sheets: Funcionando';
    diagnostics += `\n${writeTest.canWrite ? '✅' : '❌'} Escritura a Google Sheets: ${writeTest.canWrite ? 'Funcionando' : 'No disponible'}`;
    diagnostics += '\n✅ Almacenamiento local: Funcionando como respaldo';
    
    return diagnostics;
  } catch (error) {
    return `❌ Error en diagnósticos: ${error}`;
  }
};
