'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import type { Dress } from '@/types';

export default function AdminDressesPage() {
  const [dresses, setDresses] = useState<Dress[]>([]);

  const load = () => {
    apiClient.get<{ data: Dress[] }>('/admin/dresses').then((res) => setDresses(res.data.data || []));
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: number) => {
    await apiClient.delete(`/admin/dresses/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold text-charcoal">Quản Lý Bộ Sưu Tập Váy Cưới</h1>

      <div className="overflow-x-auto rounded-2xl border border-blush-pink/60 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-blush-pink/60 bg-cream text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Mã</th>
              <th className="px-4 py-3">Tên váy</th>
              <th className="px-4 py-3">Phom dáng</th>
              <th className="px-4 py-3">Giá thuê</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blush-pink/40">
            {dresses.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-3 font-mono text-xs">{d.code}</td>
                <td className="px-4 py-3 font-medium text-charcoal">{d.name}</td>
                <td className="px-4 py-3 text-xs text-muted">{d.silhouette}</td>
                <td className="px-4 py-3 font-medium text-rose-gold-dark">{formatCurrency(d.rental_price)}</td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => remove(d.id)} className="text-red-500 hover:text-red-700" title="Xóa">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
