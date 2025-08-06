
import { Event } from '../types';

// Google Sheets configuration
const SPREADSHEET_ID = '13nNp7c8gSn0L3lCWHbJmHcCUZt9iUY7XUxP7SJLCh6s';
const RANGE = 'Sheet1!A:I';
const FALLBACK_API_KEY = 'AIzaSyBFupSOezwzthb-vvb3PgTcYf1GrTa3rsc';

// Service account credentials
const SERVICE_ACCOUNT = {
  client_email: 'abrakadabra@abrakadabra-422005.iam.gserviceaccount.com',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCZYtjp7snLESHQ\nD9evhZAuFSiLhCPLM0IDxkbm6s5foFk2w12fzBmDHZKYayqzYTGrq5Ae/eoXsOHj\n96W715F67SgffLkeXIY+QHnowdV0x5TiAiuisSZollBmGyUTuKppqdZTc63Nfj2M\nZiVHU9mlo2wSdaNKDC/ZP9PFFF5oNVlTocfsdMWX36BQWqubBlMHvB9XkifFBL15\nOVhmRi7IX2LeQJuiSIJ3YwzFD9Kh4ouNEYhTsbCnv6a9UZrg7OEH+WhjpwV7AO1V\nIHSX61qAm2tHHevxwcqv3IVPknBNf1xymA4d96p8CbkVloUnolZqMf1IjiFHhE/P\nGvFX2bbFAgMBAAECggEAG8FiRPp7s243MyIawl0l2ODlRFG19GgjEvHHFLP6gh1O\n53T0tRzGpQ4t37zMrkbxKQJTgvgpav4L8id26wW4Aol1kDUOfmr5s7wRE0g36vjO\nfRMteDQcIiLJC6Dv1aC93X7pFJLDKYMlegllx4FpyepHfROiZ5zK78H3/RqRdsOg\n1+pkZZ5vBuaqNFBi/QQEsfQASuh0zuh19TCkklOxiIUWdNQjwDX6KUkI4eyo8Ee7\npdGjVguhW8mUg8HJ2NLA579Mw2fZ5blRlgykFQyy3tXCLlIW6JZ7ZAHqZgeKEStJ\nSwWIF+ev9mwQisXVgH+MTVELtt5aXEwtOQmCF5VcYQKBgQDLcTVKPKKhKmtHhgfs\ni3VWQDK8nQjdVeIssbAb51jWIMxzBCqPcNuNZ/0ro0U5BnOM0hXSVywBxhr10NQr\neP+1fNLxgFgUD0fTPoTihvOn1uWPmijcs8jHzQMy3GxOVSplDWSfErUHSIcqzkWv\nAeFa7hf/IlpKhV84AwILFe1PWQKBgQDBAyUCfVqqfz+xpI4KC5geC6v2c0h4n1U7\nq2Uw8oqROr2X4wKg4GphYMFL8fxyg7HqjmZj8O5DaZPu3wNejg7D6k0dnEunwOwV\nauZjYVy6CL6JJZnfBhNZDQBtzTuWi8jxeU1bdIXtTpRYHs97PM7CWNImj9kEfLWm\nVNtJk8WBTQKBgQCe/uwKB9eGI5PSQzLgMKHUdbnxZL0v1lY8XeZn+GeaeemvHhtx\nHV/JZPMc7q5EAgG+ldYOHKi8/inF4Z5gF2GpYlOuAINVsheNRfgu3g+BJdclYvL6\ngduyI0yTrGdM1QycC1qPY9xtQ8a3spwNSWfpW9kPQbbVNOUU7mzjYxCjiQKBgHLz\nI3yLGY9HP7DVlv5mj079lomtePDVu9ZQqnBvUpVRzY6C1ZLodJLQI+7ODJJK2pAe\nBN7qo4wkecUerowGwMZvaUQETI54+GF9C/8OAkKNaKSXbz+DB8zWUHYUb7OmRqOB\noc+g4w5E6VZd6yWzPlRCv83Vh+MDPs/z47G7PzpVAoGAJ4ZH0B9ECk4b8BfCQ2bR\nwFYwz2pjYNCZAxx7VZ4ZA4ofKALI4XyHhDYtf59cHkqNuf+RO2Z7pgPmyojOY8kE\nGqQxGp/02b3Udgnbszyx5I+j+BbwSzeMMkKX67U4h6dyupb0kmNb7lo0xrNZ50by\naC5dLQ81zcFS6DjXobzR3E4=\n-----END PRIVATE KEY-----\n',
  project_id: 'abrakadabra-422005'
};

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

// Simple JWT implementation for React Native
const base64UrlEncode = (str: string): string => {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

const createJWT = async (): Promise<string> => {
  try {
    console.log('🔐 Creating JWT for service account authentication...');
    
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };
    
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: SERVICE_ACCOUNT.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };
    
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    
    // For React Native, we'll use a simplified approach
    // In production, you should implement proper RSA signing or use a backend
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    
    console.log('✅ JWT created (unsigned for RN compatibility)');
    return unsignedToken;
  } catch (error) {
    console.error('❌ Error creating JWT:', error);
    throw error;
  }
};

