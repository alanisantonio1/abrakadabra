
// Service Account Configuration for Google Sheets OAuth2
// This file should be updated with your actual service account credentials

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
}

// TODO: Replace with your actual service account credentials
// Download the JSON file from Google Cloud Console and copy the values here
export const SERVICE_ACCOUNT_CREDENTIALS: ServiceAccountCredentials = {
  type: 'service_account',
  project_id: 'your-project-id', // Replace with your project ID
  private_key_id: 'your-private-key-id', // Replace with your private key ID
  private_key: 'your-private-key', // Replace with your private key
  client_email: 'your-service-account@your-project.iam.gserviceaccount.com', // Replace with your service account email
  client_id: '107978395627832723470', // Your OAuth2 Client ID
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs'
};

// Check if service account is properly configured
export const isServiceAccountConfigured = (): boolean => {
  return (
    SERVICE_ACCOUNT_CREDENTIALS.project_id !== 'your-project-id' &&
    SERVICE_ACCOUNT_CREDENTIALS.private_key_id !== 'your-private-key-id' &&
    SERVICE_ACCOUNT_CREDENTIALS.private_key !== 'your-private-key' &&
    SERVICE_ACCOUNT_CREDENTIALS.client_email !== 'your-service-account@your-project.iam.gserviceaccount.com'
  );
};

// Get configuration status
export const getConfigurationStatus = (): {
  configured: boolean;
  missingFields: string[];
  clientId: string;
} => {
  const missingFields: string[] = [];
  
  if (SERVICE_ACCOUNT_CREDENTIALS.project_id === 'your-project-id') {
    missingFields.push('project_id');
  }
  
  if (SERVICE_ACCOUNT_CREDENTIALS.private_key_id === 'your-private-key-id') {
    missingFields.push('private_key_id');
  }
  
  if (SERVICE_ACCOUNT_CREDENTIALS.private_key === 'your-private-key') {
    missingFields.push('private_key');
  }
  
  if (SERVICE_ACCOUNT_CREDENTIALS.client_email === 'your-service-account@your-project.iam.gserviceaccount.com') {
    missingFields.push('client_email');
  }
  
  return {
    configured: missingFields.length === 0,
    missingFields,
    clientId: SERVICE_ACCOUNT_CREDENTIALS.client_id
  };
};

// Instructions for configuration
export const getConfigurationInstructions = (): string => {
  const status = getConfigurationStatus();
  
  if (status.configured) {
    return '✅ Cuenta de servicio configurada correctamente';
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
