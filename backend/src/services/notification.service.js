const webpush = require('web-push');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Only set VAPID details if keys are provided in environment
const vapidPublicKey = process.env.WEB_PUSH_PUBLIC_KEY;
const vapidPrivateKey = process.env.WEB_PUSH_PRIVATE_KEY;
const vapidSubject = process.env.WEB_PUSH_SUBJECT || 'mailto:admin@sigortapro.com';

let isPushConfigured = false;
if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  isPushConfigured = true;
} else {
  console.warn('[PushService] Web Push keys not provided. Push notifications will be mocked.');
}

class NotificationService {
  /**
   * Notify authorized users about a new lead
   */
  static async notifyNewLead(lead, companyId) {
    try {
      // 1. Find all eligible users for this company (e.g. OWNER, MANAGER)
      const memberships = await prisma.companyMembership.findMany({
        where: {
          companyId,
          status: 'ACTIVE',
        },
        select: { userId: true, allBranches: true, branchAccess: true }
      });

      // Filter based on branch if necessary
      const eligibleUserIds = memberships
        .filter(m => m.allBranches || !lead.branchId || m.branchAccess.some(ba => ba.branchId === lead.branchId))
        .map(m => m.userId);

      if (eligibleUserIds.length === 0) return;

      const title = 'Yeni Teklif Talebi';
      const body = 'Yeni bir teklif talebi geldi. Görüntülemek için dokunun.';

      // 2. Create In-App Notifications
      const notifications = eligibleUserIds.map(userId => ({
        userId,
        companyId,
        branchId: lead.branchId,
        type: 'LEAD_CREATED',
        title,
        body,
        entityType: 'LEAD',
        entityId: lead.id
      }));

      await prisma.notification.createMany({
        data: notifications
      });

      // 3. Send Web Push
      if (isPushConfigured) {
        const subscriptions = await prisma.pushSubscription.findMany({
          where: {
            userId: { in: eligibleUserIds },
            isActive: true
          }
        });

        const payload = JSON.stringify({
          title,
          body,
          url: `/admin`, // default app URL, we can refine this later
          entityId: lead.id
        });

        const pushPromises = subscriptions.map(async sub => {
          try {
            await webpush.sendNotification({
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
              }
            }, payload);
          } catch (err) {
            console.error(`[PushService] Error sending to subscription ${sub.id}:`, err);
            if (err.statusCode === 404 || err.statusCode === 410) {
              // Subscription expired or unsubscribed
              await prisma.pushSubscription.update({
                where: { id: sub.id },
                data: { isActive: false }
              });
            }
          }
        });

        await Promise.allSettled(pushPromises);
      }
    } catch (error) {
      console.error('[NotificationService] Error notifying new lead:', error);
      // We don't throw because this should not break the lead creation flow
    }
  }
}

module.exports = NotificationService;
