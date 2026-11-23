import { useEffect, useState } from 'react';
import { CalendarClock, DollarSign, Shirt, Users } from 'lucide-react';
import api from '../../api/client';
import { formatDate, formatPrice, STATUS_LABELS } from '../../utils/format';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setData(res.data)).catch(() => {});
  }, []);

  const stats = data?.stats || {};

  const cards = [
    { label: 'Tổng khách hàng', value: stats.total_customers ?? 0, icon: Users },
    { label: 'Tổng lịch đặt', value: stats.total_appointments ?? 0, icon: CalendarClock },
    { label: 'Lịch chờ xác nhận', value: stats.pending_appointments ?? 0, icon: Shirt },
    { label: 'Doanh thu ước tính', value: formatPrice(stats.estimated_revenue ?? 0), icon: DollarSign },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Tổng Quan Studio</h1>
        <p className="text-sm text-muted">Theo dõi lịch hẹn, khách hàng và hiệu suất hoạt động của BellaBridal.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-2xl border border-blush-pink bg-white p-5 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted">{c.label}</span>
                <Icon className="h-5 w-5 text-rose-gold" />
              </div>
              <p className="mt-3 font-serif text-3xl font-semibold text-charcoal">{c.value}</p>
            </div>
          );
        })}
      </div>

      {/* Lịch đặt gần đây */}
      <div className="rounded-2xl border border-blush-pink bg-white p-6 shadow-card">
        <h2 className="font-serif text-2xl font-semibold">Lịch Hẹn Gần Đây</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-blush-pink/60 text-xs uppercase text-muted">
              <tr>
                <th className="py-3 pr-4">Mã</th>
                <th className="py-3 pr-4">Khách hàng</th>
                <th className="py-3 pr-4">Ngày / Giờ</th>
                <th className="py-3 pr-4">Dịch vụ / Váy</th>
                <th className="py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blush-pink/40">
              {(data?.recent_appointments || []).map((a) => {
                const st = STATUS_LABELS[a.status] || STATUS_LABELS.pending;
                return (
                  <tr key={a.id}>
                    <td className="py-3 pr-4 font-medium">{a.booking_code}</td>
                    <td className="py-3 pr-4">
                      <p className="font-medium">{a.customer_name}</p>
                      <p className="text-xs text-muted">{a.customer_phone}</p>
                    </td>
                    <td className="py-3 pr-4">
                      {formatDate(a.appointment_date)} · <strong>{a.time_slot}</strong>
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted">
                      {a.service?.name || 'Tư vấn'} {a.dress ? `(${a.dress.code})` : ''}
                    </td>
                    <td className="py-3">
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs ${st.className}`}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
