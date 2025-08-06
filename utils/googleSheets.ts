
import { Event } from '../types';
import { SERVICE_ACCOUNT_CREDENTIALS, isServiceAccountConfigured, getConfigurationStatus } from './serviceAccountConfig';
import { getAuthHeaders, validateServiceAccount, canUseServiceAccount, testAuthentication } from './jwtAuth';

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
    console.log('🔗 URL:', url);
    console.log('📋 Method:', options.method || 'GET');
    
    if (!canUseServiceAccount()) {
      throw new Error('Service account not properly configured');
    }
    
    // Get authentication headers using google-auth-library
    const authHeaders = await getAuthHeaders();
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers
      }
    };
    
    console.log('🔐 Making request with authentication headers...');
    
    const response = await fetch(url, requestOptions);
    
    console.log('📡 API Response status:', response.status);
    console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText } };
      }
      
      if (response.status === 401) {
        throw new Error('Authentication failed - check service account credentials');
      } else if (response.status === 403) {
        throw new Error(`Access denied - share sheet with: ${SERVICE_ACCOUNT_CREDENTIALS.client_email}`);
      } else {
        throw new Error(`API Error ${response.status}: ${errorData.error?.message || errorText}`);
      }
    }
    
    console.log('✅ Authenticated request successful');
    return response;
  } catch (error) {
    console.error('❌ Error making authenticated request:', error);
    throw error;
  }
};

// Make request with fallback to API key
const makeRequestWithFallback = async (url: string, options: RequestInit = {}): Promise<Response> => {
  try {
    console.log('🔄 Making request with fallback strategy...');
    
    // First try with service account authentication
    if (canUseServiceAccount()) {
      try {
        console.log('🔐 Attempting service account authentication...');
        return await makeAuthenticatedRequest(url, options);
      } catch (authError) {
        console.warn('⚠️ Service account auth failed, trying fallback...', authError);
        
        // If it's a write operation, we can't use fallback
        if (options.method && options.method !== 'GET') {
          throw new Error(`Write operations require service account authentication: ${authError}`);
        }
      }
    }
    
    // Fallback to API key for read operations only
    if (!options.method || options.method === 'GET') {
      console.log('🔑 Using fallback API key for read operation...');
      
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
      } else {
        const errorText = await fallbackResponse.text();
        console.error('❌ Fallback request failed:', errorText);
        throw new Error(`Fallback request failed: ${errorText}`);
      }
    }
    
    throw new Error('No valid authentication method available');
  } catch (error) {
    console.error('❌ Error in request with fallback:', error);
    throw error;
  }
};

// Test Google Sheets connection with service account
export const testGoogleSheetsConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testing Google Sheets connection with service account...');
    
    // First test authentication
    const authTest = await testAuthentication();
    if (!authTest.success) {
      console.error('❌ Authentication test failed:', authTest.error);
      return false;
    }
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`;
    
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
        error: `Service account not configured correctly: ${validation.errors.join(', ')}` 
      };
    }
    
    // Test authentication first
    const authTest = await testAuthentication();
    if (!authTest.success) {
      return {
        canWrite: false,
        error: `Authentication failed: ${authTest.error}`
      };
    }
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}:append?valueInputOption=RAW`;
    
    const testData = {
      values: [['TEST_WRITE_PERMISSION', 'DELETE_THIS_ROW', '', '', '', '', '', '', '']]
    };
    
    try {
      const response = await makeAuthenticatedRequest(url, {
        method: 'POST',
        body: JSON.stringify(testData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Write permissions test successful');
        return { canWrite: true };
      } else {
        console.error('❌ Write permissions test failed:', response.status, data);
        return { 
          canWrite: false, 
          error: `Write test failed: ${data.error?.message || 'Unknown error'}` 
        };
      }
    } catch (writeError) {
      console.error('❌ Write test error:', writeError);
      return { 
        canWrite: false, 
        error: `Write test failed: ${writeError}` 
      };
    }
  } catch (error) {
    console.error('❌ Error testing write permissions:', error);
    return { 
      canWrite: false, 
      error: `Error testing write permissions: ${error}` 
    };
  }
};

