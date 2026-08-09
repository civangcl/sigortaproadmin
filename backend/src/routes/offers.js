// ────────────────────────────────────────────────────────────────
// backend/src/routes/offers.js  –  /api/offers  &  /api/status
// ────────────────────────────────────────────────────────────────
'use strict';

const { Router }      = require('express');
const { PrismaClient } = require('@prisma/client');

const router = Router();
const prisma = new PrismaClient();

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

/**
 * Lightweight input validator.
 * Returns an array of error messages (empty = valid).
 *
 * @param {{ licensePlate, fullName, dateOfBirth, phoneNumber }} body
 * @returns {string[]}
 */
function validateOfferInput({ licensePlate, fullName, dateOfBirth, phoneNumber }) {
  const errors = [];

  if (!licensePlate || typeof licensePlate !== 'string' || licensePlate.trim().length < 2) {
    errors.push('licensePlate is required (e.g. 34 ABC 123).');
  }

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    errors.push('fullName must be at least 2 characters.');
  }

  if (!dateOfBirth) {
    errors.push('dateOfBirth is required.');
  } else {
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) errors.push('dateOfBirth must be a valid ISO date string.');
    if (dob > new Date())      errors.push('dateOfBirth cannot be in the future.');
  }

  // Turkish mobile number: starts with 05, total 11 digits (no spaces)
  const phoneClean = String(phoneNumber || '').replace(/\s/g, '');
  if (!/^05\d{9}$/.test(phoneClean)) {
    errors.push('phoneNumber must be a valid Turkish mobile number (e.g. 05XX XXX XX XX).');
  }

  return errors;
}

// ────────────────────────────────────────────────────────────────
// GET /api/status  –  health-check
// ────────────────────────────────────────────────────────────────
router.get('/status', (_req, res) => {
  res.json({
    success: true,
    service: 'Ece Sigorta API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    status: 'OK',
  });
});

// ────────────────────────────────────────────────────────────────
// POST /api/offers  –  create a new insurance quote request
// ────────────────────────────────────────────────────────────────
router.post('/offers', async (req, res) => {
  const { licensePlate, fullName, dateOfBirth, phoneNumber } = req.body;

  // 1. Validate
  const errors = validateOfferInput({ licensePlate, fullName, dateOfBirth, phoneNumber });
  if (errors.length > 0) {
    return res.status(422).json({ success: false, errors });
  }

  try {
    // 2. Persist
    const offer = await prisma.offer.create({
      data: {
        licensePlate: licensePlate.trim().toUpperCase(),
        fullName:     fullName.trim(),
        dateOfBirth:  new Date(dateOfBirth),
        phoneNumber:  String(phoneNumber).replace(/\s/g, ''),
        // status defaults to "PENDING" via schema
      },
    });

    // 3. Respond
    return res.status(201).json({
      success: true,
      message: 'Teklifiniz alındı! En kısa sürede sizi arayacağız.',
      data: offer,
    });
  } catch (err) {
    console.error('[POST /api/offers] Prisma error:', err);
    return res.status(500).json({
      success: false,
      message: 'Veritabanına kaydedilemedi. Lütfen tekrar deneyin.',
    });
  }
});

// ────────────────────────────────────────────────────────────────
// GET /api/offers  –  list all pending offers (admin / internal)
// ────────────────────────────────────────────────────────────────
router.get('/offers', async (_req, res) => {
  try {
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, count: offers.length, data: offers });
  } catch (err) {
    console.error('[GET /api/offers] Prisma error:', err);
    return res.status(500).json({ success: false, message: 'Veriler alınamadı.' });
  }
});

module.exports = router;
