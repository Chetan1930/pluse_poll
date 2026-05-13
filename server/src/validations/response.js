import { z } from 'zod';

const objectIdSchema = z
  .string({ required_error: 'ID is required' })
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid MongoDB ObjectId');

export const submitResponseSchema = z
  .object({
    answers: z
      .array(
        z
          .object({
            questionId: objectIdSchema,
            selectedOption: objectIdSchema,
          })
          .strict()
      )
      .min(1, 'Answers array is required'),
  })
  .strict();
