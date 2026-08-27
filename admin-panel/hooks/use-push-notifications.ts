import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // Register service worker if not already
      navigator.serviceWorker.register('/sw.js').then(
        (reg) => {
          console.log('Service Worker registered', reg);
          reg.pushManager.getSubscription().then((sub) => {
            if (sub) {
              setSubscription(sub);
              setIsSubscribed(true);
            }
          });
        },
        (err) => {
          console.error('Service Worker registration failed', err);
        }
      );
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toast.error('Tarayıcınız bildirimleri desteklemiyor.');
      return false;
    }

    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        toast.error('Bildirim izni verilmedi.');
        return false;
      }

      const reg = await navigator.serviceWorker.ready;
      
      // We need the VAPID public key from backend
      // In a real app, you'd fetch this from /api/push/public-key
      // For now, assume it's passed or available. Wait, we need it.
      const res = await fetch('https://sigortapro-api.vercel.app/api/push/public-key');
      if (!res.ok) {
        throw new Error('VAPID public key alınamadı');
      }
      const { publicKey } = await res.json();

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      });

      setSubscription(sub);
      setIsSubscribed(true);

      // Send to backend
      const { session } = await (await import('@/lib/supabase/client')).createClient().auth.getSession().then(r => r.data);
      if (!session) return false;

      const saveRes = await fetch('https://sigortapro-api.vercel.app/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(sub)
      });

      if (saveRes.ok) {
        toast.success('Bildirimler başarıyla açıldı!');
        return true;
      } else {
        throw new Error('Sunucuya kaydedilemedi');
      }
    } catch (error) {
      console.error('Bildirim aboneliği hatası:', error);
      toast.error('Bildirimler açılırken hata oluştu.');
      return false;
    }
  }, [isSupported]);

  return {
    isSupported,
    permission,
    isSubscribed,
    subscribe
  };
}
