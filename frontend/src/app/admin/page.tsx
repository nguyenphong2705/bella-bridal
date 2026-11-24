'use client';

import { useEffect, useState } from 'react';
import { Bell, Calendar, DollarSign, Sparkles } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import type { Appointment, NotificationLog } from '@/types';

interface DashboardData {
  stats: {
    total_dresses: number;
    total_appointments: number;
    pending_appointments: number;
    estimated_revenue: number;
  };
  recent_appointments: Appointment[];
  recent_notifications: (NotificationLog & { booking_code?: string; customer_name?: string })[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    apiClient.get<DashboardData>('/admin/dashboard').then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="text-sm text-muted">Đang tải thống kê...</div>;

  const cards = [
    { label: 'Tổng mẫu váy', value: data.stats.total_dresses, icon: Sparkles },
    { label: 'Tổng lịch hẹn', value: data.stats.total_appointments, icon: Calendar },
    { label: 'Chờ xác nhận', value: data.stats.pending_appointments, icon: Bell },
    { label: 'Doanh thu dự kiến', value: formatCurrency(data.stats.estimated_revenue), icon: DollarSign },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl font-semibold text-charcoal">Tổng Quan Studio</h1>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-2xl border border-blush-pink/60 bg-white p-5 shadow-card">
              <div className="flex items-center justify-between text-muted">
                <span className="text-xs font-medium uppercase">{c.label}</span>
                <Icon className="h-4 w-4 text-rose-gold" />
              </div>
              <p className="mt-3 font-serif text-2xl font-semibold text-charcoal">{c.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-blush-pink/60 bg-white p-6 shadow-card">
          <h2 className="font-serif text-xl font-semibold text-charcoal">Lịch hẹn gần đây</h2>
          <div className="mt-4 space-y-3">
            {data.recent_appointments.map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-blush-pink/40 pb-3 text-sm">
                <div>
                  <p className="font-medium text-charcoal">{a.customer_name} • {a.customer_phone}</p>
                  <p className="text-xs text-muted">{a.booking_code} — {a.appointment_date} lúc {a.time_slot}</p>
                </div>
                <span className="rounded-full bg-soft-pink px-2.5 py-1 text-xs font-medium text-rose-gold-dark">
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-blush-pink/60 bg-white p-6 shadow-card">
          <h2 className="font-serif text-xl font-semibold text-charcoal">Nhật ký gửi Zalo ZNS / SMS / Email</h2>
          <div className="mt-4 space-y-3">
            {data.recent_notifications.length === 0 ? (
              <p className="text-xs text-muted">Chưa có thông báo nào được gửi.</p>
            ) : (
              data.recent_notifications.map((n) => (
                <div key={n.id} className="flex items-center justify-between border-b border-blush-pink/40 pb-3 text-xs">
                  <div>
                    <p className="font-medium text-charcoal">
                      <span className="uppercase">{n.channel}</span> → {n.recipient}
                    </p>
                    <p className="text-muted">{n.response_message}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-700">{n.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