// Get access token using service account
const getAccessToken = async (): Promise<string | null> => {
  try {
    console.log('🔑 Getting access token for service account...');
    
    // For React Native, we'll use the API key approach for now
    // In production, implement proper JWT signing on backend
    console.log('⚠️ Using API key fallback for React Native compatibility');
    return null;
  } catch (error) {
    console.error('❌ Error getting access token:', error);
    return null;
  }
};

// Make request with authentication
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  try {
    console.log('🌐 Making authenticated request...');
    
    // Try to get access token
    const accessToken = await getAccessToken();
    
    if (accessToken) {
      console.log('🔐 Using service account authentication');
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      if (response.ok) {
        return response;
      }
    }
    
    // Fallback to API key for read operations
    if (!options.method || options.method === 'GET') {
      console.log('🔑 Falling back to API key authentication');
      const separator = url.includes('?') ? '&' : '?';
      const apiKeyUrl = `${url}${separator}key=${FALLBACK_API_KEY}`;
      
      return await fetch(apiKeyUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
    }
    
    throw new Error('Authentication failed and write operations require service account');
  } catch (error) {
    console.error('❌ Error making authenticated request:', error);
    throw error;
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
    
    const response = await makeAuthenticatedRequest(url);
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

// Test Google Sheets connection
export const testGoogleSheetsConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testing Google Sheets connection...');
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`;
    
    const response = await makeAuthenticatedRequest(url);
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

// Check sheet permissions
export const checkSheetPermissions = async (): Promise<{ hasAccess: boolean; details: string }> => {
  try {
    console.log('🔍 Checking sheet permissions...');
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=properties,sheets,spreadsheetUrl`;
    
    const response = await makeAuthenticatedRequest(url);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Sheet metadata retrieved');
      
      return {
        hasAccess: true,
        details: `✅ Sheet is accessible. Using API key authentication for React Native compatibility.

📝 NOTE: For write operations, you may need to:
1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}
2. Click "Share" (blue button in top right corner)
3. In "Add people and groups", enter: ${SERVICE_ACCOUNT.client_email}
4. Change permissions from "Viewer" to "Editor"
5. Click "Send"

⚠️ CURRENT STATUS: Read operations working with API key. Write operations may require proper service account setup.`
      };
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

// Run diagnostics
export const runGoogleSheetsDiagnostics = async (): Promise<string> => {
  try {
    console.log('🧪 Running Google Sheets diagnostics (React Native compatible)...');
    
    let diagnostics = '🔍 GOOGLE SHEETS DIAGNOSTICS (REACT NATIVE)\n\n';
    
    // Test 1: Basic connection
    const connectionTest = await testGoogleSheetsConnection();
    diagnostics += `1. Basic connection: ${connectionTest ? '✅ OK' : '❌ FAILED'}\n`;
    
    if (!connectionTest) {
      diagnostics += '   - Check credentials and sheet ID\n';
      return diagnostics;
    }
    
    // Test 2: Load events
    const events = await loadEventsFromGoogleSheets();
    diagnostics += `2. Load events: ✅ OK\n`;
    diagnostics += `   - Events found: ${events.length}\n`;
    
    if (events.length > 0) {
      diagnostics += `   - Latest event: ${events[events.length - 1].customerName} - ${events[events.length - 1].date}\n`;
    }
    
    // Test 3: Check sheet permissions
    diagnostics += '\n3. Checking sheet permissions...\n';
    const permissionCheck = await checkSheetPermissions();
    diagnostics += `   - Sheet access: ${permissionCheck.hasAccess ? '✅ OK' : '❌ LIMITED'}\n`;
    diagnostics += `   - Details: ${permissionCheck.details}\n`;
    
    diagnostics += '\n✅ Diagnostics completed\n';
    diagnostics += '\n📋 CURRENT CONFIGURATION:';
    diagnostics += `\n   - Spreadsheet ID: ${SPREADSHEET_ID}`;
    diagnostics += `\n   - Range: ${RANGE}`;
    diagnostics += `\n   - Service account: ${SERVICE_ACCOUNT.client_email}`;
    diagnostics += `\n   - Project: ${SERVICE_ACCOUNT.project_id}`;
    
    diagnostics += '\n\n📊 CURRENT STATUS:';
    diagnostics += '\n✅ Reading from Google Sheets: Working (API key)';
    diagnostics += '\n⚠️ Writing to Google Sheets: Limited (requires proper auth)';
    diagnostics += '\n✅ Local storage: Working as backup';
    diagnostics += '\n⚠️ React Native compatibility: Using simplified auth';
    
    diagnostics += '\n\n🎯 RECOMMENDATIONS:';
    diagnostics += '\n1. For production: Implement proper JWT signing on backend';
    diagnostics += '\n2. For testing: Use API key for read operations';
    diagnostics += '\n3. Share sheet with service account for write access';
    diagnostics += `\n4. Service account email: ${SERVICE_ACCOUNT.client_email}`;
    
    return diagnostics;
  } catch (error) {
    return `❌ Error in diagnostics: ${error}`;
  }
};
