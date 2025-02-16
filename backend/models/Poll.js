import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  votes: {
    type: Number,
    default: 0
  }
});

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [optionSchema],
  allowMultipleAnswers: {
    type: Boolean,
    default: false
  },
  voters: [{
    userId: String,
    votedOptions: [Number],
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Poll = mongoose.model('Poll', pollSchema);
