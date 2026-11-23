import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import api from '../../api/client';
import SeoHead from '../../components/seo/SeoHead';
import { formatDate } from '../../utils/format';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const today = new Date().toISOString().split('T')[0];

  const [services, setServices] = useState([]);
  const [dresses, setDresses] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    appointment_date: today,
    time_slot: '',
    service_id: searchParams.get('service_id') || '',
    dress_id: searchParams.get('dress_id') || '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    api.get('/services').then((res) => setServices(res.data.data || [])).catch(() => {});
    api.get('/dresses', { params: { per_page: 24 } }).then((res) => setDresses(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.appointment_date) return;
    setLoadingSlots(true);
    api
      .get('/appointments/availability', { params: { date: form.appointment_date } })
      .then((res) => {
        const list = res.data.slots || [];
        setSlots(list);
        const firstOpen = list.find((s) => s.available);
        setForm((prev) => ({
          ...prev,
          time_slot: list.some((s) => s.time_slot === prev.time_slot && s.available)
            ? prev.time_slot
            : firstOpen?.time_slot || '',
        }));
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [form.appointment_date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.time_slot) {
      setError('Vui lòng chọn khung giờ còn trống.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/appointments', {
        ...form,
        service_id: form.service_id ? Number(form.service_id) : null,
        dress_id: form.dress_id ? Number(form.dress_id) : null,
      });
      setConfirmedBooking(data.appointment);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})[0]?.[0] ||
        'Không thể đặt lịch. Vui lòng kiểm tra lại thông tin.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SeoHead
        title="Đặt Lịch Thử Váy Cưới Online | BellaBridal Studio"
        description="Đặt lịch thử váy cưới và tư vấn 1-1 riêng tư tại BellaBridal Studio. Kiểm tra khung giờ trống trực tuyến nhanh chóng."
        canonicalPath="/dat-lich"
      />

      <section className="bg-cream py-12 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-gold-dark">Private Fitting</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">Đặt Lịch Thử Váy &amp; Tư Vấn</h1>
          <p className="mt-3 text-sm text-muted sm:text-base">
            Mỗi khung giờ được phục vụ riêng tư 1-1 cùng Stylist để bạn thoải mái trải nghiệm những thiết kế yêu thích.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {confirmedBooking ? (
          <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-luxury">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="mt-4 font-serif text-3xl font-semibold text-charcoal">Đặt Lịch Thành Công!</h2>
            <p className="mt-2 text-sm text-muted">
              Mã lịch hẹn của bạn là <strong className="text-rose-gold-dark">{confirmedBooking.booking_code}</strong>.
              Chuyên viên BellaBridal sẽ liên hệ xác nhận trong thời gian sớm nhất.
            </p>
            <div className="mx-auto mt-6 max-w-md rounded-2xl bg-cream p-5 text-left text-sm space-y-2">
              <p><strong>Khách hàng:</strong> {confirmedBooking.customer_name}</p>
              <p><strong>Số điện thoại:</strong> {confirmedBooking.customer_phone}</p>
              <p><strong>Ngày hẹn:</strong> {formatDate(confirmedBooking.appointment_date)}</p>
              <p><strong>Khung giờ:</strong> {confirmedBooking.time_slot}</p>
              {confirmedBooking.service && <p><strong>Dịch vụ:</strong> {confirmedBooking.service.name}</p>}
              {confirmedBooking.dress && <p><strong>Mẫu váy thử:</strong> {confirmedBooking.dress.name}</p>}
            </div>
            <button
              type="button"
              onClick={() => setConfirmedBooking(null)}
              className="btn-outline mt-6"
            >
              Đặt thêm lịch hẹn khác
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-3xl border border-blush-pink bg-white p-6 shadow-luxury sm:p-10">
            <div className="flex items-center gap-2 border-b border-blush-pink/60 pb-4">
              <Sparkles className="h-5 w-5 text-rose-gold" />
              <h2 className="font-serif text-2xl font-semibold">Thông Tin Đặt Lịch</h2>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Minh Anh"
                  className="luxury-input"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  required
                  value={form.customer_phone}
                  onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                  placeholder="0901234567"
                  className="luxury-input"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
                  Email (nhận thông báo xác nhận)
                </label>
                <input
                  type="email"
                  value={form.customer_email}
                  onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                  placeholder="email@example.com"
                  className="luxury-input"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted">
                  <Calendar className="h-3.5 w-3.5 text-rose-gold" />
                  Ngày muốn đến cửa hàng *
                </label>
                <input
                  type="date"
                  required
                  min={today}
                  value={form.appointment_date}
                  onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                  className="luxury-input"
                />
              </div>
            </div>

            {/* Khung giờ trống */}
            <div className="mt-6">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted">
                <Clock className="h-3.5 w-3.5 text-rose-gold" />
                Khung giờ mong muốn *
              </label>
              {loadingSlots ? (
                <p className="text-xs text-muted">Đang kiểm tra khung giờ trống...</p>
              ) : (
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                  {slots.map((slot) => (
                    <button
                      key={slot.time_slot}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setForm({ ...form, time_slot: slot.time_slot })}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                        !slot.available
                          ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 line-through'
                          : form.time_slot === slot.time_slot
                            ? 'border-rose-gold bg-rose-gold text-white shadow-sm'
                            : 'border-blush-pink bg-ivory text-charcoal hover:bg-soft-pink'
                      }`}
                    >
                      {slot.time_slot}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
                  Dịch vụ quan tâm
                </label>
                <select
                  value={form.service_id}
                  onChange={(e) => setForm({ ...form, service_id: e.target.value })}
                  className="luxury-input"
                >
                  <option value="">-- Chọn dịch vụ --</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
                  Mẫu váy muốn thử (nếu có)
                </label>
                <select
                  value={form.dress_id}
                  onChange={(e) => setForm({ ...form, dress_id: e.target.value })}
                  className="luxury-input"
                >
                  <option value="">-- Chọn mẫu váy --</option>
                  {dresses.map((d) => (
                    <option key={d.id} value={d.id}>[{d.code}] {d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
                Ghi chú thêm (số đo, ngày cưới dự kiến, yêu cầu riêng)
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Chia sẻ thêm với Stylist để chúng tôi chuẩn bị chu đáo nhất..."
                className="luxury-input"
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary mt-7 w-full justify-center py-3.5">
              {submitting ? 'Đang xử lý đặt lịch...' : 'Xác nhận đặt lịch hẹn'}
            </button>
          </form>
        )}
      </section>
    </>
  );
}
