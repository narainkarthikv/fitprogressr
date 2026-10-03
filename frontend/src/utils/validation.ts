export const validateUsername = (username: unknown): username is string =>
  typeof username === 'string' &&
  username.trim().length >= 3 &&
  username.trim().length <= 40 &&
  !/[<>]/.test(username) &&
  !Array.from(username).some((character) => character.charCodeAt(0) < 32);

export const validateEmail = (email: unknown): email is string =>
  typeof email === 'string' &&
  email.trim().length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const validateStrongPassword = (password: unknown): password is string =>
  typeof password === 'string' &&
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);
