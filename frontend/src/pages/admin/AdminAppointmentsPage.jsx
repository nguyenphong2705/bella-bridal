import { useEffect, useState } from 'react';
import { Check, Trash2, X } from 'lucide-react';
import api from '../../api/client';
import { formatDate, STATUS_LABELS } from '../../utils/format';

export default function AdminAppointmentsPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [range, setRange] = useState('');
  const [date, setDate] = useState('');

  const load = () => {
    api
      .get('/admin/appointments', {
        params: {
          status: status || undefined,
          range: range || undefined,
          date: date || undefined,
        },
      })
      .then((res) => setItems(res.data.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, [status, range, date]);

  const updateStatus = async (id, newStatus) => {
    await api.put(`/admin/appointments/${id}`, { status: newStatus });
    load();
  };

  const remove = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa lịch hẹn này?')) return;
    await api.delete(`/admin/appointments/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Quản Lý Lịch Hẹn</h1>
        <p className="text-sm text-muted">Xem, xác nhận, hoàn thành hoặc hủy lịch thử váy theo ngày, tuần, tháng.</p>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-blush-pink bg-white p-4">
        <select value={range} onChange={(e) => setRange(e.target.value)} className="luxury-input w-auto">
          <option value="">Tất cả thời gian</option>
          <option value="today">Hôm nay</option>
          <option value="week">Tuần này</option>
          <option value="month">Tháng này</option>
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="luxury-input w-auto" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="luxury-input w-auto">
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-blush-pink bg-white p-4 shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-blush-pink/60 text-xs uppercase text-muted">
            <tr>
              <th className="py-3 pr-4">Mã</th>
              <th className="py-3 pr-4">Khách hàng</th>
              <th className="py-3 pr-4">Ngày / Giờ</th>
              <th className="py-3 pr-4">Dịch vụ / Mẫu váy</th>
              <th className="py-3 pr-4">Trạng thái</th>
              <th className="py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blush-pink/40">
            {items.map((a) => {
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
                    {a.service?.name || '-'} {a.dress ? `| ${a.dress.code}` : ''}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs ${st.className}`}>
                      {st.label}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="inline-flex gap-1.5">
                      {a.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => updateStatus(a.id, 'confirmed')}
                          title="Xác nhận"
                          className="rounded-lg bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-100"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      {a.status === 'confirmed' && (
                        <button
                          type="button"
                          onClick={() => updateStatus(a.id, 'completed')}
                          className="rounded-lg bg-sky-50 px-2 py-1 text-xs text-sky-700 hover:bg-sky-100"
                        >
                          Hoàn thành
                        </button>
                      )}
                      {a.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => updateStatus(a.id, 'cancelled')}
                          title="Hủy lịch"
                          className="rounded-lg bg-amber-50 p-1.5 text-amber-700 hover:bg-amber-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => remove(a.id)}
                        title="Xóa"
                        className="rounded-lg bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
