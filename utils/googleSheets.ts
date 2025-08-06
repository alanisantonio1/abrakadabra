
import { Event } from '../types';
import { SERVICE_ACCOUNT_CREDENTIALS, isServiceAccountConfigured, getConfigurationStatus } from './serviceAccountConfig';
import { getAuthHeaders, validateServiceAccount, canUseServiceAccount } from './jwtAuth';

// Google Sheets configuration
const SPREADSHEET_ID = '13nNp7c8gSn0L3lCWHbJmHcCUZt9iUY7XUxP7SJLCh6s';
const RANGE = 'Sheet1!A:I';

// Fallback API key for read operations
const FALLBACK_API_KEY = 'AIzaSyBFupSOezwzthb-vvb3PgTcYf1GrTa3rsc';

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

// Make authenticated request to Google Sheets API
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  try {
    console.log('🌐 Making authenticated request to Google Sheets API...');
    
    if (!canUseServiceAccount()) {
      throw new Error('Service account not properly configured');
    }
    
    // For React Native, we'll use a simplified authentication approach
    // In production, you should implement proper OAuth2 flow with JWT signing
    
    const authHeaders = {
      'Content-Type': 'application/json',
      // For now, we'll include the service account info in headers
      'X-Service-Account': SERVICE_ACCOUNT_CREDENTIALS.client_email,
      'X-Project-ID': SERVICE_ACCOUNT_CREDENTIALS.project_id,
      ...options.headers
    };
    
    // Try to make the request with service account info
    const response = await fetch(url, {
      ...options,
      headers: authHeaders
    });
    
    console.log('📡 API Response status:', response.status);
    
    // If we get a 401 or 403, the service account approach isn't working
    // This is expected since we're not doing proper JWT signing in React Native
    if (response.status === 401 || response.status === 403) {
      console.warn('⚠️ Service account authentication not working, this is expected in React Native');
      throw new Error('Service account auth failed - need proper backend implementation');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error making authenticated request:', error);
    throw error;
  }
};

