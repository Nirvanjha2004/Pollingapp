export const config = {
  mongoUri: process.env.MONGODB_URI,
  port: process.env.PORT || 5000,
  clientUrl: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : 'http://localhost:5173'
};
