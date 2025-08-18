import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

export const useNotifications = () => {
  const [showNotificationGuide, setShowNotificationGuide] = useState(false);

  // Default notification preferences
  const defaultNotifyPrefs = {
    all: true,
    prayer: true,
    jamaat: true,
    info: true,
    clear: false,
    admin: false,
    prayerFajr: true,
    prayerDhuhr: true,
    prayerAsr: true,
    prayerMaghrib: true,
    prayerIsha: true,
    quietEnabled: false,
    quietStart: '22:00',
    quietEnd: '06:00',
    // Enhanced notification preferences
    dataBackup: true,
    systemUpdates: true,
    communityEvents: true,
    emergencyAlerts: true,
    weeklyReports: true,
    monthlyReports: true,
    customReminders: true,
    soundEnabled: true,
    vibrationEnabled: true,
    priorityLevel: 'normal', // low, normal, high, urgent
  };

  const [notifyPrefs, setNotifyPrefs] = useState(defaultNotifyPrefs);

  // Load preferences from user context (will be passed from useUser)
  const loadPreferences = useCallback((userPrefs) => {
    if (userPrefs && userPrefs.notifications) {
      setNotifyPrefs(userPrefs.notifications);
    }
  }, []);

  // Save preferences to user context
  const saveNotificationPreferences = useCallback(async (prefs) => {
    try {
      setNotifyPrefs(prefs);
      // This will be handled by useUser hook
      return true;
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      return false;
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    try {
      if (!('Notification' in window)) {
        toast.error('Notifications not supported in this browser');
        return false;
      }

      if (Notification.permission === 'granted') {
        return true;
      }

      if (Notification.permission === 'denied') {
        toast.error(
          'Notifications are blocked. Please enable them in browser settings.',
        );
        return false;
      }

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notifications enabled!');
        return true;
      } else {
        toast.error('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to enable notifications');
      return false;
    }
  }, []);

  // Schedule prayer notifications
  const schedulePrayerNotifications = useCallback(
    async (times, prefs = notifyPrefs) => {
      try {
        if (
          !('serviceWorker' in navigator) ||
          !navigator.serviceWorker.controller
        ) {
          console.log('Service worker not available');
          return;
        }

        if (!prefs.prayer) {
          console.log('Prayer notifications disabled');
          return;
        }

        const registration = await navigator.serviceWorker.ready;

        // Transform times for Friday
        const entries = Object.entries(times).map(([prayer, time]) => {
          const [hours, minutes] = time.split(':').map(Number);
          const date = new Date();
          date.setHours(hours, minutes, 0, 0);

          // If time has passed today, schedule for tomorrow
          if (date <= new Date()) {
            date.setDate(date.getDate() + 1);
          }

          return { prayer, time: date.toISOString() };
        });

        registration.active.postMessage({
          type: 'schedule',
          times: entries,
          prefs,
        });

        console.log('Prayer notifications scheduled');
      } catch (error) {
        console.error('Failed to schedule prayer notifications:', error);
      }
    },
    [notifyPrefs],
  );

  // Send notification via service worker
  const sendServiceWorkerNotification = useCallback(
    async (title, body, options = {}) => {
      try {
        if (
          !('serviceWorker' in navigator) ||
          !navigator.serviceWorker.controller
        ) {
          // Fallback to browser notification
          if (
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            new Notification(title, { body, ...options });
          }
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        // Use MessageChannel for reliable communication
        const channel = new MessageChannel();

        channel.port1.onmessage = (event) => {
          if (event.data.type === 'pong') {
            // Service worker is ready
            registration.active.postMessage(
              {
                type: 'showNow',
                title,
                body,
                options,
              },
              [channel.port2],
            );
          }
        };

        // Test connection first
        registration.active.postMessage({ type: 'ping' }, [channel.port2]);
      } catch (error) {
        console.error('Failed to send service worker notification:', error);
        // Fallback to browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body, ...options });
        }
      }
    },
    [],
  );

  // Enhanced notification function with priority and type support
  const notify = useCallback(
    async (title, body, options = {}) => {
      try {
        const {
          type = 'info',
          priority = 'normal',
          category = 'general',
          vibration = true,
          icon = '/logo192.png',
          tag = undefined,
          requireInteraction = false,
          silent = false,
        } = options;

        // Check if notifications are enabled
        if (!notifyPrefs.all) {
          console.log('Notifications disabled');
          return;
        }

        // Check category-specific preferences
        const categoryEnabled =
          notifyPrefs[category] !== undefined ? notifyPrefs[category] : true;
        if (!categoryEnabled) {
          console.log(`Notifications for category '${category}' disabled`);
          return;
        }

        // Check priority level
        const priorityEnabled =
          notifyPrefs.priorityLevel === 'urgent' ||
          notifyPrefs.priorityLevel === priority ||
          (notifyPrefs.priorityLevel === 'high' && priority !== 'urgent') ||
          (notifyPrefs.priorityLevel === 'normal' &&
            ['low', 'normal'].includes(priority));

        if (!priorityEnabled) {
          console.log(`Notification priority '${priority}' not allowed`);
          return;
        }

        // Check quiet hours (except for urgent notifications)
        if (notifyPrefs.quietEnabled && priority !== 'urgent') {
          const now = new Date();
          const currentTime = now.getHours() * 60 + now.getMinutes();
          const [startHour, startMin] = notifyPrefs.quietStart
            .split(':')
            .map(Number);
          const [endHour, endMin] = notifyPrefs.quietEnd.split(':').map(Number);
          const startTime = startHour * 60 + startMin;
          const endTime = endHour * 60 + endMin;

          if (currentTime >= startTime || currentTime <= endTime) {
            console.log('Quiet hours - notification suppressed');
            return;
          }
        }

        // Show notification guide if needed
        if (Notification.permission === 'default') {
          setShowNotificationGuide(true);
          return;
        }

        // Enhanced notification options
        const enhancedOptions = {
          icon,
          tag,
          requireInteraction: priority === 'urgent' || requireInteraction,
          silent: !notifyPrefs.soundEnabled || silent,
          vibrate:
            notifyPrefs.vibrationEnabled && vibration
              ? [200, 100, 200]
              : undefined,
          data: {
            type,
            priority,
            category,
            timestamp: new Date().toISOString(),
          },
        };

        // Send notification
        await sendServiceWorkerNotification(title, body, enhancedOptions);

        // Show fallback toast with priority styling
        const toastType =
          priority === 'urgent'
            ? 'error'
            : priority === 'high'
              ? 'warning'
              : 'info';
        toast[toastType](`${title}: ${body}`);
      } catch (error) {
        console.error('Notification failed:', error);
        // Always show fallback toast
        toast.info(`${title}: ${body}`);
      }
    },
    [notifyPrefs, sendServiceWorkerNotification],
  );

  // Specialized notification functions
  const notifyEmergency = useCallback(
    (title, body) => {
      return notify(title, body, {
        type: 'emergency',
        priority: 'urgent',
        category: 'emergencyAlerts',
        requireInteraction: true,
      });
    },
    [notify],
  );

  const notifyDataBackup = useCallback(
    (title, body) => {
      return notify(title, body, {
        type: 'backup',
        priority: 'normal',
        category: 'dataBackup',
      });
    },
    [notify],
  );

  const notifySystemUpdate = useCallback(
    (title, body) => {
      return notify(title, body, {
        type: 'system',
        priority: 'high',
        category: 'systemUpdates',
      });
    },
    [notify],
  );

  const notifyCommunityEvent = useCallback(
    (title, body) => {
      return notify(title, body, {
        type: 'event',
        priority: 'normal',
        category: 'communityEvents',
      });
    },
    [notify],
  );

  return {
    notifyPrefs,
    notify,
    notifyEmergency,
    notifyDataBackup,
    notifySystemUpdate,
    notifyCommunityEvent,
    requestNotificationPermission,
    schedulePrayerNotifications,
    sendServiceWorkerNotification,
    saveNotificationPreferences,
    loadPreferences,
    showNotificationGuide,
    setShowNotificationGuide,
  };
};
