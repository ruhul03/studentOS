import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useWebSockets(userId = null) {
  const [notifications, setNotifications] = useState([]);
  const [messageEvent, setMessageEvent] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL),
      debug: (str) => console.log('STOMP: ' + str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('Connected to WebSocket');
      
      // Subscribe to global notifications
      client.subscribe('/topic/notifications', (message) => {
        if (message.body) {
          setNotifications((prev) => [...prev, message.body]);
        }
      });

      // Subscribe to private notifications (explicit topic)
      client.subscribe(`/topic/notifications/${userId}`, (message) => {
        if (message.body) {
          try {
            const data = JSON.parse(message.body);
            setNotifications((prev) => [...prev, data]);
          } catch (e) {
            setNotifications((prev) => [...prev, message.body]);
          }
        }
      });

      // Subscribe to private messages (explicit topic)
      client.subscribe(`/topic/messages/${userId}`, (message) => {
        if (message.body) {
          try {
            const data = JSON.parse(message.body);
            setMessageEvent(data);
          } catch (e) {
            console.error('Failed to parse message event', e);
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

  return { notifications, messageEvent, clearNotification, setMessageEvent };
}
