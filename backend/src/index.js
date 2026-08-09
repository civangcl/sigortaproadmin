// ────────────────────────────────────────────────────────────────
// backend/src/index.js  –  Ece Sigorta Express Server Entry Point
// ────────────────────────────────────────────────────────────────
'use strict';

require('dotenv').config();

const express = require('express');
const cors    = require('cors');

const apiRouter = require('./routes/api');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────
app.use(
  cors({
    // Allow all frontend apps: public site (3000/5173) and admin panel (5174)
    origin: process.env.FRONTEND_ORIGIN
      ? process.env.FRONTEND_ORIGIN.split(',').map((o) => o.trim())
      : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────
app.use('/api', apiRouter);

// ── Catch-all 404 ────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Global error handler ──────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error.',
    ...(process.env.NODE_ENV !== 'production' && { error: err.message }),
  });
});

// ── Start ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Ece Sigorta backend running on http://localhost:${PORT}`);
  console.log(`   GET  http://localhost:${PORT}/api/status`);
  console.log(`   POST http://localhost:${PORT}/api/offers\n`);
});
