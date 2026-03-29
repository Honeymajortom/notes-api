const express = require('express');
const app = express();

app.use(express.json());

// ── Routes ──────────────────────────────────────────
// Health check — no auth, always public
const healthRouter = require('./routes/health.route');
app.use('/', healthRouter);

// API routes (add yours here)
// const notesRouter = require('./routes/notes.route');
// app.use('/api/v1/notes', authMiddleware, notesRouter);

// ── Global error handler ─────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

module.exports = app;

