'use client';

import { useState } from 'react';
import { MessageCircle, Send, Sparkles, UserCheck, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useSite } from '@/contexts/SiteContext';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiChatbotWidget() {
  const { settings } = useSite();
  const [open, setOpen] = useState(false);
  const [sessionId] = useState(() => `web-${Date.now()}`);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        settings.chatbot_welcome ||
        'Xin chào nàng dâu tương lai! Mình là trợ lý AI của BellaBridal. Mình có thể hỗ trợ bạn chọn váy cưới, báo giá hoặc đặt lịch thử váy ngay hôm nay.',
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  if (settings.chatbot_enabled === '0') return null;

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setSending(true);
    try {
      const res = await apiClient.post<{ reply: string }>('/chatbot/message', {
        session_id: sessionId,
        message: text,
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Xin lỗi, hệ thống tư vấn đang bận. Bạn có thể gọi hotline 0901 234 567 nhé!' },
      ]);
    } finally {
      setSending(false);
    }
  };

  const requestHandoff = async () => {
    try {
      const res = await apiClient.post<{ message: string }>('/chatbot/handoff', { session_id: sessionId });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.message }]);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-plum px-4 py-3 text-sm font-medium text-white shadow-luxury transition-transform hover:scale-105 hover:bg-plum-dark"
          aria-label="Mở trợ lý AI BellaBridal"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Tư vấn AI 24/7</span>
          <MessageCircle className="h-4 w-4 sm:hidden" />
        </button>
      ) : (
        <div className="flex h-[440px] w-[340px] flex-col overflow-hidden rounded-2xl border border-blush-pink bg-ivory shadow-2xl sm:w-[370px]">
          <div className="flex items-center justify-between bg-plum px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <div>
                <p className="text-sm font-semibold">BellaBridal AI Concierge</p>
                <p className="text-[11px] text-white/85">Tư vấn chọn váy & đặt lịch</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Đóng chat">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-rose-gold text-white'
                      : 'border border-blush-pink/60 bg-white text-charcoal'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-blush-pink/60 bg-cream/60 px-3 py-1.5">
            <button
              type="button"
              onClick={requestHandoff}
              className="flex items-center gap-1.5 text-xs font-medium text-rose-gold-dark hover:underline"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Kết nối Bridal Stylist trực tiếp</span>
            </button>
          </div>

          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-blush-pink/60 bg-white p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về giá thuê, dáng váy..."
              className="flex-1 rounded-lg border border-blush-pink px-3 py-2 text-sm focus:border-rose-gold focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending}
              className="rounded-lg bg-rose-gold p-2.5 text-white hover:bg-rose-gold-dark disabled:opacity-50"
              aria-label="Gửi tin nhắn"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
