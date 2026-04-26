import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

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
      className="fixed bottom-8 right-8 w-[380px] h-[550px] bg-surface-container rounded-[2rem] border border-outline-variant shadow-2xl flex flex-col overflow-hidden z-[3000]"
    >
      <div className="p-5 border-b border-outline-variant bg-surface-container-high/50 backdrop-blur-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 overflow-hidden shadow-lg">
            {otherUser.profilePicture ? (
              <img src={otherUser.profilePicture} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-on-surface">{otherUser.username}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Student Partner</span>
          </div>
        </div>
        <button className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-all" onClick={onClose}>
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4 bg-surface-container-low/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
              msg.senderId === user.id 
                ? 'bg-primary text-on-primary rounded-tr-none' 
                : 'bg-surface-container-highest text-on-surface rounded-tl-none border border-outline-variant/30'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="p-4 border-t border-outline-variant bg-surface-container-high/50 flex gap-3 items-center shrink-0" onSubmit={handleSendMessage}>
        <input 
          type="text" 
          placeholder="Type a message..." 
          className="flex-1 bg-surface-container-low border border-outline-variant rounded-2xl px-5 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim()}
          className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
        </button>
      </form>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #34343d; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #464554; }
      `}} />
    </motion.div>
  );
}
