import express from 'express';
import { Poll } from '../models/Poll.js';

const router = express.Router();

// Get all polls
router.get('/', async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific poll
router.get('/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new poll
router.post('/', async (req, res) => {
  const poll = new Poll({
    question: req.body.question,
    options: req.body.options.map(option => ({ text: option })),
    allowMultipleAnswers: req.body.allowMultipleAnswers || false
  });

  try {
    const newPoll = await poll.save();
    res.status(201).json(newPoll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Check if user has voted
router.get('/:id/check-vote/:userId', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
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
    res.status(500).json({ message: error.message });
  }
});

// Vote on a poll
router.post('/:id/vote', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
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
    res.status(500).json({ message: error.message });
  }
});

export { router as pollRoutes };
