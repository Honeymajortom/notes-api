const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../src/config/db');

describe('GET /health', () => {

  afterAll(async () => {
    // Close DB pool after tests so Jest exits cleanly
    await pool.end();
  });

  it('should return 200 with status ok when DB is connected', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.db).toBe('connected');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('responseTime');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('should return numeric uptime', async () => {
    const res = await request(app).get('/health');

    expect(typeof res.body.uptime).toBe('number');
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should return a valid ISO timestamp', async () => {
    const res = await request(app).get('/health');

    const parsed = new Date(res.body.timestamp);
    expect(parsed.toString()).not.toBe('Invalid Date');
  });

  it('should return 503 with db disconnected when DB is unreachable', async () => {
    // Temporarily break the DB connection
    const { testConnection } = require('../../src/config/db');
    jest.spyOn(require('../../src/config/db'), 'testConnection')
      .mockRejectedValueOnce(new Error('connection refused'));

    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(503);
    expect(res.body.status).toBe('degraded');
    expect(res.body.db).toBe('disconnected');
    expect(res.body).toHaveProperty('error');
  });

  it('should respond without any auth header', async () => {
    // /health must be publicly accessible — no token required
    const res = await request(app)
      .get('/health')
      // deliberately no Authorization header
    
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
  });

});

