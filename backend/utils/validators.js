const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const validateUserPayload = ({ username, email, password }) => {
  if (typeof username !== 'string' || username.trim().length < 3 || username.trim().length > 40) {
    return 'Username must be between 3 and 40 characters';
  }
  if (/[<>\u0000-\u001f]/.test(username)) return 'Username contains unsupported characters';
  if (typeof email !== 'string' || email.trim().length > 254 || !EMAIL_PATTERN.test(email.trim())) {
    return 'A valid email address is required';
  }
  if (typeof password !== 'string' || !PASSWORD_PATTERN.test(password)) {
    return 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';
  }
  return null;
};

const validateProfilePayload = ({ username, email, currentPassword, newPassword }) => {
  if (username !== undefined && (typeof username !== 'string' || username.trim().length < 3 || username.trim().length > 40 || /[<>\u0000-\u001f]/.test(username))) {
    return 'Username must be 3 to 40 characters of plain text';
  }
  if (email !== undefined && (typeof email !== 'string' || email.trim().length > 254 || !EMAIL_PATTERN.test(email.trim()))) {
    return 'A valid email address is required';
  }
  if (newPassword !== undefined && newPassword !== '') {
    if (typeof currentPassword !== 'string' || !currentPassword) return 'Current password is required';
    if (typeof newPassword !== 'string' || !PASSWORD_PATTERN.test(newPassword)) {
      return 'New password must be at least 8 characters and include uppercase, lowercase, number, and special character';
    }
  }
  return null;
};

const validateLoginPayload = ({ email, password }) => {
  if (typeof email !== 'string' || email.trim().length > 254 || !EMAIL_PATTERN.test(email.trim())) {
    return 'A valid email address is required';
  }
  if (typeof password !== 'string' || !password) return 'Email and password are required';
  return null;
};

/**
 * Validates exercise payload for create/update operations
 * @param {Object} payload - Exercise data to validate
 * @param {string} payload.description - Exercise description
 * @param {number} payload.duration - Exercise duration in minutes
 * @param {boolean} payload.exerciseCheck - Exercise completion flag
 * @returns {string|null} Error message if invalid, null if valid
 */
const validateExercisePayload = ({ description, duration, exerciseCheck }) => {
  if (!description || typeof description !== 'string') {
    return 'Description is required';
  }
  if (!description.trim() || description.trim().length > 500) {
    return 'Description must be between 1 and 500 characters';
  }
  if (!Number.isFinite(Number(duration)) || Number(duration) <= 0) {
    return 'Duration must be a positive number';
  }
  if (typeof exerciseCheck !== 'boolean') {
    return 'exerciseCheck must be a boolean';
  }
  return null;
};

/**
 * Validates month parameter
 * @param {number} month - Month value to validate (1-12)
 * @returns {string|null} Error message if invalid, null if valid
 */
const validateMonth = (month) => {
  const monthNum = Number(month);
  if (Number.isInteger(monthNum) && monthNum >= 1 && monthNum <= 12) return null;
  if (typeof month === 'string' && /^(january|february|march|april|may|june|july|august|september|october|november|december)$/i.test(month)) return null;
  return 'Invalid month parameter';
};

module.exports = {
  validateUserPayload,
  validateProfilePayload,
  validateLoginPayload,
  PASSWORD_PATTERN,
  validateExercisePayload,
  validateMonth,
};
