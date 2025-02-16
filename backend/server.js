import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { pollRoutes } from './routes/polls.js';

// Load environment variables before importing config
dotenv.config();

import { config } from './config.js';

// Verify MongoDB URI
console.log('MongoDB URI:', config.mongoUri ? 'is set' : 'is not set');

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://pollingapp-git-main-nirvan-jhas-projects.vercel.app',
  'https://pollingapp-nirvan-jhas-projects.vercel.app',
  'https://pollingapp.vercel.app',
  'https://pollingapp-zbpb7uqlb-nirvan-jhas-projects.vercel.app',
  '*'
];

// CORS middleware with detailed logging
app.use(cors({
  origin: function(origin, callback) {
    console.log('Request from origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('No origin specified, allowing request');
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('Origin not allowed:', origin);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    
    console.log('Origin allowed:', origin);
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Add headers middleware for additional CORS support
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// MongoDB connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Timeout after 30 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds
  family: 4 // Use IPv4, skip trying IPv6
};

// Connect to MongoDB with retry logic
const connectWithRetry = async () => {
  try {
    if (!config.mongoUri) {
      throw new Error('MONGODB_URI is not set in environment variables');
    }
    await mongoose.connect(config.mongoUri, mongooseOptions);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// Initial connection
connectWithRetry();

// Handle MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  connectWithRetry();
});

// Routes
app.use('/api/polls', pollRoutes);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
