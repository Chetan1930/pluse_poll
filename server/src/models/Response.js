import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    selectedOption: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { _id: false }
);

const responseSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Poll',
      required: true,
    },
    // null for anonymous responses
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Captured for anonymous responses to prevent duplicate votes
    ipAddress: {
      type: String,
      default: null,
    },
    answers: {
      type: [answerSchema],
      validate: {
        validator: (a) => a.length >= 1,
        message: 'At least one answer is required',
      },
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// Prevent a single authenticated user from submitting more than once
responseSchema.index(
  { pollId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $ne: null } } }
);

// Prevent the same anonymous IP from submitting more than once
responseSchema.index(
  { pollId: 1, ipAddress: 1 },
  { unique: true, partialFilterExpression: { ipAddress: { $ne: null } } }
);

const Response = mongoose.model('Response', responseSchema);
export default Response;
