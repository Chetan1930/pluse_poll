import { MIN_OPTIONS_PER_QUESTION } from '../config/constants.js';

export const createPollSchema = {
  title: (v) => {
    if (!v || !v.trim()) return 'Title is required';
    if (v.trim().length > 200) return 'Title cannot exceed 200 characters';
    return null;
  },
  description: (v) => {
    if (v && v.length > 1000) return 'Description cannot exceed 1000 characters';
    return null;
  },
  questions: (v) => {
    if (!Array.isArray(v) || v.length < 1) return 'At least one question is required';

    for (let i = 0; i < v.length; i++) {
      const q = v[i];
      if (!q.text || !q.text.trim()) return `Question ${i + 1}: text is required`;
      if (!Array.isArray(q.options) || q.options.length < MIN_OPTIONS_PER_QUESTION) {
        return `Question ${i + 1}: must have at least ${MIN_OPTIONS_PER_QUESTION} options`;
      }
      for (let j = 0; j < q.options.length; j++) {
        const opt = q.options[j];
        if (!opt.text || !opt.text.trim()) {
          return `Question ${i + 1}, option ${j + 1}: text is required`;
        }
      }
    }

    return null;
  },
  expiresAt: (v) => {
    if (v !== undefined && v !== null && v !== '') {
      const date = new Date(v);
      if (isNaN(date.getTime())) return 'expiresAt must be a valid date';
      if (date <= new Date()) return 'expiresAt must be in the future';
    }
    return null;
  },
};

// Partial schema for update — same rules but all optional
export const updatePollSchema = {
  title: (v) => {
    if (v !== undefined && (!v || !v.trim())) return 'Title cannot be empty';
    if (v && v.trim().length > 200) return 'Title cannot exceed 200 characters';
    return null;
  },
  description: (v) => {
    if (v && v.length > 1000) return 'Description cannot exceed 1000 characters';
    return null;
  },
  questions: (v) => {
    if (v === undefined) return null;
    if (!Array.isArray(v) || v.length < 1) return 'At least one question is required';

    for (let i = 0; i < v.length; i++) {
      const q = v[i];
      if (!q.text || !q.text.trim()) return `Question ${i + 1}: text is required`;
      if (!Array.isArray(q.options) || q.options.length < MIN_OPTIONS_PER_QUESTION) {
        return `Question ${i + 1}: must have at least ${MIN_OPTIONS_PER_QUESTION} options`;
      }
      for (let j = 0; j < q.options.length; j++) {
        const opt = q.options[j];
        if (!opt.text || !opt.text.trim()) {
          return `Question ${i + 1}, option ${j + 1}: text is required`;
        }
      }
    }

    return null;
  },
  expiresAt: (v) => {
    if (v !== undefined && v !== null && v !== '') {
      const date = new Date(v);
      if (isNaN(date.getTime())) return 'expiresAt must be a valid date';
    }
    return null;
  },
};
