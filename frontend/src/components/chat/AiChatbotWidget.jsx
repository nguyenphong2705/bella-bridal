import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, Send, Sparkles, X } from 'lucide-react';
import api from '../../api/client';
import { useSite } from '../../contexts/SiteContext';
import { formatPrice } from '../../utils/format';

const QUICK_PROMPTS = [
  'Tư vấn váy cưới theo vóc dáng',
  'Giá thuê váy cưới bao nhiêu?',
  'Gói dịch vụ cưới trọn gói',
  'Hướng dẫn đặt lịch thử váy',
];

export default function AiChatbotWidget() {
  const { settings } = useSite();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionToken, setSessionToken] = useState(() => localStorage.getItem('bella_chat_token') || '');
  const [messages, setMessages] = useState([]);
  const [handoffSuccess, setHandoffSuccess] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (settings.chatbot_enabled === '0') return;
    if (sessionToken) {
      api
        .get('/chatbot/history', { params: { session_token: sessionToken } })
        .then(({ data }) => {
          if (data.messages?.length) {
            setMessages(data.messages);
          } else {
            setMessages([{ sender: 'assistant', content: settings.chatbot_welcome }]);
          }
        })
        .catch(() => {
          setMessages([{ sender: 'assistant', content: settings.chatbot_welcome }]);
        });
    } else {
      setMessages([{ sender: 'assistant', content: settings.chatbot_welcome }]);
    }
  }, [settings.chatbot_enabled, settings.chatbot_welcome, sessionToken]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  if (settings.chatbot_enabled === '0') return null;

  const sendMessage = async (textToSend) => {
    const text = (textToSend ?? input).trim();
    if (!text || sending) return;

    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', content: text }]);
    setSending(true);

    try {
      const { data } = await api.post('/chatbot/message', {
        message: text,
        session_token: sessionToken || undefined,
      });

      if (data.session_token && data.session_token !== sessionToken) {
        setSessionToken(data.session_token);
        localStorage.setItem('bella_chat_token', data.session_token);
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          content: data.reply,
          suggested_dresses: data.suggested_dresses || [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          content: `Hiện tại kết nối trợ lý AI đang bận. Bạn vui lòng liên hệ trực tiếp chuyên viên qua Hotline ${settings.hotline} hoặc nhấn nút Zalo bên trên nhé!`,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleHandoff = async () => {
    if (!sessionToken) {
      window.open(settings.zalo_url, '_blank', 'noreferrer');
      return;
    }
    try {
      await api.post('/chatbot/handoff', { session_token: sessionToken });
      setHandoffSuccess(true);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'staff',
          content: `Đã chuyển yêu cầu sang chuyên viên tư vấn BellaBridal. Bạn có thể chat Zalo ngay hoặc gọi ${settings.hotline}.`,
        },
      ]);
    } catch {
      window.open(settings.zalo_url, '_blank', 'noreferrer');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Mở trợ lý AI BellaBridal"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-rose-gold px-4 py-3.5 text-sm font-medium text-white shadow-luxury transition-all duration-300 hover:bg-rose-gold-dark sm:right-6"
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        <span className="hidden sm:inline">{open ? 'Đóng tư vấn' : 'AI Tư Vấn 24/7'}</span>
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 z-50 flex h-[500px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-blush-pink bg-ivory shadow-2xl sm:right-6">
          <div className="flex items-center justify-between bg-cream px-4 py-3 border-b border-blush-pink">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-soft-pink text-rose-gold-dark">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="font-serif text-lg font-semibold leading-tight text-charcoal">
                  BellaBridal Concierge
                </p>
                <p className="text-[11px] text-emerald-700">● Trực tuyến 24/7</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleHandoff}
              title="Chuyển sang nhân viên tư vấn"
              className="inline-flex items-center gap-1 rounded-lg border border-rose-gold/50 bg-white px-2.5 py-1.5 text-[11px] font-medium text-rose-gold-dark hover:bg-soft-pink"
            >
              <Headphones className="h-3.5 w-3.5" />
              {handoffSuccess ? 'Đã kết nối' : 'Gặp nhân viên'}
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'rounded-br-sm bg-rose-gold text-white'
                      : 'rounded-bl-sm border border-blush-pink/60 bg-white text-charcoal'
                  }`}
                >
                  {msg.content}
                </div>

                {msg.suggested_dresses?.length > 0 && (
                  <div className="mt-2 grid w-full max-w-[90%] gap-2">
                    {msg.suggested_dresses.map((d) => (
                      <Link
                        key={d.id}
                        to={`/vay-cuoi/${d.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl border border-blush-pink/70 bg-white p-2 transition hover:bg-soft-pink/40"
                      >
                        {d.image && (
                          <img
                            src={d.image}
                            alt={d.name}
                            className="h-12 w-10 rounded-lg object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-serif text-sm font-semibold text-charcoal">{d.name}</p>
                          <p className="text-xs text-rose-gold-dark">{formatPrice(d.rental_price)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div className="inline-block rounded-2xl border border-blush-pink/60 bg-white px-4 py-2 text-xs text-muted">
                Chuyên viên AI đang trả lời...
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="flex gap-1.5 overflow-x-auto border-t border-blush-pink/40 bg-cream/60 px-3 py-2">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendMessage(q)}
                className="shrink-0 rounded-full border border-blush-pink bg-white px-3 py-1 text-[11px] text-charcoal hover:bg-soft-pink"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2 border-t border-blush-pink bg-white p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              className="flex-1 rounded-lg border border-blush-pink/80 bg-ivory px-3 py-2 text-sm focus:border-rose-gold focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="rounded-lg bg-rose-gold p-2.5 text-white transition hover:bg-rose-gold-dark disabled:opacity-50"
              aria-label="Gửi tin nhắn"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
