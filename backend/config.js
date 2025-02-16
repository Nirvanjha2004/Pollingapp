const requiredEnvVars = ['MONGODB_URI'];

// Check for required environment variables
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`Error: Environment variable ${envVar} is required but not set.`);
    process.exit(1);
  }
});

export const config = {
  mongoUri: process.env.MONGODB_URI,
  port: process.env.PORT || 5000,
  clientUrl: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : 'http://localhost:5173',
  isDevelopment: process.env.NODE_ENV !== 'production'
};
