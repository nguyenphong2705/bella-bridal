'use client';

import { useState } from 'react';
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useSite } from '@/contexts/SiteContext';
import { formatVnPhone, toTelHref } from '@/lib/format';

export default function ContactPage() {
  const { settings } = useSite();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await apiClient.post<{ message: string }>('/contacts', { name, phone, email, message });
      setSent(res.data.message);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold-dark">Contact Studio</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">Liên Hệ BellaBridal</h1>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        <div className="space-y-4 rounded-3xl border border-blush-pink/60 bg-cream/60 p-8 lg:col-span-5">
          <h2 className="font-serif text-2xl font-semibold text-charcoal">Showroom TP. Hồ Chí Minh</h2>
          <p className="flex items-start gap-3 text-sm text-muted">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-gold" />
            <span>{settings.address || '128 Đồng Khởi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'}</span>
          </p>
          <p className="flex items-center gap-3 text-sm text-muted">
            <Phone className="h-4 w-4 shrink-0 text-rose-gold" />
            <a href={toTelHref(settings.hotline)} className="hover:text-rose-gold-dark">
              {formatVnPhone(settings.hotline)}
            </a>
          </p>
          <p className="flex items-center gap-3 text-sm text-muted">
            <Mail className="h-4 w-4 shrink-0 text-rose-gold" />
            <span>{settings.email || 'concierge@bellabridal.vn'}</span>
          </p>
          <p className="flex items-center gap-3 text-sm text-muted">
            <Clock className="h-4 w-4 shrink-0 text-rose-gold" />
            <span>{settings.working_hours || '09:00 - 21:00 (Thứ 2 - Chủ Nhật)'}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-blush-pink/60 bg-white p-8 shadow-card lg:col-span-7">
          <h2 className="font-serif text-2xl font-semibold text-charcoal">Gửi lời nhắn tư vấn</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Họ và tên *" className="luxury-input" required />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại (+84...) *" className="luxury-input" required />
          </div>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="luxury-input" />
          <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Nội dung cần tư vấn..." className="luxury-input" required />
          {sent && <p className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">{sent}</p>}
          <button type="submit" disabled={sending} className="btn-primary">
            <Send className="h-4 w-4" />
            <span>{sending ? 'Đang gửi...' : 'Gửi tin nhắn'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
