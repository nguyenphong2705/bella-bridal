'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bell, Calendar, CheckCircle2, Clock, Radio } from 'lucide-react';
import { API_ORIGIN, apiClient } from '@/lib/api';
import { formatVnPhone } from '@/lib/format';
import type { Dress, ServiceItem, SlotAvailability } from '@/types';

interface BookingSuccess {
  booking_code: string;
  appointment_date: string;
  time_slot: string;
  customer_name: string;
  notifications?: { channel: string; status: string; recipient?: string; message: string }[];
}

function BookingContent() {
  const searchParams = useSearchParams();
  const preselectedDress = searchParams.get('dress') || '';

  const [date, setDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [slots, setSlots] = useState<SlotAvailability[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [liveConnected, setLiveConnected] = useState(false);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [dresses, setDresses] = useState<Dress[]>([]);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [dressId, setDressId] = useState(preselectedDress);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<BookingSuccess | null>(null);

  useEffect(() => {
    apiClient.get<{ data: ServiceItem[] }>('/services').then((r) => setServices(r.data.data || []));
    apiClient.get<{ data: Dress[] }>('/dresses').then((r) => setDresses(r.data.data || []));
  }, []);

  // Real-time slot availability via SSE (EventSource) + initial HTTP fallback
  useEffect(() => {
    setSelectedSlot('');
    apiClient
      .get<{ slots: SlotAvailability[] }>('/appointments/availability', { params: { date } })
      .then((res) => setSlots(res.data.slots || []))
      .catch(() => {});

    const es = new EventSource(`${API_ORIGIN}/api/v1/appointments/availability/stream?date=${date}`);
    es.onopen = () => setLiveConnected(true);
    es.onmessage = (ev) => {
      try {
        const parsed = JSON.parse(ev.data) as { date: string; slots: SlotAvailability[] };
        if (parsed.slots) {
          setSlots(parsed.slots);
          setSelectedSlot((curr) => {
            const stillAvail = parsed.slots.find((s) => s.time_slot === curr && s.available);
            return stillAvail ? curr : '';
          });
        }
      } catch {
        // ignore
      }
    };
    es.onerror = () => setLiveConnected(false);
    return () => {
      es.close();
      setLiveConnected(false);
    };
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedSlot) {
      setError('Vui lòng chọn một khung giờ thử váy còn trống.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiClient.post<{ data: BookingSuccess }>('/appointments', {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || undefined,
        appointment_date: date,
        time_slot: selectedSlot,
        service_id: serviceId ? Number(serviceId) : null,
        dress_id: dressId ? Number(dressId) : null,
        notes,
      });
      setSuccess(res.data.data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể đặt lịch. Khung giờ có thể vừa có khách khác đặt.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-3xl border border-blush-pink bg-white p-8 text-center shadow-luxury">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
          <h1 className="mt-4 font-serif text-3xl font-semibold text-charcoal">Đặt Lịch Thử Váy Thành Công!</h1>
          <p className="mt-2 text-sm text-muted">
            Mã lịch hẹn của nàng dâu: <strong className="text-rose-gold-dark">{success.booking_code}</strong>
          </p>
          <div className="mt-6 rounded-2xl bg-cream p-5 text-left text-sm">
            <p><strong>Khách hàng:</strong> {success.customer_name}</p>
            <p className="mt-1"><strong>Thời gian:</strong> {success.time_slot} • Ngày {success.appointment_date}</p>
            <p className="mt-1"><strong>Địa điểm:</strong> 128 Đồng Khởi, Quận 1, TP. Hồ Chí Minh</p>
          </div>

          {success.notifications && success.notifications.length > 0 && (
            <div className="mt-6 rounded-2xl border border-blush-pink/60 bg-ivory p-4 text-left">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-gold-dark">
                <Bell className="h-3.5 w-3.5" /> Trạng thái thông báo tự động
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-muted">
                {success.notifications.map((n, idx) => (
                  <li key={idx}>
                    • <strong className="uppercase text-charcoal">{n.channel}</strong> ({n.recipient ? formatVnPhone(n.recipient) : '—'}):{' '}
                    <span className="text-emerald-700">{n.status}</span> — {n.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button type="button" onClick={() => setSuccess(null)} className="btn-primary mt-6">
            Đặt thêm lịch hẹn khác
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-soft-pink px-3.5 py-1 text-xs font-medium text-rose-gold-dark">
          <Radio className={`h-3.5 w-3.5 ${liveConnected ? 'text-emerald-600' : 'text-rose-gold'}`} />
          {liveConnected ? 'Đang đồng bộ khung giờ trống theo thời gian thực' : 'Hệ thống đặt lịch VIP 1-1'}
        </span>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">Đặt Lịch Thử Váy Cưới</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted">
          Chọn ngày và khung giờ còn trống. Hệ thống tự động khóa khung giờ ngay khi đặt và gửi thông báo xác nhận qua
          Zalo ZNS, SMS & Email.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 grid gap-8 rounded-3xl border border-blush-pink/60 bg-white p-6 shadow-card sm:p-10 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-6">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-charcoal">
              <Calendar className="h-4 w-4 text-rose-gold" /> Chọn ngày thử váy
            </label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="luxury-input"
              required
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-charcoal">
              <Clock className="h-4 w-4 text-rose-gold" /> Khung giờ còn trống
            </label>
            <div className="grid grid-cols-3 gap-3">
              {slots.map((s) => (
                <button
                  key={s.time_slot}
                  type="button"
                  disabled={!s.available}
                  onClick={() => setSelectedSlot(s.time_slot)}
                  className={`rounded-xl border py-3 text-sm font-medium transition-all ${
                    !s.available
                      ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 line-through'
                      : selectedSlot === s.time_slot
                      ? 'border-rose-gold bg-rose-gold text-white shadow-luxury'
                      : 'border-blush-pink bg-ivory text-charcoal hover:bg-soft-pink'
                  }`}
                >
                  {s.time_slot}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Dịch vụ quan tâm</label>
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="luxury-input">
              <option value="">Chọn dịch vụ (không bắt buộc)</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Mẫu váy muốn thử</label>
            <select value={dressId} onChange={(e) => setDressId(e.target.value)} className="luxury-input">
              <option value="">Tư vấn chọn mẫu tại Studio</option>
              {dresses.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} — {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Họ và tên cô dâu *</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nguyễn Ngọc Hân"
              className="luxury-input"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Số điện thoại (nhận Zalo ZNS / SMS) *</label>
            <input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+84 901 234 567"
              className="luxury-input"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Email (nhận thư xác nhận)</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="ngochan@example.com"
              className="luxury-input"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Ghi chú (số đo, ngày cưới dự kiến...)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ví dụ: Cưới tháng 12, muốn thử thêm váy chữ A..."
              className="luxury-input"
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 p-3 text-xs text-red-600">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3.5">
            {submitting ? 'Đang giữ khung giờ...' : 'Xác nhận đặt lịch thử váy'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-12 text-center text-muted">Đang tải trang đặt lịch...</div>}>
      <BookingContent />
    </Suspense>
  );
}
