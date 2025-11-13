import { formatDate, isValidEmail, truncateText } from './index';

describe('utils', () => {
  it('formats date strings', () => {
    const date = new Date('2023-12-31T10:00:00.000Z');
    expect(formatDate(date)).toBe('2023-12-31');
  });

  it('validates email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
  });

  it('truncates long text', () => {
    const longText = 'This is a very long text';
    expect(truncateText(longText, 10)).toBe('This is...');
    expect(truncateText('short', 10)).toBe('short');
  });
});
