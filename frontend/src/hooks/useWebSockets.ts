import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

export function useWebSockets() {
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8081/ws-studentos');
    const stompClient = Stomp.over(socket);
    stompClient.debug = () => {}; // Disable debug logging for cleaner console

    stompClient.connect({}, () => {
      stompClient.subscribe('/topic/notifications', (message) => {
        if (message.body) {
          setNotifications((prev) => [...prev, message.body]);
        }
      });
    }, (error) => {
      console.warn('WebSocket connection error:', error);
    });

    return () => {
      if (stompClient.connected) {
        stompClient.disconnect(() => {});
      }
    };
  }, []);

  const clearNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return { notifications, clearNotification };
}
