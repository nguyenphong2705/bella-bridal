'use client';

import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import type { ServiceItem } from '@/types';

const emptyForm = {
  name: '',
  short_description: '',
  description: '',
  price_from: '',
  price_to: '',
  duration_note: '',
  image: '',
  is_featured: true,
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = () => {
    apiClient.get<{ data: ServiceItem[] }>('/admin/services').then((res) => setServices(res.data.data || []));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        ...form,
        price_from: Number(form.price_from || 0),
        price_to: Number(form.price_to || 0),
      };
      if (editingId) {
        await apiClient.put(`/admin/services/${editingId}`, payload);
        setMessage('Đã cập nhật dịch vụ.');
      } else {
        await apiClient.post('/admin/services', payload);
        setMessage('Đã thêm dịch vụ mới.');
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (svc: ServiceItem) => {
    setEditingId(svc.id);
    setForm({
      name: svc.name,
      short_description: svc.short_description || '',
      description: svc.description || '',
      price_from: String(svc.price_from || ''),
      price_to: String(svc.price_to || ''),
      duration_note: svc.duration_note || '',
      image: svc.image || '',
      is_featured: Boolean(svc.is_featured),
    });
  };

  const remove = async (id: number) => {
    await apiClient.delete(`/admin/services/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-semibold text-charcoal">Quản Lý Dịch Vụ Cưới</h1>
        {message && <span className="rounded-lg bg-soft-pink px-3 py-1.5 text-xs font-medium text-plum">{message}</span>}
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-blush-pink/60 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-charcoal">
            {editingId ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="inline-flex items-center gap-1 text-xs text-muted hover:text-charcoal"
            >
              <X className="h-3.5 w-3.5" /> Hủy sửa
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Tên dịch vụ *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ví dụ: Trang điểm cô dâu VIP"
              className="luxury-input"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Giá từ (VND)</label>
            <input
              type="number"
              value={form.price_from}
              onChange={(e) => setForm((f) => ({ ...f, price_from: e.target.value }))}
              placeholder="3500000"
              className="luxury-input"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Giá đến (VND)</label>
            <input
              type="number"
              value={form.price_to}
              onChange={(e) => setForm((f) => ({ ...f, price_to: e.target.value }))}
              placeholder="8000000"
              className="luxury-input"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Thời lượng / Ghi chú</label>
            <input
              value={form.duration_note}
              onChange={(e) => setForm((f) => ({ ...f, duration_note: e.target.value }))}
              placeholder="Ví dụ: 3 giờ • Tại Studio"
              className="luxury-input"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-muted">Link ảnh minh họa</label>
            <input
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              placeholder="https://... hoặc /images/..."
              className="luxury-input"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Mô tả ngắn</label>
          <input
            value={form.short_description}
            onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))}
            placeholder="Tóm tắt ngắn hiển thị ở trang chủ"
            className="luxury-input"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Chi tiết dịch vụ</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Mô tả chi tiết quyền lợi gói dịch vụ..."
            className="luxury-input"
          />
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          <Plus className="h-4 w-4" />
          <span>{saving ? 'Đang lưu...' : editingId ? 'Lưu cập nhật' : 'Thêm dịch vụ'}</span>
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-blush-pink/60 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-blush-pink/60 bg-cream text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Tên dịch vụ</th>
              <th className="px-4 py-3">Mô tả ngắn</th>
              <th className="px-4 py-3">Mức giá</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blush-pink/40">
            {services.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-medium text-charcoal">{s.name}</td>
                <td className="max-w-md px-4 py-3 text-xs text-muted">{s.short_description}</td>
                <td className="px-4 py-3 font-medium text-plum">
                  Từ {formatCurrency(s.price_from)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => startEdit(s)} className="text-plum hover:text-plum-dark" title="Sửa">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => remove(s.id)} className="text-red-500 hover:text-red-700" title="Xóa">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
