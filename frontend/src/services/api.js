import axios from 'axios';
import { config } from '../config';

// Create axios instance with default config
const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add request interceptor for error handling
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network Error - Please check your connection or the API server status');
    }
    return Promise.reject(error);
  }
);

// API functions
export const pollsApi = {
  // Get all polls
  getPolls: async () => {
    try {
      const response = await api.get('/api/polls');
      return response.data;
    } catch (error) {
      console.error('Error fetching polls:', error);
      throw error;
    }
  },

  // Get specific poll
  getPoll: async (id) => {
    try {
      const response = await api.get(`/api/polls/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching poll:', error);
      throw error;
    }
  },

  // Create new poll
  createPoll: async (pollData) => {
    try {
      const response = await api.post('/api/polls', pollData);
      return response.data;
    } catch (error) {
      console.error('Error creating poll:', error);
      throw error;
    }
  },

  // Vote on a poll
  votePoll: async (pollId, voteData) => {
    try {
      const response = await api.post(`/api/polls/${pollId}/vote`, voteData);
      return response.data;
    } catch (error) {
      console.error('Error voting on poll:', error);
      throw error;
    }
  },

  // Check if user has voted
  checkVote: async (pollId, userId) => {
    try {
      const response = await api.get(`/api/polls/${pollId}/check-vote/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking vote:', error);
      throw error;
    }
  }
};
