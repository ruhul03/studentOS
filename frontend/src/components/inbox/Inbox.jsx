import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../api';
import { playMessageSentSound } from '../../utils/notificationSound';
import { Search, User, Send, MessageCircle, MoreVertical, Trash2, Ban, Plus, ArrowLeft, Loader2 } from 'lucide-react';

export function Inbox({ messageEvent, onProfileView }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef(null);

  const handleUserSearch = async (query) => {
    setUserSearchQuery(query);
    if (!query.trim()) {
      setUserSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/users/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        let results = await res.json();
        // filter out self
        results = results.filter(u => u.id !== user?.id);
        setUserSearchResults(results);
      }
    } catch (err) {
      console.error('Failed to search users', err);
    } finally {
      setIsSearching(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchInbox = async () => {
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/messages/inbox`);
      if (res.ok) {
        setConversations(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch inbox', err);
    }
  };

  const fetchConversation = async (otherUserId) => {
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/messages/conversation?user1=${user?.id}&user2=${otherUserId}`);
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch conversation', err);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  useEffect(() => {
    if (activeChatUser) {
      fetchConversation(activeChatUser.id);
      fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/messages/read/${activeChatUser.id}`, { method: 'PUT' }).then(() => fetchInbox());
    }
  }, [activeChatUser]);

  useEffect(() => {
    if (messageEvent) {
      // Update inbox list preview
      setConversations(prev => {
        const existingIdx = prev.findIndex(c => c.otherUser.id === messageEvent.senderId || c.otherUser.id === messageEvent.receiverId);
        let newList = [...prev];
        if (existingIdx > -1) {
          const updatedConv = { ...newList[existingIdx], latestMessage: messageEvent };
          newList.splice(existingIdx, 1);
          newList.unshift(updatedConv);
        } else {
          fetchInbox(); // If it's a completely new person, just re-fetch to get their User object
        }
        return newList;
      });

      // Update active chat if it matches
      if (activeChatUser && (messageEvent.senderId === activeChatUser.id || messageEvent.receiverId === activeChatUser.id)) {
        setMessages(prev => {
          if (prev.some(m => m.id === messageEvent.id)) return prev;
          return [...prev, messageEvent];
        });
      }
    }
  }, [messageEvent, activeChatUser]);

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatUser) return;

    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/messages/send`, {
        method: 'POST',
        body: JSON.stringify({
          senderId: user?.id,
          receiverId: activeChatUser.id,
          content: newMessage
        })
      });

      if (response.ok) {
        const savedMessage = await response.json();
        setNewMessage('');
        playMessageSentSound();
        setMessages(prev => {
          if (prev.some(m => m.id === savedMessage.id)) return prev;
          return [...prev, savedMessage];
        });
        
        // Update local inbox preview
        setConversations(prev => {
          const existingIdx = prev.findIndex(c => c.otherUser.id === activeChatUser.id);
          let newList = [...prev];
          if (existingIdx > -1) {
            newList[existingIdx].latestMessage = savedMessage;
            const updated = newList.splice(existingIdx, 1)[0];
            newList.unshift(updated);
          }
          return newList;
        });
      }
    } catch (err) {
      console.error('Send failed', err);
    }
  };

  const handleDeleteMessage = async (msgId, mode) => {
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/messages/${msgId}?mode=${mode}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages(prev => prev
          .map(m => m.id === msgId ? (mode === 'for_everyone' ? { ...m, deletedForEveryone: true, content: 'This message was deleted' } : m) : m)
          .filter(m => !(mode === 'for_me' && m.id === msgId))
        );
        setOpenMenuId(null);
        fetchInbox();
      }
    } catch (err) { console.error('Delete failed', err); }
  };

  const handleClearConversation = async () => {
    if (!activeChatUser) return;
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/messages/conversation/${activeChatUser.id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages([]);
        setHeaderMenuOpen(false);
        fetchInbox();
      }
    } catch (err) { console.error('Clear conversation failed', err); }
  };

  const filteredConversations = conversations.filter(c => 
    c.otherUser.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.otherUser.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-140px)] bg-surface-container rounded-3xl border border-outline-variant overflow-hidden shadow-sm">
      
      {/* ── Left Pane: Conversation List ── */}
      <div className="w-80 border-r border-outline-variant flex flex-col bg-surface-container-low/30">
        <div className="p-4 border-b border-outline-variant/50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-on-surface mb-0">Inbox</h2>
            <button 
              onClick={() => { setIsSearchingUsers(!isSearchingUsers); setUserSearchQuery(''); setUserSearchResults([]); }} 
              className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              title={isSearchingUsers ? "Back to Inbox" : "New Chat"}
            >
              {isSearchingUsers ? <ArrowLeft size={16} /> : <Plus size={16} />}
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" size={16} />
            <input 
              type="text" 
              placeholder={isSearchingUsers ? "Search users by name or username..." : "Search conversations..."}
              value={isSearchingUsers ? userSearchQuery : searchQuery}
              onChange={(e) => isSearchingUsers ? handleUserSearch(e.target.value) : setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant rounded-xl pl-9 pr-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isSearchingUsers ? (
            isSearching ? (
              <div className="p-6 text-center text-on-surface-variant/60 text-sm flex items-center justify-center gap-2">
                 <Loader2 size={16} className="animate-spin" /> Searching...
              </div>
            ) : userSearchResults.length === 0 && userSearchQuery ? (
              <div className="p-6 text-center text-on-surface-variant/60 text-sm">
                No users found.
              </div>
            ) : userSearchResults.length === 0 ? (
              <div className="p-6 text-center text-on-surface-variant/60 text-sm">
                Type to search for someone to chat with.
              </div>
            ) : (
              userSearchResults.map(u => (
                <div 
                  key={u.id}
                  onClick={() => { 
                    setActiveChatUser(u); 
                    setIsSearchingUsers(false); 
                    setUserSearchQuery(''); 
                    setUserSearchResults([]); 
                  }}
                  className="p-4 border-b border-outline-variant/30 cursor-pointer hover:bg-surface-container-highest transition-colors flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 overflow-hidden shadow-sm">
                    {u.profilePicture ? (
                      <img src={u.profilePicture} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{u.name || u.username}</p>
                    <p className="text-xs text-on-surface-variant">@{u.username}</p>
                  </div>
                </div>
              ))
            )
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-on-surface-variant/60 text-sm">
              No conversations found.
            </div>
          ) : (
            filteredConversations.map((conv, idx) => (
              <div 
                key={conv.otherUser.id}
                onClick={() => setActiveChatUser(conv.otherUser)}
                className={`p-4 border-b border-outline-variant/30 cursor-pointer hover:bg-surface-container-highest transition-colors ${activeChatUser?.id === conv.otherUser.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
              >
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 overflow-hidden shadow-sm">
                    {conv.otherUser.profilePicture ? (
                      <img src={conv.otherUser.profilePicture} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-on-surface truncate">{conv.otherUser.name || conv.otherUser.username}</p>
                      {conv.latestMessage && (
                        <span className="text-[10px] text-on-surface-variant/70 shrink-0">
                          {new Date(conv.latestMessage.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${conv.latestMessage?.receiverId === user?.id && !conv.latestMessage.isRead ? 'font-bold text-on-surface' : 'text-on-surface-variant/80'}`}>
                      {conv.latestMessage?.senderId === user?.id ? 'You: ' : ''}
                      {conv.latestMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Right Pane: Active Chat ── */}
      <div className="flex-1 flex flex-col bg-surface-container-lowest">
        {activeChatUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-outline-variant/50 bg-surface-container-low/50 backdrop-blur-md flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary cursor-pointer hover:bg-primary/20 transition-colors overflow-hidden"
                  onClick={() => onProfileView?.(activeChatUser.id)}
                  title="View Profile"
                >
                  {activeChatUser.profilePicture ? (
                    <img src={activeChatUser.profilePicture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface cursor-pointer hover:text-primary transition-colors" onClick={() => onProfileView?.(activeChatUser.id)}>
                    {activeChatUser.name || activeChatUser.username}
                  </h3>
                  <p className="text-xs text-on-surface-variant">Student</p>
                </div>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                  <MoreVertical size={20} />
                </button>
                <AnimatePresence>
                  {headerMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 top-12 w-48 bg-surface-container-high border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden"
                    >
                      <button 
                        onClick={() => { setHeaderMenuOpen(false); onProfileView?.(activeChatUser.id); }}
                        className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container-highest transition-colors flex items-center gap-2"
                      >
                        <User size={16} /> View Profile
                      </button>
                      <button 
                        onClick={handleClearConversation}
                        className="w-full text-left px-4 py-3 text-sm text-error hover:bg-error/10 transition-colors flex items-center gap-2 border-t border-outline-variant/30"
                      >
                        <Trash2 size={16} /> Clear Conversation
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-on-surface-variant/50 space-y-3">
                  <MessageCircle size={48} className="opacity-20" />
                  <p className="text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.senderId === user?.id;
                  const showAvatar = i === messages.length - 1 || messages[i+1]?.senderId !== msg.senderId;
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex gap-3 max-w-[80%] relative group ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                      onMouseEnter={() => setHoveredMessageId(msg.id)}
                      onMouseLeave={() => setHoveredMessageId(null)}
                    >
                      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs overflow-hidden ${isMe ? 'bg-primary/20 text-primary' : 'bg-surface-variant text-on-surface-variant'} ${!showAvatar ? 'invisible' : ''}`}>
                         {isMe ? 'You' : (activeChatUser.profilePicture ? <img src={activeChatUser.profilePicture} className="w-full h-full object-cover" /> : <User size={14}/>)}
                      </div>
                      
                      <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                        isMe 
                          ? 'bg-primary text-on-primary rounded-br-sm' 
                          : 'bg-surface-container-highest text-on-surface rounded-bl-sm border border-outline-variant/30'
                      }`}>
                        {msg.deletedForEveryone ? (
                          <div className="flex items-center gap-1.5 italic opacity-70">
                            <Ban size={14} />
                            This message was deleted
                          </div>
                        ) : (
                          msg.content
                        )}
                        <div className={`text-[9px] mt-1.5 opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {/* Hover Menu Button */}
                      {(hoveredMessageId === msg.id || openMenuId === msg.id) && (
                        <div className="relative flex items-center">
                          <button 
                            onClick={() => setOpenMenuId(openMenuId === msg.id ? null : msg.id)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {/* Popover */}
                          <AnimatePresence>
                            {openMenuId === msg.id && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`absolute top-full mt-1 ${isMe ? 'right-0' : 'left-0'} w-40 bg-surface-container-high border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden`}
                              >
                                <button 
                                  onClick={() => handleDeleteMessage(msg.id, 'for_me')}
                                  className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-highest transition-colors"
                                >
                                  Delete for me
                                </button>
                                {isMe && !msg.deletedForEveryone && (
                                  <button 
                                    onClick={() => handleDeleteMessage(msg.id, 'for_everyone')}
                                    className="w-full text-left px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors border-t border-outline-variant/30"
                                  >
                                    Delete for everyone
                                  </button>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-surface-container-low border-t border-outline-variant/50">
              <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="flex-1 bg-surface-container-high border border-outline-variant rounded-2xl px-5 py-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all"
                >
                  <Send size={20} className="fill-current" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-on-surface-variant/40 space-y-4">
            <MessageCircle size={64} className="opacity-10" />
            <p className="text-base font-medium">Select a conversation to start messaging</p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #34343d; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #464554; }
      `}} />
    </div>
  );
}
