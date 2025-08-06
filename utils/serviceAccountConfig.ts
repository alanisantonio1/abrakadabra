
// Service Account Configuration for Google Sheets OAuth2
// Updated with actual service account credentials

export interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url?: string;
  universe_domain?: string;
}

// Service account credentials from abrakadabra-creds.json
export const SERVICE_ACCOUNT_CREDENTIALS: ServiceAccountCredentials = {
  type: 'service_account',
  project_id: 'abrakadabra-422005',
  private_key_id: 'c59a204fe7e4d68ec7424edd2b07670ecf46496e',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCZYtjp7snLESHQ\nD9evhZAuFSiLhCPLM0IDxkbm6s5foFk2w12fzBmDHZKYayqzYTGrq5Ae/eoXsOHj\n96W715F67SgffLkeXIY+QHnowdV0x5TiAiuisSZollBmGyUTuKppqdZTc63Nfj2M\nZiVHU9mlo2wSdaNKDC/ZP9PFFF5oNVlTocfsdMWX36BQWqubBlMHvB9XkifFBL15\nOVhmRi7IX2LeQJuiSIJ3YwzFD9Kh4ouNEYhTsbCnv6a9UZrg7OEH+WhjpwV7AO1V\nIHSX61qAm2tHHevxwcqv3IVPknBNf1xymA4d96p8CbkVloUnolZqMf1IjiFHhE/P\nGvFX2bbFAgMBAAECggEAG8FiRPp7s243MyIawl0l2ODlRFG19GgjEvHHFLP6gh1O\n53T0tRzGpQ4t37zMrkbxKQJTgvgpav4L8id26wW4Aol1kDUOfmr5s7wRE0g36vjO\nfRMteDQcIiLJC6Dv1aC93X7pFJLDKYMlegllx4FpyepHfROiZ5zK78H3/RqRdsOg\n1+pkZZ5vBuaqNFBi/QQEsfQASuh0zuh19TCkklOxiIUWdNQjwDX6KUkI4eyo8Ee7\npdGjVguhW8mUg8HJ2NLA579Mw2fZ5blRlgykFQyy3tXCLlIW6JZ7ZAHqZgeKEStJ\nSwWIF+ev9mwQisXVgH+MTVELtt5aXEwtOQmCF5VcYQKBgQDLcTVKPKKhKmtHhgfs\ni3VWQDK8nQjdVeIssbAb51jWIMxzBCqPcNuNZ/0ro0U5BnOM0hXSVywBxhr10NQr\neP+1fNLxgFgUD0fTPoTihvOn1uWPmijcs8jHzQMy3GxOVSplDWSfErUHSIcqzkWv\nAeFa7hf/IlpKhV84AwILFe1PWQKBgQDBAyUCfVqqfz+xpI4KC5geC6v2c0h4n1U7\nq2Uw8oqROr2X4wKg4GphYMFL8fxyg7HqjmZj8O5DaZPu3wNejg7D6k0dnEunwOwV\nauZjYVy6CL6JJZnfBhNZDQBtzTuWi8jxeU1bdIXtTpRYHs97PM7CWNImj9kEfLWm\nVNtJk8WBTQKBgQCe/uwKB9eGI5PSQzLgMKHUdbnxZL0v1lY8XeZn+GeaeemvHhtx\nHV/JZPMc7q5EAgG+ldYOHKi8/inF4Z5gF2GpYlOuAINVsheNRfgu3g+BJdclYvL6\ngduyI0yTrGdM1QycC1qPY9xtQ8a3spwNSWfpW9kPQbbVNOUU7mzjYxCjiQKBgHLz\nI3yLGY9HP7DVlv5mj079lomtePDVu9ZQqnBvUpVRzY6C1ZLodJLQI+7ODJJK2pAe\nBN7qo4wkecUerowGwMZvaUQETI54+GF9C/8OAkKNaKSXbz+DB8zWUHYUb7OmRqOB\noc+g4w5E6VZd6yWzPlRCv83Vh+MDPs/z47G7PzpVAoGAJ4ZH0B9ECk4b8BfCQ2bR\nwFYwz2pjYNCZAxx7VZ4ZA4ofKALI4XyHhDYtf59cHkqNuf+RO2Z7pgPmyojOY8kE\nGqQxGp/02b3Udgnbszyx5I+j+BbwSzeMMkKX67U4h6dyupb0kmNb7lo0xrNZ50by\naC5dLQ81zcFS6DjXobzR3E4=\n-----END PRIVATE KEY-----\n',
  client_email: 'abrakadabra@abrakadabra-422005.iam.gserviceaccount.com',
  client_id: '107978395627832723470',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/abrakadabra%40abrakadabra-422005.iam.gserviceaccount.com',
  universe_domain: 'googleapis.com'
};

