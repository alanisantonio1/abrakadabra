
import { GoogleAuth } from 'google-auth-library';
import { SERVICE_ACCOUNT_CREDENTIALS } from './serviceAccountConfig';

// Initialize Google Auth with service account credentials
let googleAuth: GoogleAuth | null = null;

const initializeGoogleAuth = (): GoogleAuth => {
  if (!googleAuth) {
    console.log('🔐 Initializing Google Auth with service account...');
    
    googleAuth = new GoogleAuth({
      credentials: SERVICE_ACCOUNT_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    console.log('✅ Google Auth initialized');
  }
  
  return googleAuth;
};

// Get access token using google-auth-library
export const getAccessToken = async (): Promise<string | null> => {
  try {
    console.log('🔑 Getting access token with google-auth-library...');
    
    const auth = initializeGoogleAuth();
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    if (accessToken.token) {
      console.log('✅ Access token obtained successfully');
      return accessToken.token;
    } else {
      console.error('❌ No access token received');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting access token:', error);
    return null;
  }
};

// Get authentication headers for Google Sheets API
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  try {
    console.log('🔐 Getting authentication headers...');
    
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      throw new Error('Failed to get access token');
    }
    
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
  } catch (error) {
    console.error('❌ Error getting auth headers:', error);
    throw error;
  }
};

// Check if we can use service account authentication
export const canUseServiceAccount = (): boolean => {
  return !!(
    SERVICE_ACCOUNT_CREDENTIALS.client_email &&
    SERVICE_ACCOUNT_CREDENTIALS.private_key &&
    SERVICE_ACCOUNT_CREDENTIALS.project_id &&
    SERVICE_ACCOUNT_CREDENTIALS.client_id
  );
};

// Validate service account configuration
export const validateServiceAccount = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!SERVICE_ACCOUNT_CREDENTIALS.client_email) {
    errors.push('client_email is missing');
  }
  
  if (!SERVICE_ACCOUNT_CREDENTIALS.private_key) {
    errors.push('private_key is missing');
  }
  
  if (!SERVICE_ACCOUNT_CREDENTIALS.project_id) {
    errors.push('project_id is missing');
  }
  
  if (!SERVICE_ACCOUNT_CREDENTIALS.client_id) {
    errors.push('client_id is missing');
  }
  
  if (!SERVICE_ACCOUNT_CREDENTIALS.private_key_id) {
    errors.push('private_key_id is missing');
  }
  
  // Validate private key format
  if (SERVICE_ACCOUNT_CREDENTIALS.private_key && 
      !SERVICE_ACCOUNT_CREDENTIALS.private_key.includes('BEGIN PRIVATE KEY')) {
    errors.push('private_key format is invalid');
  }
  
  // Validate email format
  if (SERVICE_ACCOUNT_CREDENTIALS.client_email && 
      !SERVICE_ACCOUNT_CREDENTIALS.client_email.includes('@') &&
      !SERVICE_ACCOUNT_CREDENTIALS.client_email.includes('.iam.gserviceaccount.com')) {
    errors.push('client_email format is invalid');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Test authentication
export const testAuthentication = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🧪 Testing Google authentication...');
    
    const validation = validateServiceAccount();
    if (!validation.valid) {
      return {
        success: false,
        error: `Service account configuration invalid: ${validation.errors.join(', ')}`
      };
    }
    
    const accessToken = await getAccessToken();
    
    if (accessToken) {
      console.log('✅ Authentication test successful');
      return { success: true };
    } else {
      return {
        success: false,
        error: 'Failed to obtain access token'
      };
    }
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    return {
      success: false,
      error: `Authentication failed: ${error}`
    };
  }
};
