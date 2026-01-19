/**
 * Type utilities for working with Json type from Supabase
 */

import { Json } from '@/types/database'

/**
 * Type guard to check if a Json value is a record/object (not array, string, number, boolean, or null)
 */
export function isJsonObject(value: Json): value is { [key: string]: Json | undefined } {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Safely extracts a string value from a Json object
 * @param obj - The Json object to extract from
 * @param key - The key to extract
 * @returns The string value or empty string if not found/not a string
 */
export function getStringFromJson(obj: Json, key: string): string {
  if (!isJsonObject(obj)) {
    return ''
  }
  
  const value = obj[key]
  return typeof value === 'string' ? value : ''
}

/**
 * Safely converts Json to a record object
 * @param value - The Json value to convert
 * @returns A record object or empty object if value is not an object
 */
export function jsonToRecord(value: Json): Record<string, unknown> {
  return isJsonObject(value) ? value : {}
}
