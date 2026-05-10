import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { HTTP_STATUS, JWT_COOKIE_NAME } from '../config/constants.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

const attachTokenCookie = (res, token) => {
  res.cookie(JWT_COOKIE_NAME, token, COOKIE_OPTIONS);
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return sendError(res, HTTP_STATUS.CONFLICT, 'Email already registered');
    }

    const user = await User.create({ name: name.trim(), email, password });
    const token = signToken({ id: user._id });

    attachTokenCookie(res, token);

    return sendSuccess(res, HTTP_STATUS.CREATED, { user: user.toSafeObject(), token }, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials');
    }

    const token = signToken({ id: user._id });
    attachTokenCookie(res, token);

    return sendSuccess(res, HTTP_STATUS.OK, { user: user.toSafeObject(), token }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie(JWT_COOKIE_NAME);
  return sendSuccess(res, HTTP_STATUS.OK, {}, 'Logged out successfully');
};

export const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, HTTP_STATUS.OK, { user: req.user });
  } catch (error) {
    next(error);
  }
};
