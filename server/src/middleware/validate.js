import { sendError } from '../utils/response.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * Validate req.body with a Zod schema and replace req.body with parsed data.
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.length > 0 ? issue.path.join('.') : 'body',
      message: issue.message,
    }));

    return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Validation failed', errors);
  }

  req.body = result.data;
  next();
};