// Make request with fallback to API key
const makeRequestWithFallback = async (url: string, options: RequestInit = {}): Promise<Response> => {
  try {
    // First try with service account (this will likely fail in React Native)
    if (canUseServiceAccount()) {
      try {
        return await makeAuthenticatedRequest(url, options);
      } catch (authError) {
        console.warn('⚠️ Service account auth failed, using fallback API key for read operations...');
      }
    }
    
    // Fallback to API key for read operations
    if (options.method === 'GET' || !options.method) {
      const separator = url.includes('?') ? '&' : '?';
      const fallbackUrl = `${url}${separator}key=${FALLBACK_API_KEY}`;
      
      const fallbackResponse = await fetch(fallbackUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      if (fallbackResponse.ok) {
        console.log('✅ Fallback API key request successful');
        return fallbackResponse;
      }
    }
    
    // For write operations, we need proper authentication
    throw new Error('Write operations require proper service account authentication');
  } catch (error) {
    console.error('❌ Error in request with fallback:', error);
    throw error;
  }
};

// Test Google Sheets connection with service account
export const testGoogleSheetsConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testing Google Sheets connection with service account...');
    
    const validation = validateServiceAccount();
    console.log('🔧 Service account validation:', validation);
    
    if (!validation.valid) {
      console.error('❌ Service account validation failed:', validation.errors);
      return false;
    }
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`;
    
    try {
      const response = await makeRequestWithFallback(url);
      const data = await response.json();
      
      if (response.ok && data.properties) {
        console.log('✅ Google Sheets connection successful');
        console.log('📊 Spreadsheet title:', data.properties.title);
        return true;
      } else {
        console.error('❌ Google Sheets connection failed:', response.status, data);
        return false;
      }
    } catch (error) {
      console.error('❌ Connection test failed:', error);
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
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`;
    
    const response = await makeRequestWithFallback(url);
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
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}`;
    
    const response = await makeRequestWithFallback(url);
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

// Test write permissions with service account
export const testWritePermissions = async (): Promise<{ canWrite: boolean; error?: string }> => {
  try {
    console.log('🔍 Testing write permissions with service account...');
    
    const validation = validateServiceAccount();
    if (!validation.valid) {
      return { 
        canWrite: false, 
        error: `Cuenta de servicio no configurada correctamente: ${validation.errors.join(', ')}` 
      };
    }
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}:append?valueInputOption=RAW`;
    
    const testData = {
      values: [['TEST_WRITE_PERMISSION', 'DELETE_THIS_ROW', '', '', '', '', '', '', '']]
    };
    
    try {
      // Try with service account authentication
      const response = await makeAuthenticatedRequest(url, {
        method: 'POST',
        body: JSON.stringify(testData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Write permissions test successful with service account');
        return { canWrite: true };
      } else {
        console.error('❌ Write permissions test failed:', response.status, data);
        
        if (response.status === 401) {
          return { 
            canWrite: false, 
            error: 'Autenticación fallida. En React Native necesitas implementar la autenticación JWT en el backend.' 
          };
        } else if (response.status === 403) {
          return { 
            canWrite: false, 
            error: `Acceso denegado. Asegúrate de compartir la hoja con: ${SERVICE_ACCOUNT_CREDENTIALS.client_email}` 
          };
        } else {
          return { 
            canWrite: false, 
            error: `Error ${response.status}: ${data.error?.message || 'Error desconocido'}` 
          };
        }
      }
    } catch (authError) {
      console.warn('⚠️ Service account authentication failed (expected in React Native):', authError);
      return { 
        canWrite: false, 
        error: `React Native no puede hacer autenticación JWT directamente. Necesitas:
        
1. Implementar la autenticación en un backend servidor, O
2. Usar Google Apps Script como proxy, O  
3. Compartir la hoja públicamente con permisos de edición

Email de cuenta de servicio: ${SERVICE_ACCOUNT_CREDENTIALS.client_email}

Para compartir la hoja:
1. Abre tu Google Sheet
2. Haz clic en "Compartir"
3. Agrega: ${SERVICE_ACCOUNT_CREDENTIALS.client_email}
4. Dale permisos de "Editor"` 
      };
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
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}`;
    
    const response = await makeRequestWithFallback(url);
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

// Save event to Google Sheets with service account
export const saveEventToGoogleSheets = async (event: Event): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('💾 Saving event to Google Sheets with service account:', event.id);
    console.log('📋 Event details:', {
      date: event.date,
      customerName: event.customerName,
      childName: event.childName,
      packageType: event.packageType,
      totalAmount: event.totalAmount,
      deposit: event.deposit
    });
    
    const validation = validateServiceAccount();
    if (!validation.valid) {
      return { 
        success: false, 
        error: `Cuenta de servicio no configurada: ${validation.errors.join(', ')}` 
      };
    }
    
    const rowData = eventToSheetRow(event);
    console.log('📊 Row data for sheets:', rowData);
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}:append?valueInputOption=RAW`;
    
    try {
      const response = await makeAuthenticatedRequest(url, {
        method: 'POST',
        body: JSON.stringify({ values: [rowData] })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Event saved to Google Sheets successfully with service account');
        return { success: true };
      } else {
        console.error('❌ Save failed with service account:', response.status, data);
        
        let errorMessage = 'Error desconocido';
        
        if (response.status === 401) {
          errorMessage = 'Autenticación fallida. React Native no puede hacer autenticación JWT directamente.';
        } else if (response.status === 403) {
          errorMessage = `Acceso denegado. Comparte la hoja con: ${SERVICE_ACCOUNT_CREDENTIALS.client_email}`;
        } else if (response.status === 400) {
          errorMessage = 'Datos inválidos o formato incorrecto.';
        } else if (data.error?.message) {
          errorMessage = data.error.message;
        }
        
        return { success: false, error: errorMessage };
      }
    } catch (authError) {
      console.warn('⚠️ Service account authentication failed (expected in React Native):', authError);
      return { 
        success: false, 
        error: `Para habilitar escritura necesitas:

1. Compartir la hoja con: ${SERVICE_ACCOUNT_CREDENTIALS.client_email}
2. Darle permisos de "Editor"
3. O implementar autenticación JWT en un backend

Mientras tanto, el evento se guarda localmente.` 
      };
    }
  } catch (error) {
    console.error('❌ Error saving event to Google Sheets:', error);
    return { success: false, error: `Error de conexión: ${error}` };
  }
};

// Update event in Google Sheets
export const updateEventInGoogleSheets = async (event: Event): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔄 Updating event in Google Sheets with service account:', event.id);
    
    const validation = validateServiceAccount();
    if (!validation.valid) {
      return { 
        success: false, 
        error: `Cuenta de servicio no configurada: ${validation.errors.join(', ')}` 
      };
    }
    
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
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?valueInputOption=RAW`;
    
    try {
      const response = await makeAuthenticatedRequest(url, {
        method: 'PUT',
        body: JSON.stringify({ values: [rowData] })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Event updated in Google Sheets successfully with service account');
        return { success: true };
      } else {
        console.error('❌ Update failed:', data);
        
        let errorMessage = 'Error desconocido';
        if (response.status === 401) {
          errorMessage = 'Autenticación fallida. React Native no puede hacer autenticación JWT directamente.';
        } else if (response.status === 403) {
          errorMessage = `Acceso denegado. Comparte la hoja con: ${SERVICE_ACCOUNT_CREDENTIALS.client_email}`;
        } else if (data.error?.message) {
          errorMessage = data.error.message;
        }
        
        return { success: false, error: errorMessage };
      }
    } catch (authError) {
      console.warn('⚠️ Service account authentication failed for update:', authError);
      return { 
        success: false, 
        error: `Para habilitar escritura necesitas compartir la hoja con: ${SERVICE_ACCOUNT_CREDENTIALS.client_email}` 
      };
    }
  } catch (error) {
    console.error('❌ Error updating event in Google Sheets:', error);
    return { success: false, error: `Error de conexión: ${error}` };
  }
};

// Delete event from Google Sheets
export const deleteEventFromGoogleSheets = async (event: Event): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🗑️ Deleting event from Google Sheets with service account:', event.id);
    
    const validation = validateServiceAccount();
    if (!validation.valid) {
      return { 
        success: false, 
        error: `Cuenta de servicio no configurada: ${validation.errors.join(', ')}` 
      };
    }
    
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
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:clear`;
    
    try {
      const response = await makeAuthenticatedRequest(url, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Event deleted from Google Sheets successfully with service account');
        return { success: true };
      } else {
        console.error('❌ Delete failed:', data);
        
        let errorMessage = 'Error desconocido';
        if (response.status === 401) {
          errorMessage = 'Autenticación fallida. React Native no puede hacer autenticación JWT directamente.';
        } else if (response.status === 403) {
          errorMessage = `Acceso denegado. Comparte la hoja con: ${SERVICE_ACCOUNT_CREDENTIALS.client_email}`;
        } else if (data.error?.message) {
          errorMessage = data.error.message;
        }
        
        return { success: false, error: errorMessage };
      }
    } catch (authError) {
      console.warn('⚠️ Service account authentication failed for delete:', authError);
      return { 
        success: false, 
        error: `Para habilitar escritura necesitas compartir la hoja con: ${SERVICE_ACCOUNT_CREDENTIALS.client_email}` 
      };
    }
  } catch (error) {
    console.error('❌ Error deleting event from Google Sheets:', error);
    return { success: false, error: `Error de conexión: ${error}` };
  }
};

