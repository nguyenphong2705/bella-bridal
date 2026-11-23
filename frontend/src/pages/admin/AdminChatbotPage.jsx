import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../api/client';

export default function AdminChatbotPage() {
  const [faqs, setFaqs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState({ question: '', answer: '', category: 'general', keywords: '' });

  const load = () => {
    api.get('/admin/chatbot/faqs').then((res) => setFaqs(res.data.data || [])).catch(() => {});
    api.get('/admin/chatbot/sessions').then((res) => setSessions(res.data.data || [])).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const addFaq = async (e) => {
    e.preventDefault();
    await api.post('/admin/chatbot/faqs', { ...form, is_active: true });
    setForm({ question: '', answer: '', category: 'general', keywords: '' });
    load();
  };

  const deleteFaq = async (id) => {
    await api.delete(`/admin/chatbot/faqs/${id}`);
    load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Quản Lý AI Chatbot</h1>
        <p className="text-sm text-muted">Quản lý câu hỏi thường gặp (FAQ) và xem lịch sử hội thoại của khách hàng.</p>
      </div>

      <form onSubmit={addFaq} className="grid gap-3 rounded-2xl border border-blush-pink bg-white p-5 shadow-card">
        <h2 className="font-serif text-xl font-semibold">Thêm câu hỏi thường gặp (FAQ)</h2>
        <input required placeholder="Câu hỏi" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="luxury-input" />
        <input placeholder="Từ khóa nhận diện (cách nhau dấu phẩy)" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} className="luxury-input" />
        <textarea required rows={3} placeholder="Câu trả lời chuẩn của cửa hàng" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} className="luxury-input" />
        <button type="submit" className="btn-primary w-fit"><Plus className="h-4 w-4" /> Thêm FAQ</button>
      </form>

      <div className="rounded-2xl border border-blush-pink bg-white p-5 shadow-card space-y-3">
        <h2 className="font-serif text-xl font-semibold">Danh sách FAQ đang kích hoạt</h2>
        {faqs.map((f) => (
          <div key={f.id} className="flex items-start justify-between gap-4 rounded-xl bg-cream/60 p-4 text-sm">
            <div>
              <p className="font-semibold">{f.question}</p>
              <p className="mt-1 text-muted">{f.answer}</p>
            </div>
            <button type="button" onClick={() => deleteFaq(f.id)} className="rounded-lg bg-rose-50 p-1.5 text-rose-700">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-blush-pink bg-white p-5 shadow-card space-y-3">
        <h2 className="font-serif text-xl font-semibold">Lịch sử hội thoại gần đây ({sessions.length})</h2>
        {sessions.map((s) => (
          <div key={s.id} className="rounded-xl border border-blush-pink/60 p-4 text-sm">
            <div className="flex justify-between text-xs text-muted">
              <span>Phiên: {s.session_token.slice(0, 8)}... | Trạng thái: <strong>{s.status}</strong></span>
              <span>{s.message_count} tin nhắn</span>
            </div>
            <div className="mt-2 space-y-1.5">
              {(s.messages || []).slice(-4).map((m) => (
                <p key={m.id} className="text-xs">
                  <strong>{m.sender === 'user' ? 'Khách:' : 'AI:'}</strong> {m.content}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
