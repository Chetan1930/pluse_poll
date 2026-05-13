import { z } from 'zod';

const emailSchema = z
  .string({ required_error: 'Email is required' })
  .trim()
  .min(1, 'Email is required')
  .email('Please provide a valid email')
  .toLowerCase();

const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .regex(/\d/, 'Password must contain at least one number');

export const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'Name is required' })
      .trim()
      .min(1, 'Name is required')
      .max(80, 'Name cannot exceed 80 characters'),
    email: emailSchema,
    password: passwordSchema,
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password is required'),
  })
  .strict();
