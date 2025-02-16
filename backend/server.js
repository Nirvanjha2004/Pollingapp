import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { pollRoutes } from './routes/polls.js';
import { config } from './config.js';

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: config.clientUrl,
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Connect to MongoDB
mongoose.connect(config.mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/polls', pollRoutes);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
