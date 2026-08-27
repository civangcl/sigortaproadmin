const express = require('express');
const { authenticateUser } = require('../../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

router.get('/public-key', (req, res) => {
  res.json({ publicKey: process.env.WEB_PUSH_PUBLIC_KEY || 'NOT_CONFIGURED' });
});

router.post('/subscribe', authenticateUser, async (req, res) => {
  try {
    const subscription = req.body;
    const userId = req.user.id;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription' });
    }

    const { endpoint, keys } = subscription;

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId,
        p256dh: keys.p256dh,
        auth: keys.auth,
        isActive: true,
        userAgent: req.headers['user-agent']
      },
      create: {
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        isActive: true,
        userAgent: req.headers['user-agent']
      }
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error in /push/subscribe:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