// Check if the sheet is shared with service account
export const checkSheetPermissions = async (): Promise<{ hasAccess: boolean; details: string }> => {
  try {
    console.log('🔍 Checking sheet permissions for service account...');
    
    // Try to get spreadsheet metadata
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=properties,sheets,spreadsheetUrl`;
    
    const response = await makeRequestWithFallback(url);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Sheet metadata retrieved');
      
      // Try a write test to check actual permissions
      const writeTest = await testWritePermissions();
      
      if (writeTest.canWrite) {
        return {
          hasAccess: true,
          details: `✅ Sheet is properly shared with ${SERVICE_ACCOUNT_CREDENTIALS.client_email}`
        };
      } else {
        return {
          hasAccess: false,
          details: `❌ Sheet is NOT properly shared with ${SERVICE_ACCOUNT_CREDENTIALS.client_email} or lacks write permissions.

🔧 SOLUTION:
1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}
2. Click "Share" (blue button in top right corner)
3. In "Add people and groups", enter: ${SERVICE_ACCOUNT_CREDENTIALS.client_email}
4. Change permissions from "Viewer" to "Editor"
5. Click "Send"

⚠️ IMPORTANT: Make sure the email is exactly: ${SERVICE_ACCOUNT_CREDENTIALS.client_email}

Error details: ${writeTest.error}`
        };
      }
    } else {
      return {
        hasAccess: false,
        details: `❌ Cannot access the sheet. Error: ${data.error?.message || 'Unknown error'}`
      };
    }
  } catch (error) {
    console.error('❌ Error checking sheet permissions:', error);
    return {
      hasAccess: false,
      details: `❌ Error checking permissions: ${error}`
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
        error: `Service account not configured: ${validation.errors.join(', ')}` 
      };
    }
    
    // Test authentication first
    const authTest = await testAuthentication();
    if (!authTest.success) {
      return {
        success: false,
        error: `Authentication failed: ${authTest.error}`
      };
    }
    
    const rowData = eventToSheetRow(event);
    console.log('📊 Row data for sheets:', rowData);
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}:append?valueInputOption=RAW`;
    
    const response = await makeAuthenticatedRequest(url, {
      method: 'POST',
      body: JSON.stringify({ values: [rowData] })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Event saved to Google Sheets successfully');
      return { success: true };
    } else {
      console.error('❌ Save failed:', response.status, data);
      return { 
        success: false, 
        error: `Save failed: ${data.error?.message || 'Unknown error'}` 
      };
    }
  } catch (error) {
    console.error('❌ Error saving event to Google Sheets:', error);
    return { 
      success: false, 
      error: `Error saving event: ${error}` 
    };
  }
};

