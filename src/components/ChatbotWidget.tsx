import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { MessageSquare, X, Send, Bot, User, Sparkles, Truck, ShieldCheck, Tag, RefreshCw, PhoneCall, ChevronRight, Minus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  actionButton?: {
    label: string;
    path: string;
  };
}

interface ChatbotWidgetProps {
  onNavigate: (path: string) => void;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ onNavigate }) => {
  const { chatOpen, setChatOpen, setSizeChartCategory, settings } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: 'Hello 👋 Welcome to PGmart Support! How can I assist you with your fashion shopping today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
    { label: '📦 Track Order', query: 'How do I track my order?' },
    { label: '👗 Sizing & Fit', query: 'What is your size guide?' },
    { label: '🏷️ Today\'s Discounts', query: 'Are there any active discount coupons?' },
    { label: '🔁 Returns & Refunds', query: 'What is your return policy?' },
    { label: '💳 Payment & COD', query: 'What payment options do you support?' },
    { label: '📞 Call Support', query: 'Can I speak to a human agent?' }
  ];

  const generateBotReply = (userQuery: string): { text: string; actionButton?: { label: string; path: string } } => {
    const q = userQuery.toLowerCase();

    if (q.includes('track') || q.includes('order') || q.includes('status') || q.includes('delivery')) {
      return {
        text: '📦 You can track your live shipment anytime! Go to your Account dashboard or click below to enter your order ID.',
        actionButton: { label: 'Track Shipment Now', path: '/account' }
      };
    }

    if (q.includes('size') || q.includes('fit') || q.includes('measurement') || q.includes('chart')) {
      return {
        text: '👗 All our clothing is crafted according to standard Indian size specifications. For women\'s ethnics and men\'s formals, we recommend choosing your regular standard size.',
        actionButton: { label: 'View Women\'s Catalog', path: '/category/women' }
      };
    }

    if (q.includes('coupon') || q.includes('discount') || q.includes('offer') || q.includes('promo') || q.includes('code')) {
      return {
        text: '🏷️ Exclusive Offers Active Today:\n• Use code WELCOME100 for Flat ₹200 OFF on orders > ₹999\n• Free Express Shipping on orders over ₹999\n• Additional 10% instant discount on UPI payments!',
        actionButton: { label: 'Explore Sale Items', path: '/category/women?tag=sale' }
      };
    }

    if (q.includes('return') || q.includes('refund') || q.includes('exchange')) {
      return {
        text: '🔁 We offer 15-Day Hassle-Free Returns & Free Reverse Pickups across India. Returned items are inspected, and refunds are initiated instantly to your original payment method within 24 hours.',
        actionButton: { label: 'Learn More / FAQs', path: '/faqs' }
      };
    }

    if (q.includes('payment') || q.includes('cod') || q.includes('cash') || q.includes('upi') || q.includes('card')) {
      return {
        text: '💳 We support Cash on Delivery (COD), All Major Credit/Debit Cards, Net Banking, and Instant UPI (Google Pay, PhonePe, Paytm). All transactions are 100% 256-bit SSL encrypted.',
      };
    }

    if (q.includes('call') || q.includes('agent') || q.includes('human') || q.includes('speak') || q.includes('contact') || q.includes('phone')) {
      return {
        text: `📞 Our customer care team is available Mon-Sat (9:00 AM - 8:00 PM IST).\nCall us directly at ${settings.contactPhone || '+91 98765 43210'} or email support@pgmart.fashion!`,
        actionButton: { label: 'Store Locator & Help', path: '/store-locator' }
      };
    }

    if (q.includes('saree') || q.includes('lehenga') || q.includes('kurta') || q.includes('ethnic')) {
      return {
        text: '✨ Our Ethnic Heritage Collection features pure Banarasi silk sarees, zari-embroidered anarkalis, chikankari kurtis, and designer lehengas.',
        actionButton: { label: 'Browse Ethnic Wear', path: '/category/women?sub=w-ethnic' }
      };
    }

    if (q.includes('dress') || q.includes('top') || q.includes('jean') || q.includes('western')) {
      return {
        text: '💃 Our Western Edit includes high-rise vintage denim jeans, chiffon peplum tops, ribbed co-ord sets, and party frocks.',
        actionButton: { label: 'Browse Western Wear', path: '/category/women?sub=w-western' }
      };
    }

    if (q.includes('innerwear') || q.includes('bra') || q.includes('brief') || q.includes('lingerie')) {
      return {
        text: '🩲 Soft, skin-friendly micro-modal innerwear, seamless bras, and breathable cotton briefs engineered for all-day comfort.',
        actionButton: { label: 'Browse Innerwear', path: '/category/undergarments' }
      };
    }

    return {
      text: "Thanks for reaching out! We offer nationwide delivery, 15-day easy returns, and 100% authentic quality fashion. How else can I assist your order today?",
      actionButton: { label: 'View All Collections', path: '/category/women' }
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = generateBotReply(query);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponse.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButton: botResponse.actionButton
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* FLOATING CHAT BOT TRIGGER BUTTON */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#C0654B] hover:bg-[#8B4A38] text-white px-4 py-3 rounded-full font-bold text-xs shadow-xl flex items-center gap-2.5 group transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
          aria-label="Open Customer Support Chatbot"
        >
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white group-hover:rotate-6 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#C0654B] animate-pulse" />
          </div>
          <span className="font-sans">Help & Support Chat</span>
          <span className="bg-white/20 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Online
          </span>
        </button>
      )}

      {/* CHATBOT WINDOW MODAL */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden text-left font-sans"
          >
            {/* CHATBOT HEADER */}
            <div className="bg-[#2B2620] text-white p-4 flex items-center justify-between border-b border-stone-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full bg-[#C0654B] flex items-center justify-center text-white border border-white/20 shadow-xs">
                  <Bot className="w-5 h-5" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#2B2620]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight font-serif flex items-center gap-1.5 text-stone-100">
                    PGmart Assistant
                  </h3>
                  <p className="text-[10px] text-stone-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                    Instant Customer Support
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
                  <div className="flex items-end gap-2 max-w-[85%]">
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
                            onNavigate(msg.actionButton!.path);
                          }}
                          className="mt-2.5 w-full bg-[#2B2620] hover:bg-[#C0654B] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>{msg.actionButton.label}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] text-stone-400 mt-1 px-1 font-mono">
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
                  <div className="bg-white border border-stone-200 p-2.5 rounded-2xl rounded-bl-none shadow-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#C0654B] rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#C0654B] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-[#C0654B] rounded-full animate-bounce [animation-delay:0.4s]" />
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
                placeholder="Ask about orders, size, returns..."
                className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#C0654B] placeholder:text-stone-400"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-[#C0654B] hover:bg-[#8B4A38] disabled:bg-stone-300 text-white p-2.5 rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
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
