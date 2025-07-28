// Test setup file
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing';
process.env.DB_NAME = 'microshield_test';

// Mock Twilio to avoid actual SMS sending in tests
jest.mock('twilio', () => {
  return jest.fn(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        sid: 'mock_message_sid',
        status: 'sent'
      })
    }
  }));
});
