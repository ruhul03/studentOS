import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useWebSockets() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const client = new Client({
      // brokerURL: 'ws://localhost:8081/ws-studentos',
      webSocketFactory: () => new SockJS('http://localhost:8081/ws-studentos'),
      debug: (str) => {
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      client.subscribe('/topic/notifications', (message) => {
        if (message.body) {
          setNotifications((prev) => [...prev, message.body]);
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
  }, []);

  const clearNotification = (index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return { notifications, clearNotification };
}
