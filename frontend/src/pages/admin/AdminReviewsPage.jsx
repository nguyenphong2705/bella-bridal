import { useEffect, useState } from 'react';
import { Plus, Star, Trash2 } from 'lucide-react';
import api from '../../api/client';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_name: '', service_used: '', rating: 5, content: '', wedding_date: '' });

  const load = () => api.get('/admin/reviews').then((res) => setReviews(res.data.data || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/admin/reviews', { ...form, rating: Number(form.rating), is_featured: true, is_approved: true });
    setShowForm(false);
    setForm({ customer_name: '', service_used: '', rating: 5, content: '', wedding_date: '' });
    load();
  };

  const remove = async (id) => {
    if (!confirm('Xóa đánh giá này?')) return;
    await api.delete(`/admin/reviews/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold">Quản Lý Đánh Giá</h1>
        <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="h-4 w-4" /> Thêm đánh giá
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="grid gap-4 rounded-2xl border border-blush-pink bg-white p-6 sm:grid-cols-2">
          <input required placeholder="Tên cặp đôi / Cô dâu" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="luxury-input" />
          <input placeholder="Dịch vụ đã sử dụng" value={form.service_used} onChange={(e) => setForm({ ...form, service_used: e.target.value })} className="luxury-input" />
          <input placeholder="Tháng cưới (VD: Tháng 10/2026)" value={form.wedding_date} onChange={(e) => setForm({ ...form, wedding_date: e.target.value })} className="luxury-input" />
          <input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="luxury-input" />
          <textarea required rows={3} placeholder="Nội dung phản hồi" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="luxury-input sm:col-span-2" />
          <button type="submit" className="btn-primary w-fit">Lưu đánh giá</button>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-2xl border border-blush-pink bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex gap-1 text-rose-gold">
                {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <button type="button" onClick={() => remove(r.id)} className="rounded-lg bg-rose-50 p-1.5 text-rose-700">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm italic text-charcoal">“{r.content}”</p>
            <p className="mt-3 font-serif text-lg font-semibold">{r.customer_name}</p>
            <p className="text-xs text-muted">{r.service_used} · {r.wedding_date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
