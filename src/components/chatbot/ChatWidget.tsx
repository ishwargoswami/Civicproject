/**
 * AI Chatbot Widget Component
 * Floating chat interface for civic assistant
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  startChatSession,
  sendChatMessage,
  openChat,
  closeChat,
  minimizeChat,
  maximizeChat,
  toggleChat,
  resetChat,
} from '../../store/slices/chatbotSlice';
import {
  MessageCircle,
  X,
  Minimize2,
  Maximize2,
  Send,
  RotateCcw,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface ChatWidgetProps {
  className?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ className = '' }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isOpen, isMinimized, sessionId, messages, isTyping, unreadCount } = useSelector(
    (state: RootState) => state.chatbot
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && isOpen && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleToggleChat = () => {
    if (!sessionId) {
      dispatch(startChatSession());
    } else {
      dispatch(toggleChat());
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const message = inputMessage.trim();
    if (!message || !sessionId) return;

    setInputMessage('');
    
    try {
      await dispatch(sendChatMessage({ sessionId, message })).unwrap();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleQuickReply = (reply: any) => {
    if (reply.action === 'navigate' && reply.url) {
      window.location.href = reply.url;
    } else {
      setInputMessage(reply.text);
      inputRef.current?.focus();
    }
  };

  const handleResetChat = () => {
    dispatch(resetChat());
    dispatch(startChatSession());
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Bubble Button */}
      <AnimatePresence>
        {(!isOpen || isMinimized) && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleChat}
            className={`fixed bottom-6 right-6 z-50 group ${className}`}
          >
            <div className="relative">
              {/* Pulsing background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
              
              {/* Button */}
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-2xl">
                <MessageCircle className="w-6 h-6" />
              </div>

              {/* Unread badge */}
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.div>
              )}
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-800"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-blue-600" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Civic Assistant</h3>
                  <p className="text-blue-100 text-xs">AI-powered help</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetChat}
                  className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                  title="New Chat"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => dispatch(minimizeChat())}
                  className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                  title="Minimize"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => dispatch(closeChat())}
                  className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
              {messages.map((msg, index) => (
                <div key={msg.id || index}>
                  {/* Message bubble */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : 'bg-gray-800 text-gray-100 border border-gray-700'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </motion.div>

                  {/* Quick Replies */}
                  {msg.sender === 'bot' && msg.quick_replies && msg.quick_replies.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex flex-wrap gap-2 mt-2 ml-2"
                    >
                      {msg.quick_replies.map((reply, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickReply(reply)}
                          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs rounded-full border border-gray-700 hover:border-blue-500 transition-all duration-200 flex items-center gap-1"
                        >
                          {reply.text}
                          {reply.action === 'navigate' && <ChevronRight className="w-3 h-3" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2.5 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-blue-500/50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              
              {user && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Logged in as <span className="text-blue-400">{user.first_name}</span>
                </p>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;