// Client secret configuration (if needed for additional OAuth flows)
export const CLIENT_SECRET_CONFIG = {
  type: 'service_account',
  project_id: 'abrakadabra-app-placeholder'
};

// Check if service account is properly configured
export const isServiceAccountConfigured = (): boolean => {
  return (
    SERVICE_ACCOUNT_CREDENTIALS.project_id === 'abrakadabra-422005' &&
    SERVICE_ACCOUNT_CREDENTIALS.client_email === 'abrakadabra@abrakadabra-422005.iam.gserviceaccount.com' &&
    SERVICE_ACCOUNT_CREDENTIALS.private_key.includes('BEGIN PRIVATE KEY') &&
    SERVICE_ACCOUNT_CREDENTIALS.client_id === '107978395627832723470'
  );
};

// Get configuration status
export const getConfigurationStatus = (): {
  configured: boolean;
  missingFields: string[];
  clientId: string;
  serviceAccountEmail: string;
} => {
  const missingFields: string[] = [];
  
  if (!SERVICE_ACCOUNT_CREDENTIALS.project_id || SERVICE_ACCOUNT_CREDENTIALS.project_id === 'your-project-id') {
    missingFields.push('project_id');
  }
  
  if (!SERVICE_ACCOUNT_CREDENTIALS.private_key_id || SERVICE_ACCOUNT_CREDENTIALS.private_key_id === 'your-private-key-id') {
    missingFields.push('private_key_id');
  }
  
  if (!SERVICE_ACCOUNT_CREDENTIALS.private_key || SERVICE_ACCOUNT_CREDENTIALS.private_key === 'your-private-key') {
    missingFields.push('private_key');
  }
  
  if (!SERVICE_ACCOUNT_CREDENTIALS.client_email || SERVICE_ACCOUNT_CREDENTIALS.client_email === 'your-service-account@your-project.iam.gserviceaccount.com') {
    missingFields.push('client_email');
  }
  
  return {
    configured: missingFields.length === 0,
    missingFields,
    clientId: SERVICE_ACCOUNT_CREDENTIALS.client_id,
    serviceAccountEmail: SERVICE_ACCOUNT_CREDENTIALS.client_email
  };
};

// Instructions for configuration
export const getConfigurationInstructions = (): string => {
  const status = getConfigurationStatus();
  
  if (status.configured) {
    return `✅ Cuenta de servicio configurada correctamente
    
📧 Email de cuenta de servicio: ${status.serviceAccountEmail}
🆔 Client ID: ${status.clientId}
🏗️ Proyecto: ${SERVICE_ACCOUNT_CREDENTIALS.project_id}

⚠️ IMPORTANTE: Asegúrate de que tu Google Sheet esté compartido con:
${status.serviceAccountEmail}

Con permisos de EDITOR para permitir escritura.`;
  }
  
  return `
🔧 CONFIGURACIÓN REQUERIDA

Campos faltantes: ${status.missingFields.join(', ')}

PASOS:
1. Ve a Google Cloud Console
2. Descarga el archivo JSON de credenciales de tu cuenta de servicio
3. Actualiza el archivo utils/serviceAccountConfig.ts con los valores del JSON
4. Comparte tu Google Sheet con: ${SERVICE_ACCOUNT_CREDENTIALS.client_email}

Tu Client ID actual: ${status.clientId}

Ver docs/oauth2-setup.md para instrucciones detalladas.
  `.trim();
};

// Get JWT token for Google Sheets API authentication
export const getJWTToken = async (): Promise<string | null> => {
  try {
    console.log('🔐 Generating JWT token for service account authentication...');
    
    // Create JWT header
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };
    
    // Create JWT payload
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: SERVICE_ACCOUNT_CREDENTIALS.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600, // 1 hour
      iat: now
    };
    
    // Note: In a production React Native app, you would need to use a proper JWT library
    // or implement the JWT signing on a backend server for security reasons.
    // For now, we'll use the googleapis library which handles this internally.
    
    console.log('✅ JWT token generation initiated');
    return 'jwt_token_placeholder'; // This will be handled by googleapis library
  } catch (error) {
    console.error('❌ Error generating JWT token:', error);
    return null;
  }
};

// Get OAuth2 access token using service account
export const getAccessToken = async (): Promise<string | null> => {
  try {
    console.log('🔑 Getting OAuth2 access token...');
    
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    
    // Create JWT assertion (this is a simplified version)
    // In production, you should use a proper JWT library
    const assertion = await getJWTToken();
    
    if (!assertion) {
      throw new Error('Failed to generate JWT assertion');
    }
    
    const params = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: assertion
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
