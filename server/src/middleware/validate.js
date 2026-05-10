import { sendError } from '../utils/response.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * Factory that returns Express middleware validating `req.body` against a
 * Joi-style schema object (plain validators returning error strings or null).
 *
 * Usage: validate(schema) — schema is an object where each key maps to a
 * function (value) => errorString | null
 */
export const validate = (schema) => (req, res, next) => {
  const errors = [];

  for (const [field, validator] of Object.entries(schema)) {
    const error = validator(req.body[field], req.body);
    if (error) errors.push({ field, message: error });
  }

  if (errors.length > 0) {
    return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Validation failed', errors);
  }

  next();
};