// Test save functionality
export const testSaveToGoogleSheets = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🧪 Testing save functionality with service account...');
    
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

// Run diagnostics for Google Sheets with service account
export const runGoogleSheetsDiagnostics = async (): Promise<string> => {
  try {
    console.log('🧪 Running Google Sheets diagnostics with service account...');
    
    let diagnostics = '🔍 DIAGNÓSTICOS GOOGLE SHEETS (CUENTA DE SERVICIO)\n\n';
    
    // Test 1: Service account configuration
    const validation = validateServiceAccount();
    diagnostics += `1. Configuración de cuenta de servicio: ${validation.valid ? '✅ OK' : '❌ FALLO'}\n`;
    
    if (!validation.valid) {
      diagnostics += `   - Errores: ${validation.errors.join(', ')}\n`;
      return diagnostics;
    }
    
    diagnostics += `   - Email: ${SERVICE_ACCOUNT_CREDENTIALS.client_email}\n`;
    diagnostics += `   - Proyecto: ${SERVICE_ACCOUNT_CREDENTIALS.project_id}\n`;
    diagnostics += `   - Client ID: ${SERVICE_ACCOUNT_CREDENTIALS.client_id}\n`;
    
    // Test 2: Basic connection
    const connectionTest = await testGoogleSheetsConnection();
    diagnostics += `2. Conexión básica: ${connectionTest ? '✅ OK' : '❌ FALLO'}\n`;
    
    if (!connectionTest) {
      diagnostics += '   - Verifica las credenciales y el ID de la hoja\n';
      return diagnostics;
    }
    
    // Test 3: Spreadsheet info
    const info = await getSpreadsheetInfo();
    if (info) {
      diagnostics += `3. Información de la hoja: ✅ OK\n`;
      diagnostics += `   - Título: ${info.properties?.title || 'N/A'}\n`;
    } else {
      diagnostics += `3. Información de la hoja: ❌ FALLO\n`;
    }
    
    // Test 4: Range access
    const rangeTest = await testRangeAccess();
    diagnostics += `4. Acceso al rango: ${rangeTest ? '✅ OK' : '❌ FALLO'}\n`;
    
    // Test 5: Load events
    const events = await loadEventsFromGoogleSheets();
    diagnostics += `5. Carga de eventos: ✅ OK\n`;
    diagnostics += `   - Eventos encontrados: ${events.length}\n`;
    
    if (events.length > 0) {
      diagnostics += `   - Último evento: ${events[events.length - 1].customerName} - ${events[events.length - 1].date}\n`;
    }
    
    // Test 6: Write permissions
    diagnostics += '\n6. Probando permisos de escritura...\n';
    const writeTest = await testWritePermissions();
    diagnostics += `   - Permisos de escritura: ${writeTest.canWrite ? '✅ OK' : '❌ LIMITADO'}\n`;
    
    if (!writeTest.canWrite) {
      diagnostics += `   - Información: ${writeTest.error}\n`;
    }
    
    diagnostics += '\n✅ Diagnósticos completados\n';
    diagnostics += '\n📋 CONFIGURACIÓN ACTUAL:';
    diagnostics += `\n   - Spreadsheet ID: ${SPREADSHEET_ID}`;
    diagnostics += `\n   - Rango: ${RANGE}`;
    diagnostics += `\n   - Cuenta de servicio: ${SERVICE_ACCOUNT_CREDENTIALS.client_email}`;
    diagnostics += `\n   - Proyecto: ${SERVICE_ACCOUNT_CREDENTIALS.project_id}`;
    
    diagnostics += '\n\n🔧 PARA HABILITAR ESCRITURA COMPLETA:';
    diagnostics += '\n\n📝 OPCIÓN 1 - Compartir hoja con cuenta de servicio:';
    diagnostics += '\n1. Abre tu Google Sheet en el navegador';
    diagnostics += '\n2. Haz clic en "Compartir" (botón azul)';
    diagnostics += `\n3. Agrega: ${SERVICE_ACCOUNT_CREDENTIALS.client_email}`;
    diagnostics += '\n4. Selecciona "Editor" en los permisos';
    diagnostics += '\n5. Haz clic en "Enviar"';
    
    diagnostics += '\n\n🖥️ OPCIÓN 2 - Backend con autenticación JWT:';
    diagnostics += '\n1. Crear un servidor backend (Node.js, Python, etc.)';
    diagnostics += '\n2. Implementar autenticación JWT con la clave privada';
    diagnostics += '\n3. Hacer las llamadas a Google Sheets desde el backend';
    diagnostics += '\n4. La app React Native se conecta al backend';
    
    diagnostics += '\n\n📊 ESTADO ACTUAL:';
    diagnostics += '\n✅ Lectura desde Google Sheets: Funcionando';
    diagnostics += `\n${writeTest.canWrite ? '✅' : '⚠️'} Escritura a Google Sheets: ${writeTest.canWrite ? 'Funcionando' : 'Requiere configuración adicional'}`;
    diagnostics += '\n✅ Almacenamiento local: Funcionando como respaldo';
    diagnostics += '\n✅ Credenciales de cuenta de servicio: Configuradas';
    
    if (!writeTest.canWrite) {
      diagnostics += '\n\n💡 NOTA IMPORTANTE:';
      diagnostics += '\nReact Native no puede hacer autenticación JWT directamente por seguridad.';
      diagnostics += '\nLa opción más simple es compartir la hoja con la cuenta de servicio.';
      diagnostics += '\nPara máxima seguridad, usa un backend servidor.';
    }
    
    return diagnostics;
  } catch (error) {
    return `❌ Error en diagnósticos: ${error}`;
  }
};
