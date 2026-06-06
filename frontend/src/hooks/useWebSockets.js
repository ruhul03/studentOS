import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { playNotificationSound, playMessageReceivedSound } from '../utils/notificationSound';

export function useWebSockets(userId = null) {
  const [notifications, setNotifications] = useState([]);
  const [messageEvent, setMessageEvent] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || '/ws-studentos'),
      debug: () => {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      
      // Subscribe to global notifications
      client.subscribe('/topic/notifications', (message) => {
        if (message.body) {
          try {
            const data = typeof message.body === 'string' ? JSON.parse(message.body) : message.body;
            const notificationData = data.id ? data : { ...data, id: `global-${Date.now()}-${Math.random()}` };
            setNotifications((prev) => [...prev, notificationData]);
            if (localStorage.getItem('notificationsMuted') !== 'true') playNotificationSound();
          } catch (e) {
            setNotifications((prev) => [...prev, { message: message.body, type: 'broadcast', title: 'Announcement', id: Date.now() }]);
          }
        }
      });

      // Subscribe to private notifications
      client.subscribe(`/topic/notifications/${userId}`, (message) => {
        if (message.body) {
          try {
            const data = typeof message.body === 'string' ? JSON.parse(message.body) : message.body;
            const notificationData = data.id ? data : { ...data, id: `private-${Date.now()}-${Math.random()}` };
            setNotifications((prev) => [...prev, notificationData]);
            if (localStorage.getItem('notificationsMuted') !== 'true') playNotificationSound();
          } catch (e) {
            console.error('Failed to parse private notification', e);
          }
        }
      });

      // Subscribe to private messages
      client.subscribe(`/topic/messages/${userId}`, (message) => {
        if (message.body) {
          try {
            const data = typeof message.body === 'string' ? JSON.parse(message.body) : message.body;
            setMessageEvent(data);
            if (localStorage.getItem('notificationsMuted') !== 'true') playMessageReceivedSound();
          } catch (e) {
            console.error('Failed to parse private message', e);
          }
        }
      });
    };

    client.onStompError = (frame) => {
      console.warn('STOMP error:', frame.headers['message']);
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [userId]);

  const clearNotification = (index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return { notifications, messageEvent, clearNotification, clearAllNotifications, setMessageEvent };
}
