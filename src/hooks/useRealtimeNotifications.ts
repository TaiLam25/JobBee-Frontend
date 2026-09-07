import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../config/supabase';
import { notificationApi } from '../api';
import type { Notification, User } from '../types';

export function useRealtimeNotifications(user: User | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [modalQueue, setModalQueue] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Load initial notifications from REST API
  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const list = await notificationApi.getNotifications();
      setNotifications(list);
      const unread = list.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Handle Realtime Subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications:user:' + user.id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification',
          filter: 'account_id=eq.' + user.id,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          // Parse metadata if returned as string
          if (typeof newNotif.metadata === 'string') {
            try {
              newNotif.metadata = JSON.parse(newNotif.metadata);
            } catch (e) {
              // keep as is
            }
          }

          // Prepend to full list
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Push to modal queue
          setModalQueue((prev) => [...prev, newNotif]);

          // Optional audio feedback using Web Audio API
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
          } catch (e) {
            // ignore audio play errors
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Subscribed to notifications for user', user.id);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Current item in queue
  const currentModalNotification = modalQueue.length > 0 ? modalQueue[0] : null;

  // Dismiss current notification from modal queue and mark read
  const dismissCurrentModal = useCallback(async (markAsRead: boolean = true) => {
    if (modalQueue.length === 0) return;
    const item = modalQueue[0];
    
    // Remove from queue
    setModalQueue((prev) => prev.slice(1));

    if (markAsRead && item && !item.is_read) {
      try {
        await notificationApi.markAsRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (e) {
        console.warn('Failed to mark notification as read:', e);
      }
    }
  }, [modalQueue]);

  const clearModalQueue = useCallback(() => {
    setModalQueue([]);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    modalQueue,
    currentModalNotification,
    queueLength: modalQueue.length,
    dismissCurrentModal,
    clearModalQueue,
    refreshNotifications: loadNotifications,
  };
}
