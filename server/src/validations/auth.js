const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

export const registerSchema = {
  name: (v) => {
    if (!v || !v.trim()) return 'Name is required';
    if (v.trim().length > 80) return 'Name cannot exceed 80 characters';
    return null;
  },
  email: (v) => {
    if (!v || !v.trim()) return 'Email is required';
    if (!isValidEmail(v.trim())) return 'Please provide a valid email';
    return null;
  },
  password: (v) => {
    if (!v) return 'Password is required';
    if (v.length < 8) return 'Password must be at least 8 characters';
    if (!/\d/.test(v)) return 'Password must contain at least one number';
    return null;
  },
};

export const loginSchema = {
  email: (v) => {
    if (!v || !v.trim()) return 'Email is required';
    if (!isValidEmail(v.trim())) return 'Please provide a valid email';
    return null;
  },
  password: (v) => {
    if (!v) return 'Password is required';
    return null;
  },
};
