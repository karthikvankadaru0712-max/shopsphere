import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, ShoppingBag, ArrowUpRight, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export const AiConcierge = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I'm your ShopSphere Concierge. Ask me for tailored recommendations, budget-specific finds, or sustainability insights from our verified Product Passports.",
      products: []
    }
  ]);

  const { addToCart } = useCart();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText) => {
    const query = (messageText || input).trim();
    if (!query || loading) return;

    const userMsg = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: query,
      products: []
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: query });
      const payload = res.data?.data || res.data || {};

      const aiMsg = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: payload.reply || "Here are some top curated recommendations based on your request:",
        products: payload.products || []
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: 'ai_' + Date.now(),
          sender: 'ai',
          text: "I'm having a momentary connection glitch. Could you please rephrase or ask again?",
          products: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    handleSend(prompt);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: "Conversation reset. How can I help you discover something extraordinary today?",
        products: []
      }
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-sphere-charcoal text-white shadow-2xl hover:scale-105 active:scale-95 transition-all border border-sphere-violet/40 group"
          aria-label="Open AI Concierge"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-sphere-violet animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="text-xs font-bold tracking-wide">ShopSphere AI</span>
        </button>
      )}

      {/* Concierge Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-3xl bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-sphere-charcoal to-gray-900 text-white flex items-center justify-between border-b border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sphere-violet/20 border border-sphere-violet/30 text-sphere-violet">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-wide flex items-center gap-1.5">
                  ShopSphere Concierge
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </h3>
                <p className="text-[10px] text-gray-400">Intelligent discovery & product advice</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Reset Conversation"
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Window"
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
            <button
              onClick={() => handleQuickPrompt('Sustainable tech picks')}
              className="px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700 whitespace-nowrap hover:border-sphere-violet hover:text-sphere-violet transition-colors font-medium"
            >
              🌱 Sustainable Tech
            </button>
            <button
              onClick={() => handleQuickPrompt('Desks under 25000')}
              className="px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700 whitespace-nowrap hover:border-sphere-violet hover:text-sphere-violet transition-colors font-medium"
            >
              🏷️ Desks under ₹25k
            </button>
            <button
              onClick={() => handleQuickPrompt('Coffee accessories')}
              className="px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700 whitespace-nowrap hover:border-sphere-violet hover:text-sphere-violet transition-colors font-medium"
            >
              ☕ Coffee Picks
            </button>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-full bg-sphere-violet/10 text-sphere-violet border border-sphere-violet/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] text-xs leading-relaxed p-3.5 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-sphere-charcoal text-white rounded-tr-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200/60'
                  }`}
                >
                  <p>{m.text}</p>

                  {/* Recommended Products */}
                  {m.products && m.products.length > 0 && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-gray-200">
                      {m.products.map((p) => (
                        <div
                          key={p._id}
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-gray-200 hover:border-sphere-violet transition-all shadow-xs group"
                        >
                          <img
                            src={p.images?.[0] || 'https://via.placeholder.com/80'}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-lg bg-gray-50 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-[11px] text-gray-900 truncate group-hover:text-sphere-violet">
                              {p.name}
                            </h4>
                            <div className="flex items-center justify-between mt-0.5">
                              <span className="font-black text-xs text-gray-900">
                                ₹{Number(p.price).toLocaleString()}
                              </span>
                              {p.productPassport?.repairability && (
                                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Score {p.productPassport.repairability}/10
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              onClick={() => {
                                addToCart(p, 1);
                                toast.success(`Added ${p.name} to cart!`);
                              }}
                              title="Add to Cart"
                              className="p-1.5 rounded-lg bg-sphere-charcoal text-white hover:bg-sphere-violet transition-colors"
                            >
                              <ShoppingBag className="w-3 h-3" />
                            </button>
                            <Link
                              to={`/product/${p.slug}`}
                              onClick={() => setIsOpen(false)}
                              title="View Product"
                              className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-xs text-gray-500">
                <div className="w-7 h-7 rounded-full bg-sphere-violet/10 text-sphere-violet flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl bg-gray-100 text-gray-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sphere-violet animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-sphere-violet animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-sphere-violet animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products, budget, or materials..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-sphere-violet/20 focus:border-sphere-violet"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-sphere-charcoal text-white hover:bg-sphere-violet disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
