// FCM Token Service for Push Notifications
// Using @react-native-firebase/messaging (for bare React Native or Expo with development build)

import { Platform, Alert } from 'react-native';
import { notificationsAPI } from './api';
import { getStoredUserInfo } from './api';

// Optional import - chỉ import khi package available
let messaging = null;
try {
  messaging = require('@react-native-firebase/messaging').default;
} catch (error) {
  console.warn('[FCM] @react-native-firebase/messaging not available. Push notifications will be disabled.');
  console.warn('[FCM] This is normal if using Expo Go. Use Expo Development Build for FCM support.');
}

/**
 * Request notification permissions
 * @returns {Promise<boolean>} True if permission granted
 */
export async function requestNotificationPermissions() {
  if (!messaging) {
    console.warn('[FCM] Messaging not available');
    return false;
  }
  
  try {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('[FCM] iOS Authorization status:', authStatus);
        return true;
      } else {
        console.log('[FCM] iOS Notification permission denied');
        return false;
      }
    }
    // Android không cần request permission
    return true;
  } catch (error) {
    console.error('[FCM] Error requesting permissions:', error);
    return false;
  }
}

/**
 * Get FCM Token
 * @returns {Promise<string|null>} FCM token or null
 */
export async function getFCMToken() {
  if (!messaging) {
    console.warn('[FCM] Messaging not available, cannot get token');
    return null;
  }
  
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('[FCM] Permission denied, cannot get token');
      return null;
    }

    const token = await messaging().getToken();
    console.log('[FCM] FCM Token:', token);
    return token;
  } catch (error) {
    console.error('[FCM] Error getting FCM token:', error);
    return null;
  }
}

/**
 * Update FCM Token to backend
 * @param {string} token - FCM token
 * @returns {Promise<boolean>} True if successful
 */
export async function updateFCMTokenToBackend(token) {
  try {
    if (!token) {
      console.log('[FCM] No token to update');
      return false;
    }

    const userInfo = await getStoredUserInfo();
    if (!userInfo?.id) {
      console.log('[FCM] User not logged in, skipping token update');
      return false;
    }

    await notificationsAPI.updateFCMToken(token, true);
    console.log('[FCM] Token updated to backend successfully');
    return true;
  } catch (error) {
    console.error('[FCM] Error updating token to backend:', error);
    return false;
  }
}

/**
 * Initialize FCM and send token to backend
 * This should be called when app starts and user is logged in
 * @returns {Promise<boolean>} True if initialized successfully
 */
export async function initializeFCM() {
  try {
    console.log('[FCM] Initializing FCM...');

    // Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('[FCM] Permission denied, cannot initialize');
      return false;
    }

    // Get token
    const token = await getFCMToken();
    if (!token) {
      console.log('[FCM] Failed to get token');
      return false;
    }

    // Update to backend
    const updated = await updateFCMTokenToBackend(token);
    if (!updated) {
      console.log('[FCM] Failed to update token to backend');
      return false;
    }

    console.log('[FCM] FCM initialized successfully');
    return true;
  } catch (error) {
    console.error('[FCM] Error initializing FCM:', error);
    return false;
  }
}

/**
 * Setup notification listeners
 * @param {Function} onNotificationReceived - Callback when notification received
 * @param {Function} onNotificationTapped - Callback when notification tapped
 * @returns {Function} Cleanup function
 */
export function setupNotificationListeners(onNotificationReceived, onNotificationTapped) {
  if (!messaging) {
    console.warn('[FCM] Messaging not available, cannot setup listeners');
    return () => {}; // Return no-op cleanup function
  }

  // Listen for token refresh
  const tokenRefreshUnsubscribe = messaging().onTokenRefresh(async (token) => {
    console.log('[FCM] Token refreshed:', token);
    await updateFCMTokenToBackend(token);
  });

  // Foreground messages (khi app đang mở)
  const foregroundUnsubscribe = messaging().onMessage(async (remoteMessage) => {
    console.log('[FCM] Foreground notification received:', remoteMessage);
    
    if (onNotificationReceived) {
      onNotificationReceived(remoteMessage);
    }

    // Hiển thị alert hoặc local notification
    if (remoteMessage.notification) {
      Alert.alert(
        remoteMessage.notification.title || 'Thông báo',
        remoteMessage.notification.body || '',
        [
          {
            text: 'Xem',
            onPress: () => {
              if (onNotificationTapped) {
                onNotificationTapped(remoteMessage);
              }
            },
          },
          { text: 'Đóng', style: 'cancel' },
        ]
      );
    }
  });

  // Background messages (khi app ở background)
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('[FCM] Background notification:', remoteMessage);
    // Xử lý logic khi app ở background
  });

  // App opened from notification (when app was closed)
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log('[FCM] App opened from notification:', remoteMessage);
        if (onNotificationTapped) {
          onNotificationTapped(remoteMessage);
        }
      }
    });

  // Notification opened app (when app was in background)
  const notificationOpenedUnsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('[FCM] Notification opened app:', remoteMessage);
    if (onNotificationTapped) {
      onNotificationTapped(remoteMessage);
    }
  });

  // Return cleanup function
  return () => {
    tokenRefreshUnsubscribe();
    foregroundUnsubscribe();
    notificationOpenedUnsubscribe();
  };
}

/**
 * Extract notification data from remoteMessage
 * @param {Object} remoteMessage - Remote message from FCM
 * @returns {Object} Extracted notification data
 */
export function extractNotificationData(remoteMessage) {
  const data = remoteMessage.data || {};
  const notification = remoteMessage.notification || {};

  return {
    id: data.notificationId || remoteMessage.messageId,
    title: notification.title || data.title || '',
    body: notification.body || data.body || '',
    borrowId: data.borrowId,
    bookId: data.bookId,
    bookTitle: data.bookTitle,
    daysUntilDue: data.daysUntilDue ? parseInt(data.daysUntilDue, 10) : undefined,
    type: data.type,
    sentAt: new Date().toISOString(), // Use current time if not provided
  };
}
