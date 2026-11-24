'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { Appointment } from '@/types';

export default function AdminAppointmentsPage() {
  const [items, setItems] = useState<Appointment[]>([]);

  const load = () => {
    apiClient.get<{ data: Appointment[] }>('/admin/appointments').then((res) => setItems(res.data.data || []));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await apiClient.put(`/admin/appointments/${id}`, { status });
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-charcoal">Quản Lý Lịch Hẹn & Thông Báo</h1>
        <p className="text-xs text-muted">
          Khi xác nhận hoặc hủy lịch, hệ thống tự động mở/khóa khung giờ real-time và gửi Zalo ZNS / SMS / Email.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-blush-pink/60 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-blush-pink/60 bg-cream text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Mã / Khách hàng</th>
              <th className="px-4 py-3">Ngày & Giờ</th>
              <th className="px-4 py-3">Dịch vụ / Váy</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blush-pink/40">
            {items.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-charcoal">{a.customer_name}</p>
                  <p className="text-xs text-muted">{a.booking_code} • {a.customer_phone}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{a.appointment_date}</p>
                  <p className="text-xs text-rose-gold-dark">{a.time_slot}</p>
                </td>
                <td className="px-4 py-3 text-xs text-muted">
                  {a.dress_name || a.service_name || 'Tư vấn chung'}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-soft-pink px-2.5 py-1 text-xs font-medium text-rose-gold-dark">
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 space-x-2">
                  {a.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => updateStatus(a.id, 'confirmed')}
                      className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs text-white hover:bg-emerald-700"
                    >
                      Xác nhận & Gửi ZNS
                    </button>
                  )}
                  {a.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => updateStatus(a.id, 'cancelled')}
                      className="rounded-lg border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      Hủy
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
