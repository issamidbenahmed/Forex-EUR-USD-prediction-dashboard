// This file can be replaced during build by using the `fileReplacements` array.
// For a production build, you can create environment.prod.ts with production values.

export const environment = {
  production: false,
  
  // API Keys - Remplacez ces valeurs par vos clés API réelles
  twelveDataApiKey: 'your_twelve_data_api_key_here',
  geminiApiKey: 'your_gemini_api_key_here',
  
  // API URLs
  twelveDataBaseUrl: 'https://api.twelvedata.com',
  geminiApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  
  // Backend API
  backendApiUrl: 'http://localhost:5000/api'
};

