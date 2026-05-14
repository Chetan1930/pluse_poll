import { z } from 'zod';
import { MIN_OPTIONS_PER_QUESTION } from '../config/constants.js';

const normalizedDateSchema = z.preprocess(
  (value) => {
    if (value === '' || value === undefined) return null;
    return value;
  },
  z.coerce.date({ invalid_type_error: 'expiresAt must be a valid date' }).nullable()
);

const futureDateSchema = normalizedDateSchema.refine(
  (value) => value === null || value > new Date(),
  'expiresAt must be in the future'
);

const optionSchema = z
  .object({
    text: z
      .string({ required_error: 'Option text is required' })
      .trim()
      .min(1, 'Option text is required')
      .max(200, 'Option text cannot exceed 200 characters'),
  })
  .strict();

const questionSchema = z
  .object({
    text: z
      .string({ required_error: 'Question text is required' })
      .trim()
      .min(1, 'Question text is required')
      .max(500, 'Question text cannot exceed 500 characters'),
    options: z
      .array(optionSchema)
      .min(
        MIN_OPTIONS_PER_QUESTION,
        `Each question must have at least ${MIN_OPTIONS_PER_QUESTION} options`
      ),
    required: z.boolean().optional().default(false),
  })
  .strict()
  .superRefine((question, ctx) => {
    const normalizedOptions = question.options.map((option) => option.text.toLowerCase());
    const hasDuplicateOptions = normalizedOptions.some(
      (option, index) => normalizedOptions.indexOf(option) !== index
    );

    if (hasDuplicateOptions) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Question options must be unique',
        path: ['options'],
      });
    }
  });

export const createPollSchema = z
  .object({
    title: z
      .string({ required_error: 'Title is required' })
      .trim()
      .min(1, 'Title is required')
      .max(200, 'Title cannot exceed 200 characters'),
    description: z
      .string()
      .trim()
      .max(1000, 'Description cannot exceed 1000 characters')
      .optional()
      .default(''),
    questions: z.array(questionSchema).min(1, 'At least one question is required'),
    allowAnonymousResponses: z.boolean().optional().default(true),
    trackIp: z.boolean().optional().default(false),
    expiresAt: futureDateSchema.optional().default(null),
  })
  .strict();

export const updatePollSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title cannot be empty')
      .max(200, 'Title cannot exceed 200 characters')
      .optional(),
    description: z.string().trim().max(1000, 'Description cannot exceed 1000 characters').optional(),
    questions: z.array(questionSchema).min(1, 'At least one question is required').optional(),
    allowAnonymousResponses: z.boolean().optional(),
    trackIp: z.boolean().optional(),
    expiresAt: futureDateSchema.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });
