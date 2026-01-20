import '@testing-library/jest-dom'

// Mock environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.RESEND_API_KEY = 're_test_key'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.RATE_LIMIT_SUBSCRIBE_PER_HOUR = '5'
process.env.RATE_LIMIT_SEND_TEST_PER_HOUR = '10'
