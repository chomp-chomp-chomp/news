/**
 * Shared validation utilities
 */

/**
 * Comprehensive email validation regex
 * Based on RFC 5322 Official Standard
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

/**
 * Validates an email address format
 * @param email - The email address to validate
 * @returns true if the email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.length < 3 || email.length > 255) {
    return false
  }
  
  return EMAIL_REGEX.test(email)
}
