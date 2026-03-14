import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import './ChatModal.css';

export function ChatModal({ otherUser, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversation = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/conversation?user1=${user.id}&user2=${otherUser.id}`);
      if (response.ok) {
        setMessages(await response.json());
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  useEffect(() => {
    fetchConversation();
    const interval = setInterval(fetchConversation, 3000);
    return () => clearInterval(interval);
  }, [otherUser.id]);

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: otherUser.id,
          content: newMessage
        })
      });

      if (response.ok) {
        setNewMessage('');
        fetchConversation();
      }
    } catch (err) {
      console.error('Send failed', err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="chat-modal glass-card"
    >
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="avatar-micro">
            {otherUser.profilePicture ? <img src={otherUser.profilePicture} alt="" /> : <UserIcon size={12} />}
          </div>
          <span>{otherUser.username}</span>
        </div>
        <button className="chat-close" onClick={onClose}><X size={18} /></button>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-bubble ${msg.senderId === user.id ? 'sent' : 'received'}`}>
            <p>{msg.content}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSendMessage}>
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
        />
        <button type="submit" disabled={!newMessage.trim()}>
          <Send size={18} />
        </button>
      </form>
    </motion.div>
  );
}
