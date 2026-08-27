const express = require('express');
const { authenticateUser } = require('../../middleware/auth');
const { requireTenant } = require('../../middleware/tenant-context');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

router.use(authenticateUser, requireTenant);

// Get paginated notifications
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const unreadOnly = req.query.unreadOnly === 'true';

    const where = {
      userId: req.context.actorUserId,
      companyId: req.context.effectiveCompanyId
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await prisma.notification.count({ where });

    res.json({
      data: notifications,
      meta: { total, limit, offset }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Mark all as read
router.patch('/read-all', async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.context.actorUserId,
        companyId: req.context.effectiveCompanyId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Mark one as read
router.patch('/:id/read', async (req, res) => {
  try {
    const id = req.params.id;
    const notification = await prisma.notification.findUnique({ where: { id } });

    if (!notification || notification.userId !== req.context.actorUserId) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
