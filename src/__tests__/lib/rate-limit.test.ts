import { getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

// Mock the supabase client
jest.mock('@/lib/supabase/server', () => ({
  createAdminClient: jest.fn(() => Promise.resolve({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            gte: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } }))
            }))
          }))
        }))
      })),
      insert: jest.fn(() => Promise.resolve({ error: null })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      })),
      delete: jest.fn(() => ({
        lt: jest.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }))
}))

describe('Rate Limiting', () => {
  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const headers = new Headers()
      headers.set('x-forwarded-for', '192.168.1.1, 10.0.0.1')
      
      const ip = getClientIp(headers)
      expect(ip).toBe('192.168.1.1')
    })

    it('should extract IP from x-real-ip header', () => {
      const headers = new Headers()
      headers.set('x-real-ip', '192.168.1.2')
      
      const ip = getClientIp(headers)
      expect(ip).toBe('192.168.1.2')
    })

    it('should prefer x-forwarded-for over x-real-ip', () => {
      const headers = new Headers()
      headers.set('x-forwarded-for', '192.168.1.1')
      headers.set('x-real-ip', '192.168.1.2')
      
      const ip = getClientIp(headers)
      expect(ip).toBe('192.168.1.1')
    })

    it('should return "unknown" when no IP headers present', () => {
      const headers = new Headers()
      
      const ip = getClientIp(headers)
      expect(ip).toBe('unknown')
    })

    it('should handle single IP in x-forwarded-for', () => {
      const headers = new Headers()
      headers.set('x-forwarded-for', '10.0.0.1')
      
      const ip = getClientIp(headers)
      expect(ip).toBe('10.0.0.1')
    })
  })

  describe('RATE_LIMITS configuration', () => {
    it('should have subscribe rate limit configuration', () => {
      expect(RATE_LIMITS.subscribe).toBeDefined()
      expect(RATE_LIMITS.subscribe.maxRequests).toBe(5)
      expect(RATE_LIMITS.subscribe.windowMs).toBe(3600000)
    })

    it('should have sendTest rate limit configuration', () => {
      expect(RATE_LIMITS.sendTest).toBeDefined()
      expect(RATE_LIMITS.sendTest.maxRequests).toBe(10)
      expect(RATE_LIMITS.sendTest.windowMs).toBe(3600000)
    })

    it('should have api rate limit configuration', () => {
      expect(RATE_LIMITS.api).toBeDefined()
      expect(RATE_LIMITS.api.maxRequests).toBe(100)
      expect(RATE_LIMITS.api.windowMs).toBe(60000)
    })
  })
})
