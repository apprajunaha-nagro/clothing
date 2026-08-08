import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { MessageSquare, X, Send, Bot, Sparkles, ChevronRight, ExternalLink, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  isAi?: boolean;
  actionButton?: {
    label: string;
    path?: string;
  };
}

interface ChatbotWidgetProps {
  onNavigate: (path: string) => void;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ onNavigate }) => {
  const { chatOpen, setChatOpen, settings } = useStore();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: 'Hello 👋 Welcome to PGmart AI Assistant!\n\nI am your dedicated AI Fashion & Shopping Assistant. Ask me anything about outfit matching, sizing recommendations, live order tracking, or today\'s best discount codes!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAi: true,
      actionButton: {
        label: '✨ Explore Women\'s Collection',
        path: '/category/women'
      }
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (chatOpen) {
      scrollToBottom();
    }
  }, [messages, chatOpen, isTyping]);

  const quickPills = [
    { label: '📦 Track My Order', query: 'How do I track my order?' },
    { label: '👗 Size & Fit Guide', query: 'What is your size guide?' },
    { label: '🏷️ Active Coupon Codes', query: 'Are there any active discount coupons?' },
    { label: '🔁 Returns & Refunds', query: 'What is your return policy?' },
    { label: '💳 Payment Options', query: 'What payment options do you support?' },
    { label: '✨ Recommend Saree Outfits', query: 'Can you recommend Banarasi sarees?' }
  ];

  const generateLocalBotReply = (userQuery: string): { text: string; actionButton?: { label: string; path?: string } } => {
    const q = userQuery.toLowerCase();

    if (q.includes('track') || q.includes('order') || q.includes('status') || q.includes('delivery')) {
      return {
        text: '📦 You can track your live shipment anytime! Visit your Account dashboard or click below to enter your order number.',
        actionButton: { label: 'Track Shipment Now', path: '/account' }
      };
    }

    if (q.includes('size') || q.includes('fit') || q.includes('measurement') || q.includes('chart')) {
      return {
        text: '👗 All PGmart apparel is crafted to standard Indian size specifications. For ethnic sarees, kurtis, and men\'s formals, choose your regular standard size.',
        actionButton: { label: 'View Women\'s Catalog', path: '/category/women' }
      };
    }

    if (q.includes('coupon') || q.includes('discount') || q.includes('offer') || q.includes('promo') || q.includes('code')) {
      return {
        text: '🏷️ Exclusive Offers Active Today:\n• Code WELCOME100: Flat ₹200 OFF on orders > ₹999\n• Free Express Shipping on orders over ₹999\n• Additional 10% instant discount on UPI payments!',
        actionButton: { label: 'Explore Festive Sale', path: '/category/women?tag=sale' }
      };
    }

    if (q.includes('return') || q.includes('refund') || q.includes('exchange')) {
      return {
        text: '🔁 We offer 15-Day Hassle-Free Returns & Free Doorstep Reverse Pickups across India. Refunds are processed within 24 hours of inspection.',
        actionButton: { label: 'Learn More / FAQs', path: '/faqs' }
      };
    }

    if (q.includes('payment') || q.includes('cod') || q.includes('cash') || q.includes('upi') || q.includes('card')) {
      return {
        text: '💳 We support Cash on Delivery (COD), UPI (Google Pay, PhonePe, Paytm), All Credit/Debit Cards, and Net Banking.',
      };
    }

    if (q.includes('saree') || q.includes('lehenga') || q.includes('kurta') || q.includes('ethnic')) {
      return {
        text: '✨ Our Ethnic Heritage Collection features pure Banarasi silk sarees, zari-embroidered anarkalis, chikankari kurtis, and designer lehengas.',
        actionButton: { label: 'Browse Ethnic Wear', path: '/category/women?sub=w-ethnic' }
      };
    }

    return {
      text: "Thanks for asking! As PGmart AI Assistant, I can help you find trending sarees, kurtas, shirts, innerwear, and track live orders. How else can I assist your shopping today?",
      actionButton: { label: 'Explore Collections', path: '/category/women' }
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      // Call Gemini AI backend endpoint
      const formattedHistory = newMessages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await fetch('/api/ai-stylist/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: formattedHistory })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.text) {
          const aiMsg: ChatMessage = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAi: true
          };
          setMessages(prev => [...prev, aiMsg]);
          setIsTyping(false);
          return;
        }
      }
    } catch (err) {
      console.warn('AI API call fallback to local engine:', err);
    }

    // Fallback to local intelligent AI bot engine
    setTimeout(() => {
      const localReply = generateLocalBotReply(query);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: localReply.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButton: localReply.actionButton
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 500);
  };

  const whatsappLink = "https://wa.me/919471155434?text=Hi%2C%20I%20have%20a%20question%20about%20PGmart";

  return (
    <>
      {/* TWO INDEPENDENT VERTICALLY STACKED FLOATING CHAT BUTTONS (Positioned on Left Side) */}
      {!chatOpen && (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col items-center gap-3 pb-safe">
          {/* BUTTON B — DIRECT WHATSAPP TOGGLE */}
          <motion.a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="group relative w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-colors cursor-pointer border-2 border-white"
            aria-label="Chat with us on WhatsApp"
          >
            {/* Standard WhatsApp SVG Glyph */}
            <svg
              className="w-7 h-7 fill-current text-white shrink-0 group-hover:rotate-6 transition-transform"
              viewBox="0 0 24 24"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>

            {/* Desktop Tooltip / Mobile Label */}
            <span className="absolute left-16 bg-[#2B2620] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-stone-700">
              Chat with us on WhatsApp
            </span>
          </motion.a>

          {/* BUTTON A — AI STYLIST CHATBOT TOGGLE */}
          <motion.button
            onClick={() => setChatOpen(true)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="group relative w-14 h-14 rounded-full bg-[#C0654B] hover:bg-[#8B4A38] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-colors cursor-pointer border-2 border-white font-sans"
            aria-label="Chat with our AI Stylist"
          >
            {/* Subtle Pulse / Glow Animation */}
            <motion.span
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-[#C0654B] -z-10"
            />

            <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />

            {/* Desktop Tooltip / Mobile Label */}
            <span className="absolute left-16 bg-[#2B2620] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-stone-700">
              Chat with our AI Stylist
            </span>
          </motion.button>
        </div>
      )}

      {/* CHATBOT WINDOW MODAL */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 w-[calc(100vw-2rem)] sm:w-[390px] h-[540px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden text-left font-sans"
          >
            {/* CHATBOT HEADER */}
            <div className="bg-[#2B2620] text-white p-3.5 flex items-center justify-between border-b border-stone-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-[#C0654B] to-[#e68367] flex items-center justify-center text-white border border-white/20 shadow-xs">
                  <Bot className="w-5 h-5" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#2B2620]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight font-serif flex items-center gap-1.5 text-stone-100">
                    <span>PGmart AI Assistant</span>
                    <span className="bg-[#C0654B] text-[9px] text-white px-1.5 py-0.2 rounded-full font-sans uppercase font-bold flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> AI
                    </span>
                  </h3>
                  <p className="text-[10px] text-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                    Online 24x7 | Powered by Gemini AI
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-stone-400">
                <button
                  onClick={() => setChatOpen(false)}
                  className="p-1.5 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close Chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* MESSAGES BODY */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-stone-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-end gap-2 max-w-[88%]">
                    {msg.sender === 'bot' && (
                      <div className="w-6 h-6 rounded-full bg-[#C0654B] text-white flex items-center justify-center shrink-0 text-[10px]">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#C0654B] text-white rounded-br-none shadow-xs'
                          : 'bg-white text-stone-800 border border-stone-200/80 rounded-bl-none shadow-xs'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                      
                      {/* Optional Action Button */}
                      {msg.actionButton && (
                        <button
                          onClick={() => {
                            setChatOpen(false);
                            if (msg.actionButton?.path) onNavigate(msg.actionButton.path);
                          }}
                          className="mt-2.5 w-full bg-[#2B2620] hover:bg-[#C0654B] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>{msg.actionButton.label}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] text-stone-400 mt-1 px-1 font-mono flex items-center gap-1">
                    {msg.isAi && <Sparkles className="w-2.5 h-2.5 text-[#C0654B]" />}
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-stone-400 text-xs">
                  <div className="w-6 h-6 rounded-full bg-[#C0654B] text-white flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-white border border-stone-200 p-2.5 rounded-2xl rounded-bl-none shadow-xs flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#C0654B] animate-spin" />
                    <span className="text-[11px] text-stone-500 font-medium">AI is thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* QUICK PRESET CHIPS */}
            <div className="p-2.5 bg-stone-100/80 border-t border-stone-200 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {quickPills.map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(pill.query)}
                  className="bg-white hover:bg-[#F3E9E4] text-stone-700 hover:text-[#C0654B] border border-stone-200 text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* INPUT FOOTER */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-stone-200 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI about fashion, sizes, or orders..."
                className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#C0654B] placeholder:text-stone-400"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-[#C0654B] hover:bg-[#8B4A38] disabled:bg-stone-300 text-white p-2.5 rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs flex items-center justify-center gap-1"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
