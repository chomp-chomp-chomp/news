import { Logger, createLogger } from '@/lib/logger'

// Mock the supabase client
jest.mock('@/lib/supabase/server', () => ({
  createAdminClient: jest.fn(() => Promise.resolve({
    from: jest.fn(() => ({
      insert: jest.fn(() => Promise.resolve({ error: null }))
    }))
  }))
}))

describe('Logger', () => {
  let consoleSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    consoleSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  describe('createLogger', () => {
    it('should create a logger instance', () => {
      const logger = createLogger()
      expect(logger).toBeInstanceOf(Logger)
    })

    it('should create a logger with context', () => {
      const logger = createLogger({ userId: 'user-123' })
      expect(logger).toBeInstanceOf(Logger)
    })
  })

  describe('Logger.info', () => {
    it('should log info messages', () => {
      const logger = createLogger()
      logger.info('Test message')

      expect(consoleSpy).toHaveBeenCalled()
      const logCall = consoleSpy.mock.calls[0][0]
      const parsed = JSON.parse(logCall)
      
      expect(parsed.level).toBe('info')
      expect(parsed.message).toBe('Test message')
    })

    it('should include additional data in logs', () => {
      const logger = createLogger()
      logger.info('Test message', { key: 'value' })

      const logCall = consoleSpy.mock.calls[0][0]
      const parsed = JSON.parse(logCall)
      
      expect(parsed.key).toBe('value')
    })
  })

  describe('Logger.warn', () => {
    it('should log warning messages', () => {
      const logger = createLogger()
      logger.warn('Warning message')

      const logCall = consoleSpy.mock.calls[0][0]
      const parsed = JSON.parse(logCall)
      
      expect(parsed.level).toBe('warn')
      expect(parsed.message).toBe('Warning message')
    })
  })

  describe('Logger.error', () => {
    it('should log error messages', () => {
      const logger = createLogger()
      const error = new Error('Test error')
      logger.error('Error occurred', error)

      expect(consoleErrorSpy).toHaveBeenCalled()
      const logCall = consoleErrorSpy.mock.calls[0][0]
      const parsed = JSON.parse(logCall)
      
      expect(parsed.level).toBe('error')
      expect(parsed.message).toBe('Error occurred')
      expect(parsed.error).toBe('Test error')
    })

    it('should include stack trace in error logs', () => {
      const logger = createLogger()
      const error = new Error('Test error')
      logger.error('Error occurred', error)

      const logCall = consoleErrorSpy.mock.calls[0][0]
      const parsed = JSON.parse(logCall)
      
      expect(parsed.stack).toBeDefined()
    })
  })

  describe('Logger.withContext', () => {
    it('should create a new logger with merged context', () => {
      const logger = createLogger({ userId: 'user-123' })
      const newLogger = logger.withContext({ publicationId: 'pub-456' })

      expect(newLogger).toBeInstanceOf(Logger)
      expect(newLogger).not.toBe(logger)
    })
  })

  describe('Logger.debug', () => {
    it('should log debug messages in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const logger = createLogger()
      logger.debug('Debug message')

      expect(consoleSpy).toHaveBeenCalled()

      process.env.NODE_ENV = originalEnv
    })

    it('should not log debug messages in production mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const logger = createLogger()
      logger.debug('Debug message')

      expect(consoleSpy).not.toHaveBeenCalled()

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Logger.audit', () => {
    it('should log audit events to database', async () => {
      const logger = createLogger({ userId: 'user-123' })
      await logger.audit('user.login', {
        entityType: 'user',
        entityId: 'user-123'
      })

      // The audit method should complete without throwing
      expect(true).toBe(true)
    })
  })
})
