/**
 * Consistent API response shape used across all controllers.
 */
export const sendSuccess = (res, statusCode, data = {}, message = 'Success') =>
  res.status(statusCode).json({ success: true, message, data });

export const sendError = (res, statusCode, message = 'An error occurred', errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};
