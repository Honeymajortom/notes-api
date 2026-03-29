const request = require('supertest');

describe('GET /health', () => {

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('should return 200 with status ok when DB is connected', async () => {
    const app = require('../src/app');
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.db).toBe('connected');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('responseTime');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('should return numeric uptime', async () => {
    const app = require('../src/app');
    const res = await request(app).get('/health');

    expect(typeof res.body.uptime).toBe('number');
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should return a valid ISO timestamp', async () => {
    const app = require('../src/app');
    const res = await request(app).get('/health');

    const parsed = new Date(res.body.timestamp);
    expect(parsed.toString()).not.toBe('Invalid Date');
  });

  it('should return 503 with db disconnected when DB is unreachable', async () => {
    // Mock the db module BEFORE requiring app
    jest.mock('../src/config/db', () => ({
      pool: { end: jest.fn() },
      testConnection: jest.fn().mockRejectedValue(new Error('connection refused')),
    }));

    const app = require('../src/app');
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(503);
    expect(res.body.status).toBe('degraded');
    expect(res.body.db).toBe('disconnected');
    expect(res.body).toHaveProperty('error');
  });

  it('should respond without any auth header', async () => {
    const app = require('../src/app');
    const res = await request(app).get('/health');

    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
  });

});
