import express from 'express';
import { Poll } from '../models/Poll.js';

const router = express.Router();

// Middleware to handle MongoDB operation timeouts
const timeoutMiddleware = async (req, res, next) => {
  req.setTimeout(30000, () => {
    res.status(408).json({ message: 'Request timeout' });
  });
  next();
};

// Get all polls
router.get('/', timeoutMiddleware, async (req, res) => {
  try {
    const polls = await Poll.find()
      .sort({ createdAt: -1 })
      .maxTimeMS(20000) // Set maximum execution time for the query
      .lean(); // Convert to plain JavaScript objects
    res.json(polls);
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ 
      message: 'Error fetching polls',
      error: error.message 
    });
  }
});

// Get specific poll
router.get('/:id', timeoutMiddleware, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id)
      .maxTimeMS(20000)
      .lean();
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    res.json(poll);
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ 
      message: 'Error fetching poll',
      error: error.message 
    });
  }
});

// Create new poll
router.post('/', timeoutMiddleware, async (req, res) => {
  try {
    const poll = new Poll({
      question: req.body.question,
      options: req.body.options.map(option => ({ text: option })),
      allowMultipleAnswers: req.body.allowMultipleAnswers || false
    });

    const newPoll = await poll.save();
    res.status(201).json(newPoll);
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(400).json({ 
      message: 'Error creating poll',
      error: error.message 
    });
  }
});

// Check if user has voted
router.get('/:id/check-vote/:userId', timeoutMiddleware, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id)
      .maxTimeMS(20000)
      .lean();
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    const voter = poll.voters.find(v => v.userId === req.params.userId);
    if (!voter) {
      return res.json({ hasVoted: false });
    }

    res.json({
      hasVoted: true,
      votedOptions: voter.votedOptions
    });
  } catch (error) {
    console.error('Error checking vote:', error);
    res.status(500).json({ 
      message: 'Error checking vote status',
      error: error.message 
    });
  }
});

// Vote on a poll
router.post('/:id/vote', timeoutMiddleware, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id)
      .maxTimeMS(20000);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    const { userId, optionIndices } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if user has already voted
    const existingVoter = poll.voters.find(v => v.userId === userId);
    if (existingVoter) {
      return res.status(400).json({ message: 'You have already voted on this poll' });
    }

    // Validate option indices
    const validIndices = optionIndices.every(index => 
      index >= 0 && index < poll.options.length
    );
    if (!validIndices) {
      return res.status(400).json({ message: 'Invalid option indices' });
    }

    // Check if multiple answers are allowed
    if (!poll.allowMultipleAnswers && optionIndices.length > 1) {
      return res.status(400).json({ message: 'Multiple answers are not allowed for this poll' });
    }

    // Increment vote counts
    optionIndices.forEach(index => {
      poll.options[index].votes += 1;
    });

    // Record voter
    poll.voters.push({
      userId,
      votedOptions: optionIndices,
      votedAt: new Date()
    });

    const updatedPoll = await poll.save();
    res.json(updatedPoll);
  } catch (error) {
    console.error('Error recording vote:', error);
    res.status(500).json({ 
      message: 'Error recording vote',
      error: error.message 
    });
  }
});

export { router as pollRoutes };
