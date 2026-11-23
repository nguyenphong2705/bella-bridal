import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../api/client';
import { formatPrice } from '../../utils/format';

export default function AdminDressesPage() {
  const [dresses, setDresses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category_id: '',
    code: '',
    name: '',
    silhouette: 'Công chúa (Ballgown)',
    style: 'Lãng mạn cổ điển',
    material: 'Voan lưới Pháp, Ren',
    rental_price: 12000000,
    sale_price: '',
    description: '',
    image_url: '',
    is_featured: true,
    status: 'active',
  });

  const load = () => {
    api.get('/admin/dresses').then((res) => setDresses(res.data.data || [])).catch(() => {});
    api.get('/admin/categories').then((res) => {
      const list = res.data.data || [];
      setCategories(list);
      if (list[0] && !form.category_id) {
        setForm((prev) => ({ ...prev, category_id: list[0].id }));
      }
    }).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/admin/dresses', {
      ...form,
      category_id: Number(form.category_id),
      rental_price: Number(form.rental_price),
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      image_urls: form.image_url ? [form.image_url] : [],
    });
    setShowForm(false);
    setForm({ ...form, code: '', name: '', description: '', image_url: '' });
    load();
  };

  const toggleStatus = async (dress) => {
    await api.put(`/admin/dresses/${dress.id}`, {
      ...dress,
      status: dress.status === 'active' ? 'hidden' : 'active',
    });
    load();
  };

  const remove = async (id) => {
    if (!confirm('Xóa mẫu váy này?')) return;
    await api.delete(`/admin/dresses/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Quản Lý Váy Cưới</h1>
          <p className="text-sm text-muted">Thêm, cập nhật giá, hình ảnh và trạng thái hiển thị sản phẩm.</p>
        </div>
        <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="h-4 w-4" />
          Thêm váy cưới mới
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="grid gap-4 rounded-2xl border border-blush-pink bg-white p-6 shadow-card sm:grid-cols-2">
          <input required placeholder="Mã váy (VD: BB-PC09)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="luxury-input" />
          <input required placeholder="Tên váy cưới" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="luxury-input" />
          <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="luxury-input">
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="number" required placeholder="Giá thuê (VNĐ)" value={form.rental_price} onChange={(e) => setForm({ ...form, rental_price: e.target.value })} className="luxury-input" />
          <input placeholder="Chất liệu" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className="luxury-input" />
          <input placeholder="Link ảnh chính (URL)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="luxury-input" />
          <textarea placeholder="Mô tả chi tiết" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="luxury-input sm:col-span-2" rows={3} />
          <div className="sm:col-span-2 flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Hủy</button>
            <button type="submit" className="btn-primary">Lưu mẫu váy</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-blush-pink bg-white p-4 shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-blush-pink/60 text-xs uppercase text-muted">
            <tr>
              <th className="py-3 pr-4">Mẫu váy</th>
              <th className="py-3 pr-4">Danh mục</th>
              <th className="py-3 pr-4">Giá thuê</th>
              <th className="py-3 pr-4">Trạng thái</th>
              <th className="py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blush-pink/40">
            {dresses.map((d) => (
              <tr key={d.id}>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={d.images?.[0]?.image_url || 'https://via.placeholder.com/60'}
                      alt={d.name}
                      className="h-12 w-10 rounded-lg object-cover bg-cream"
                    />
                    <div>
                      <p className="font-medium">{d.name}</p>
                      <p className="text-xs text-muted">{d.code}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 text-xs">{d.category?.name}</td>
                <td className="py-3 pr-4 font-medium text-rose-gold-dark">{formatPrice(d.rental_price)}</td>
                <td className="py-3 pr-4">
                  <button
                    type="button"
                    onClick={() => toggleStatus(d)}
                    className={`rounded-full px-3 py-1 text-xs ${
                      d.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {d.status === 'active' ? 'Đang hiển thị' : 'Đang ẩn'}
                  </button>
                </td>
                <td className="py-3 text-right">
                  <button
                    type="button"
                    onClick={() => remove(d.id)}
                    className="rounded-lg bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100"
                  >
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
