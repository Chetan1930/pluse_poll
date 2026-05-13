import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/\d/, "Password must contain at least one number");

const pollOptionSchema = z.object({
  id: z.string(),
  text: z
    .string()
    .trim()
    .min(1, "All options need text")
    .max(200, "Options cannot exceed 200 characters"),
  votes: z.number().optional().default(0),
});

const pollQuestionSchema = z
  .object({
    id: z.string(),
    text: z
      .string()
      .trim()
      .min(1, "All questions need text")
      .max(500, "Questions cannot exceed 500 characters"),
    required: z.boolean(),
    options: z.array(pollOptionSchema).min(2, "Each question needs at least 2 options"),
  })
  .superRefine((question, ctx) => {
    const normalizedOptions = question.options.map((option) => option.text.toLowerCase());
    const hasDuplicates = normalizedOptions.some(
      (option, index) => normalizedOptions.indexOf(option) !== index,
    );

    if (hasDuplicates) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Options in the same question must be unique",
        path: ["options"],
      });
    }
  });

export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const signupFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tell us your name (at least 2 characters)")
    .max(80, "Name cannot exceed 80 characters"),
  email: emailSchema,
  password: passwordSchema,
});

export const pollBuilderSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Add a poll title")
    .max(200, "Poll titles cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Descriptions cannot exceed 1000 characters")
    .default(""),
  anonymous: z.boolean(),
  expiresAt: z
    .date({ required_error: "Please choose an expiry date" })
    .refine((value) => value > new Date(), "Expiry date must be in the future"),
  questions: z.array(pollQuestionSchema).min(1, "Add at least one question"),
});

export const createPollResponseSchema = (requiredQuestionIds: string[]) =>
  z.object({
    answers: z.record(z.string().trim().min(1, "Choose an option before submitting")).superRefine(
      (answers, ctx) => {
        requiredQuestionIds.forEach((questionId) => {
          if (!answers[questionId]) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Please answer all required questions",
              path: [questionId],
            });
          }
        });
      },
    ),
  });

export const getFirstValidationMessage = (
  error: unknown,
  fallback = "Please check your input",
) => {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message || fallback;
  }

  return fallback;
};
