import { isValidEmail, EMAIL_REGEX } from '@/lib/validation'

describe('Email Validation', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.com',
        'user+tag@example.com',
        'user@subdomain.domain.com',
        'user123@example.org',
        'user@domain.co.uk',
      ]

      validEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(true)
      })
    })

    it('should return false for invalid email addresses', () => {
      const invalidEmails = [
        '',
        'invalid',
        '@domain.com',
        'user@',
        'user@.com',
      ]

      invalidEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(false)
      })
    })

    it('should return false for emails that are too short', () => {
      expect(isValidEmail('a@')).toBe(false)
      expect(isValidEmail('ab')).toBe(false)
    })

    it('should return false for emails that are too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com'
      expect(isValidEmail(longEmail)).toBe(false)
    })

    it('should return false for null or undefined', () => {
      expect(isValidEmail(null as unknown as string)).toBe(false)
      expect(isValidEmail(undefined as unknown as string)).toBe(false)
    })
  })

  describe('EMAIL_REGEX', () => {
    it('should match valid email formats', () => {
      expect(EMAIL_REGEX.test('test@example.com')).toBe(true)
      expect(EMAIL_REGEX.test('user.name@domain.org')).toBe(true)
    })

    it('should not match invalid email formats', () => {
      expect(EMAIL_REGEX.test('invalid')).toBe(false)
      expect(EMAIL_REGEX.test('@domain.com')).toBe(false)
    })
  })
})
