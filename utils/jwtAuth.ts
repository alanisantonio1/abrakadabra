
import { SERVICE_ACCOUNT_CREDENTIALS } from './serviceAccountConfig';

// Simple base64 URL encoding (without padding)
const base64UrlEncode = (str: string): string => {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

// Create JWT header
const createJWTHeader = (): string => {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };
  return base64UrlEncode(JSON.stringify(header));
};

// Create JWT payload
const createJWTPayload = (): string => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: SERVICE_ACCOUNT_CREDENTIALS.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600, // 1 hour
    iat: now
  };
  return base64UrlEncode(JSON.stringify(payload));
};

// Simple RSA-SHA256 signature simulation
// Note: This is a simplified version. In production, you should use a proper JWT library
// or handle JWT signing on a backend server for security reasons.
const createSignature = async (data: string): Promise<string> => {
  try {
    // For React Native, we'll use a simplified approach
    // In a real implementation, you would use the private key to sign the data
    
    // For now, we'll create a mock signature
    // This should be replaced with proper RSA-SHA256 signing
    const mockSignature = btoa(data + SERVICE_ACCOUNT_CREDENTIALS.private_key_id);
    return base64UrlEncode(mockSignature);
  } catch (error) {
    console.error('❌ Error creating signature:', error);
    throw error;
  }
};

// Create JWT token
export const createJWT = async (): Promise<string> => {
  try {
    console.log('🔐 Creating JWT token for service account...');
    
    const header = createJWTHeader();
    const payload = createJWTPayload();
    const unsignedToken = `${header}.${payload}`;
    
    // In a production app, you would properly sign this with the private key
    // For now, we'll use a simplified approach
    const signature = await createSignature(unsignedToken);
    
    const jwt = `${unsignedToken}.${signature}`;
    
    console.log('✅ JWT token created');
    return jwt;
  } catch (error) {
    console.error('❌ Error creating JWT:', error);
    throw error;
  }
};

// Get OAuth2 access token using JWT
export const getAccessTokenWithJWT = async (): Promise<string | null> => {
  try {
    console.log('🔑 Getting access token with JWT...');
    
    // For React Native, we'll use a different approach
    // Instead of creating our own JWT, we'll use the service account credentials
    // in a way that's compatible with Google's OAuth2 flow
    
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    
    // Use the service account credentials directly
    const params = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: await createJWT()
    });
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });
    
    const data = await response.json();
    
    if (response.ok && data.access_token) {
      console.log('✅ Access token obtained successfully');
      return data.access_token;
    } else {
      console.error('❌ Failed to get access token:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting access token:', error);
    return null;
  }
};

// Alternative approach: Use service account email as bearer token
// This is a simplified approach for React Native
export const getServiceAccountToken = (): string => {
  // For Google Sheets API with service accounts, we can use the client_email
  // as an identifier, but we need proper OAuth2 flow
  return SERVICE_ACCOUNT_CREDENTIALS.client_email;
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

// Get authentication headers for Google Sheets API
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  try {
    if (!canUseServiceAccount()) {
      throw new Error('Service account not properly configured');
    }
    
    // For now, we'll use a simplified approach
    // In production, you should implement proper JWT signing
    return {
      'Authorization': `Bearer ${SERVICE_ACCOUNT_CREDENTIALS.client_email}`,
      'Content-Type': 'application/json'
    };
  } catch (error) {
    console.error('❌ Error getting auth headers:', error);
    throw error;
  }
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
  
  return {
    valid: errors.length === 0,
    errors
  };
};
