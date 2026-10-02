import { describe, expect, it } from 'vitest';
import { validateEmail, validateStrongPassword, validateUsername } from './validation';

describe('form validation', () => {
  it('accepts bounded plain-text usernames and rejects markup/control characters', () => {
    expect(validateUsername('runner')).toBe(true);
    expect(validateUsername('<b>runner</b>')).toBe(false);
    expect(validateUsername('ab')).toBe(false);
    expect(validateUsername('bad\nname')).toBe(false);
  });

  it('checks email format and length', () => {
    expect(validateEmail('runner@example.com')).toBe(true);
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail(`${'a'.repeat(250)}@example.com`)).toBe(false);
  });

  it('requires all password complexity conditions', () => {
    expect(validateStrongPassword('StrongPass1!')).toBe(true);
    expect(validateStrongPassword('weakpass1')).toBe(false);
    expect(validateStrongPassword('StrongPass!')).toBe(false);
  });
});
