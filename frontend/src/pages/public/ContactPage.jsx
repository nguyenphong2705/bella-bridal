import { useState } from 'react';
import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import api from '../../api/client';
import SeoHead from '../../components/seo/SeoHead';
import { useSite } from '../../contexts/SiteContext';

export default function ContactPage() {
  const { settings } = useSite();
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      await api.post('/contacts', form);
      setSent(true);
      setForm({ name: '', phone: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Gửi liên hệ thất bại. Vui lòng thử lại.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <SeoHead
        title="Liên Hệ BellaBridal Studio | Tư Vấn Váy Cưới &amp; Đặt Lịch"
        description="Liên hệ BellaBridal Studio qua Hotline, Zalo, Email hoặc ghé thăm showroom tại Quận 1, TP. Hồ Chí Minh."
        canonicalPath="/lien-he"
      />

      <section className="bg-cream py-12 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-gold-dark">Contact Concierge</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">Liên Hệ BellaBridal</h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="space-y-6">
          <div className="rounded-3xl border border-blush-pink bg-white p-6 shadow-card space-y-4">
            <h2 className="font-serif text-2xl font-semibold">Showroom BellaBridal</h2>
            <div className="flex items-start gap-3 text-sm text-muted">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-gold" />
              <span>{settings.address}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted">
              <Phone className="h-4 w-4 shrink-0 text-rose-gold" />
              <a href={`tel:${settings.hotline?.replace(/\s+/g, '')}`} className="font-medium text-charcoal">{settings.hotline}</a>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted">
              <Mail className="h-4 w-4 shrink-0 text-rose-gold" />
              <span>{settings.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted">
              <Clock className="h-4 w-4 shrink-0 text-rose-gold" />
              <span>{settings.working_hours}</span>
            </div>

            <a
              href={settings.zalo_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0068FF] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" />
              Nhắn tin Zalo trực tiếp
            </a>
          </div>

          <div className="overflow-hidden rounded-3xl border border-blush-pink bg-cream shadow-card">
            <iframe
              title="Bản đồ BellaBridal Studio"
              src={settings.google_maps_embed}
              className="h-72 w-full border-0"
              loading="lazy"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-blush-pink bg-white p-6 shadow-luxury sm:p-8">
          <h2 className="font-serif text-2xl font-semibold">Gửi Tin Nhắn Tư Vấn</h2>
          {sent && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Cảm ơn bạn! Chuyên viên BellaBridal sẽ liên hệ lại sớm nhất.
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
          )}

          <div className="mt-5 space-y-4">
            <input
              type="text"
              required
              placeholder="Họ và tên *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="luxury-input"
            />
            <input
              type="tel"
              required
              placeholder="Số điện thoại *"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="luxury-input"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="luxury-input"
            />
            <input
              type="text"
              placeholder="Chủ đề quan tâm"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="luxury-input"
            />
            <textarea
              rows={4}
              required
              placeholder="Nội dung cần tư vấn *"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="luxury-input"
            />
            <button type="submit" disabled={sending} className="btn-primary w-full justify-center">
              {sending ? 'Đang gửi...' : 'Gửi yêu cầu liên hệ'}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
