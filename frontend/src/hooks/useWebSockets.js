import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useWebSockets(userId = null) {
  const [notifications, setNotifications] = useState([]);
  const [messageEvent, setMessageEvent] = useState(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL),
      debug: (str) => {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      // Subscribe to global notifications
      client.subscribe('/topic/notifications', (message) => {
        if (message.body) {
          setNotifications((prev) => [...prev, message.body]);
        }
      });

      // Subscribe to private notifications
      if (userId) {
        client.subscribe(`/user/${userId}/queue/notifications`, (message) => {
          if (message.body) {
            try {
              const data = JSON.parse(message.body);
              // If it's a message object, trigger message event
              if (data.senderId && data.content) {
                setMessageEvent(data);
              } else {
                setNotifications((prev) => [...prev, message.body]);
              }
            } catch (e) {
              setNotifications((prev) => [...prev, message.body]);
            }
          }
        });
      }
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
