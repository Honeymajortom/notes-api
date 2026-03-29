const { testConnection } = require('../config/db');

const checkHealth = async (req, res) => {
  const start = Date.now();

  try {
    await testConnection();

    return res.status(200).json({
      status: 'ok',
      db: 'connected',
      uptime: Math.floor(process.uptime()),
      responseTime: `${Date.now() - start}ms`,
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    return res.status(503).json({
      status: 'degraded',
      db: 'disconnected',
      error: err.message,
      uptime: Math.floor(process.uptime()),
      responseTime: `${Date.now() - start}ms`,
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = { checkHealth };

