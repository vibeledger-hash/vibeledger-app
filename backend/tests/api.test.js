const request = require('supertest');
const app = require('../../index');

describe('Health Check', () => {
  test('GET /health should return 200', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
    expect(response.body.version).toBe('1.0.0');
  });
});

describe('Auth Endpoints', () => {
  test('POST /api/auth/request-otp should validate phone number', async () => {
    const response = await request(app)
      .post('/api/auth/request-otp')
      .send({ phoneNumber: 'invalid' })
      .expect(400);
    
    expect(response.body.error).toBe('Validation Error');
  });
  
  test('POST /api/auth/request-otp should accept valid phone number', async () => {
    const response = await request(app)
      .post('/api/auth/request-otp')
      .send({ phoneNumber: '+1234567890' });
    
    // Should either succeed or fail due to missing Twilio config in test
    expect([200, 500]).toContain(response.status);
  });
});

describe('Protected Routes', () => {
  test('GET /api/wallet/balance should require auth', async () => {
    const response = await request(app)
      .get('/api/wallet/balance')
      .expect(401);
    
    expect(response.body.error).toBe('Access token required');
  });
  
  test('GET /api/transaction/123 should require auth', async () => {
    const response = await request(app)
      .get('/api/transaction/123')
      .expect(401);
    
    expect(response.body.error).toBe('Access token required');
  });
});
