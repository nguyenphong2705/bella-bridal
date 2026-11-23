import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../api/client';
import { formatPrice } from '../../utils/format';

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', short_description: '', description: '', price_from: 5000000, duration_note: '' });

  const load = () => api.get('/admin/services').then((res) => setServices(res.data.data || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/admin/services', { ...form, price_from: Number(form.price_from), is_active: true });
    setShowForm(false);
    setForm({ name: '', short_description: '', description: '', price_from: 5000000, duration_note: '' });
    load();
  };

  const remove = async (id) => {
    if (!confirm('Xóa dịch vụ này?')) return;
    await api.delete(`/admin/services/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold">Quản Lý Dịch Vụ</h1>
        <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="h-4 w-4" /> Thêm dịch vụ
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="grid gap-4 rounded-2xl border border-blush-pink bg-white p-6 sm:grid-cols-2">
          <input required placeholder="Tên dịch vụ" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="luxury-input" />
          <input required type="number" placeholder="Giá từ (VNĐ)" value={form.price_from} onChange={(e) => setForm({ ...form, price_from: e.target.value })} className="luxury-input" />
          <input required placeholder="Mô tả ngắn" value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} className="luxury-input sm:col-span-2" />
          <textarea required placeholder="Mô tả chi tiết" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="luxury-input sm:col-span-2" rows={3} />
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button type="submit" className="btn-primary">Lưu dịch vụ</button>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {services.map((s) => (
          <div key={s.id} className="flex items-start justify-between rounded-2xl border border-blush-pink bg-white p-5 shadow-card">
            <div>
              <h3 className="font-serif text-xl font-semibold">{s.name}</h3>
              <p className="mt-1 text-xs text-muted">{s.short_description}</p>
              <p className="mt-2 text-sm font-medium text-rose-gold-dark">Từ {formatPrice(s.price_from)}</p>
            </div>
            <button type="button" onClick={() => remove(s.id)} className="rounded-lg bg-rose-50 p-1.5 text-rose-700">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