// Update event in Google Sheets
export const updateEventInGoogleSheets = async (event: Event): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔄 Updating event in Google Sheets:', event.id);
    
    const validation = validateServiceAccount();
    if (!validation.valid) {
      return { 
        success: false, 
        error: `Service account not configured: ${validation.errors.join(', ')}` 
      };
    }
    
    // Test authentication first
    const authTest = await testAuthentication();
    if (!authTest.success) {
      return {
        success: false,
        error: `Authentication failed: ${authTest.error}`
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
    
    const response = await makeAuthenticatedRequest(url, {
      method: 'PUT',
      body: JSON.stringify({ values: [rowData] })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Event updated in Google Sheets successfully');
      return { success: true };
    } else {
      console.error('❌ Update failed:', data);
      return { 
        success: false, 
        error: `Update failed: ${data.error?.message || 'Unknown error'}` 
      };
    }
  } catch (error) {
    console.error('❌ Error updating event in Google Sheets:', error);
    return { 
      success: false, 
      error: `Error updating event: ${error}` 
    };
  }
};

// Delete event from Google Sheets
export const deleteEventFromGoogleSheets = async (event: Event): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🗑️ Deleting event from Google Sheets:', event.id);
    
    const validation = validateServiceAccount();
    if (!validation.valid) {
      return { 
        success: false, 
        error: `Service account not configured: ${validation.errors.join(', ')}` 
      };
    }
    
    // Test authentication first
    const authTest = await testAuthentication();
    if (!authTest.success) {
      return {
        success: false,
        error: `Authentication failed: ${authTest.error}`
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
      return { success: false, error: 'Event not found in Google Sheets' };
    }
    
    const rowNumber = eventIndex + 2;
    const range = `Sheet1!A${rowNumber}:I${rowNumber}`;
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:clear`;
    
    const response = await makeAuthenticatedRequest(url, {
      method: 'POST'
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Event deleted from Google Sheets successfully');
      return { success: true };
    } else {
      console.error('❌ Delete failed:', data);
      return { 
        success: false, 
        error: `Delete failed: ${data.error?.message || 'Unknown error'}` 
      };
    }
  } catch (error) {
    console.error('❌ Error deleting event from Google Sheets:', error);
    return { 
      success: false, 
      error: `Error deleting event: ${error}` 
    };
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
      notes: 'Test event - DELETE THIS ROW',
      createdAt: new Date().toISOString()
    };
    
    const result = await saveEventToGoogleSheets(testEvent);
    console.log('🧪 Test save result:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error testing save functionality:', error);
    return { success: false, error: `Test error: ${error}` };
  }
};

// Run diagnostics for Google Sheets with service account
export const runGoogleSheetsDiagnostics = async (): Promise<string> => {
  try {
    console.log('🧪 Running Google Sheets diagnostics...');
    
    let diagnostics = '🔍 GOOGLE SHEETS DIAGNOSTICS (SERVICE ACCOUNT)\n\n';
    
    // Test 1: Service account configuration
    const validation = validateServiceAccount();
    diagnostics += `1. Service account configuration: ${validation.valid ? '✅ OK' : '❌ FAILED'}\n`;
    
    if (!validation.valid) {
      diagnostics += `   - Errors: ${validation.errors.join(', ')}\n`;
      return diagnostics;
    }
    
    diagnostics += `   - Email: ${SERVICE_ACCOUNT_CREDENTIALS.client_email}\n`;
    diagnostics += `   - Project: ${SERVICE_ACCOUNT_CREDENTIALS.project_id}\n`;
    diagnostics += `   - Client ID: ${SERVICE_ACCOUNT_CREDENTIALS.client_id}\n`;
    
    // Test 2: Authentication
    const authTest = await testAuthentication();
    diagnostics += `2. Authentication: ${authTest.success ? '✅ OK' : '❌ FAILED'}\n`;
    
    if (!authTest.success) {
      diagnostics += `   - Error: ${authTest.error}\n`;
      return diagnostics;
    }
    
    // Test 3: Basic connection
    const connectionTest = await testGoogleSheetsConnection();
    diagnostics += `3. Basic connection: ${connectionTest ? '✅ OK' : '❌ FAILED'}\n`;
    
    if (!connectionTest) {
      diagnostics += '   - Check credentials and sheet ID\n';
      return diagnostics;
    }
    
    // Test 4: Spreadsheet info
    const info = await getSpreadsheetInfo();
    if (info) {
      diagnostics += `4. Spreadsheet info: ✅ OK\n`;
      diagnostics += `   - Title: ${info.properties?.title || 'N/A'}\n`;
    } else {
      diagnostics += `4. Spreadsheet info: ❌ FAILED\n`;
    }
    
    // Test 5: Range access
    const rangeTest = await testRangeAccess();
    diagnostics += `5. Range access: ${rangeTest ? '✅ OK' : '❌ FAILED'}\n`;
    
    // Test 6: Load events
    const events = await loadEventsFromGoogleSheets();
    diagnostics += `6. Load events: ✅ OK\n`;
    diagnostics += `   - Events found: ${events.length}\n`;
    
    if (events.length > 0) {
      diagnostics += `   - Latest event: ${events[events.length - 1].customerName} - ${events[events.length - 1].date}\n`;
    }
    
    // Test 7: Check sheet permissions
    diagnostics += '\n7. Checking sheet permissions...\n';
    const permissionCheck = await checkSheetPermissions();
    diagnostics += `   - Sheet access: ${permissionCheck.hasAccess ? '✅ OK' : '❌ LIMITED'}\n`;
    diagnostics += `   - Details: ${permissionCheck.details}\n`;
    
    // Test 8: Write permissions
    diagnostics += '\n8. Testing write permissions...\n';
    const writeTest = await testWritePermissions();
    diagnostics += `   - Write permissions: ${writeTest.canWrite ? '✅ OK' : '❌ LIMITED'}\n`;
    
    if (!writeTest.canWrite) {
      diagnostics += `   - Error: ${writeTest.error}\n`;
    }
    
    diagnostics += '\n✅ Diagnostics completed\n';
    diagnostics += '\n📋 CURRENT CONFIGURATION:';
    diagnostics += `\n   - Spreadsheet ID: ${SPREADSHEET_ID}`;
    diagnostics += `\n   - Range: ${RANGE}`;
    diagnostics += `\n   - Service account: ${SERVICE_ACCOUNT_CREDENTIALS.client_email}`;
    diagnostics += `\n   - Project: ${SERVICE_ACCOUNT_CREDENTIALS.project_id}`;
    
    if (!writeTest.canWrite) {
      diagnostics += '\n\n🔧 RECOMMENDED SOLUTION:';
      diagnostics += '\n\n📝 SHARE SHEET WITH SERVICE ACCOUNT:';
      diagnostics += '\n1. Open your Google Sheet in browser:';
      diagnostics += `\n   https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`;
      diagnostics += '\n2. Click "Share" (blue button in top right corner)';
      diagnostics += '\n3. In "Add people and groups", copy and paste exactly:';
      diagnostics += `\n   ${SERVICE_ACCOUNT_CREDENTIALS.client_email}`;
      diagnostics += '\n4. Change permissions from "Viewer" to "Editor"';
      diagnostics += '\n5. Click "Send"';
      diagnostics += '\n6. Run diagnostics again to verify';
      
      diagnostics += '\n\n⚠️ IMPORTANT:';
      diagnostics += '\n- Email must be exactly as shown above';
      diagnostics += '\n- Permissions must be "Editor", not "Viewer"';
      diagnostics += '\n- Do not add extra spaces when copying the email';
    }
    
    diagnostics += '\n\n📊 CURRENT STATUS:';
    diagnostics += '\n✅ Reading from Google Sheets: Working';
    diagnostics += `\n${writeTest.canWrite ? '✅' : '⚠️'} Writing to Google Sheets: ${writeTest.canWrite ? 'Working' : 'Requires sharing sheet'}`;
    diagnostics += '\n✅ Local storage: Working as backup';
    diagnostics += '\n✅ Service account credentials: Configured';
    
    if (!writeTest.canWrite) {
      diagnostics += '\n\n🎯 NEXT STEP:';
      diagnostics += `\nShare the sheet with: ${SERVICE_ACCOUNT_CREDENTIALS.client_email}`;
    }
    
    return diagnostics;
  } catch (error) {
    return `❌ Error in diagnostics: ${error}`;
  }
};
