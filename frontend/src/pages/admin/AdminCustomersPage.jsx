import { useEffect, useState } from 'react';
import api from '../../api/client';
import { formatDate, formatPrice } from '../../utils/format';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    api.get('/admin/customers').then((res) => {
      setCustomers(res.data.customers?.data || []);
      setContacts(res.data.contacts || []);
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Khách Hàng &amp; Liên Hệ</h1>
        <p className="text-sm text-muted">Danh sách khách hàng đặt lịch và tin nhắn liên hệ từ website.</p>
      </div>

      <div className="rounded-2xl border border-blush-pink bg-white p-5 shadow-card overflow-x-auto">
        <h2 className="font-serif text-2xl font-semibold mb-4">Khách hàng đặt lịch</h2>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-blush-pink/60 text-xs uppercase text-muted">
            <tr>
              <th className="py-2 pr-4">Họ tên</th>
              <th className="py-2 pr-4">Số điện thoại</th>
              <th className="py-2 pr-4">Số lần đặt</th>
              <th className="py-2 pr-4">Lần hẹn gần nhất</th>
              <th className="py-2">Giá trị ước tính</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blush-pink/40">
            {customers.map((c, idx) => (
              <tr key={idx}>
                <td className="py-3 pr-4 font-medium">{c.customer_name}</td>
                <td className="py-3 pr-4">{c.customer_phone}</td>
                <td className="py-3 pr-4">{c.total_bookings}</td>
                <td className="py-3 pr-4 text-xs">{formatDate(c.last_appointment_date)}</td>
                <td className="py-3 text-rose-gold-dark font-medium">{formatPrice(c.total_estimated_value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-blush-pink bg-white p-5 shadow-card">
        <h2 className="font-serif text-2xl font-semibold mb-4">Tin nhắn liên hệ mới</h2>
        <div className="space-y-3">
          {contacts.map((ct) => (
            <div key={ct.id} className="rounded-xl border border-blush-pink/50 bg-cream/40 p-4 text-sm">
              <div className="flex justify-between">
                <strong>{ct.name} ({ct.phone})</strong>
                <span className="text-xs text-muted">{formatDate(ct.created_at)}</span>
              </div>
              <p className="mt-1 text-muted">{ct.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
