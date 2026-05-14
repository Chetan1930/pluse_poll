import mongoose from 'mongoose';
import { MIN_OPTIONS_PER_QUESTION } from '../config/constants.js';

const optionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Option text is required'],
      trim: true,
      maxlength: [200, 'Option text cannot exceed 200 characters'],
    },
  },
  { _id: true }
);

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      maxlength: [500, 'Question text cannot exceed 500 characters'],
    },
    options: {
      type: [optionSchema],
      validate: {
        validator: (opts) => opts.length >= MIN_OPTIONS_PER_QUESTION,
        message: `Each question must have at least ${MIN_OPTIONS_PER_QUESTION} options`,
      },
    },
    required: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const pollSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Poll title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (qs) => qs.length >= 1,
        message: 'A poll must have at least one question',
      },
    },
    allowAnonymousResponses: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    // When true, public users can see analytics
    resultsPublished: {
      type: Boolean,
      default: false,
    },
    // When true, track IP addresses to prevent duplicate votes from the same network
    trackIp: {
      type: Boolean,
      default: false,
    },
    // Denormalized response count — incremented on each new response for fast dashboard queries
    responseCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Quickly check if a poll has expired
pollSchema.methods.isExpired = function () {
  return this.expiresAt && new Date() > new Date(this.expiresAt);
};

pollSchema.index({ createdBy: 1 });
pollSchema.index({ createdAt: -1 });

const Poll = mongoose.model('Poll', pollSchema);
export default Poll;
