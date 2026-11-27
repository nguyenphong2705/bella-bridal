'use client';

import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import type { Dress, DressCategory } from '@/types';

const emptyDressForm = {
  code: '',
  name: '',
  category_id: '',
  silhouette: 'Công chúa',
  material: '',
  color: 'Trắng ngà',
  rental_price: '',
  sale_price: '',
  image_url: '',
  description: '',
  is_featured: false,
};

const emptyCatForm = {
  name: '',
  description: '',
  image: '',
  sort_order: '1',
};

export default function AdminDressesPage() {
  const [tab, setTab] = useState<'dresses' | 'categories'>('dresses');
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [categories, setCategories] = useState<DressCategory[]>([]);

  const [editingDressId, setEditingDressId] = useState<number | null>(null);
  const [dressForm, setDressForm] = useState(emptyDressForm);

  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [catForm, setCatForm] = useState(emptyCatForm);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const load = () => {
    apiClient.get<{ data: Dress[] }>('/admin/dresses').then((res) => setDresses(res.data.data || []));
    apiClient.get<{ data: DressCategory[] }>('/admin/categories').then((res) => {
      const cats = res.data.data || [];
      setCategories(cats);
      if (cats.length > 0 && !dressForm.category_id) {
        setDressForm((f) => ({ ...f, category_id: String(cats[0].id) }));
      }
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'dress' | 'category') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiClient.post<{ url: string }>('/admin/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (target === 'dress') {
        setDressForm((f) => ({ ...f, image_url: res.data.url }));
      } else {
        setCatForm((f) => ({ ...f, image: res.data.url }));
      }
      setMessage('Đã tải ảnh lên từ máy.');
    } catch {
      setMessage('Tải ảnh thất bại.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const submitDress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        ...dressForm,
        category_id: Number(dressForm.category_id),
        rental_price: Number(dressForm.rental_price || 0),
        sale_price: Number(dressForm.sale_price || 0),
      };
      if (editingDressId) {
        await apiClient.put(`/admin/dresses/${editingDressId}`, payload);
        setMessage('Đã cập nhật mẫu váy.');
      } else {
        await apiClient.post('/admin/dresses', payload);
        setMessage('Đã thêm mẫu váy mới.');
      }
      setEditingDressId(null);
      setDressForm({ ...emptyDressForm, category_id: categories[0] ? String(categories[0].id) : '' });
      load();
    } finally {
      setSaving(false);
    }
  };

  const startEditDress = (d: Dress) => {
    setEditingDressId(d.id);
    setDressForm({
      code: d.code,
      name: d.name,
      category_id: String(d.category_id),
      silhouette: d.silhouette || '',
      material: d.material || '',
      color: d.color || '',
      rental_price: String(d.rental_price || ''),
      sale_price: String(d.sale_price || ''),
      image_url: d.images?.[0]?.image_url || '',
      description: d.description || '',
      is_featured: Boolean(d.is_featured),
    });
  };

  const removeDress = async (id: number) => {
    await apiClient.delete(`/admin/dresses/${id}`);
    load();
  };

  const submitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = { ...catForm, sort_order: Number(catForm.sort_order || 0) };
      if (editingCatId) {
        await apiClient.put(`/admin/categories/${editingCatId}`, payload);
        setMessage('Đã cập nhật danh mục.');
      } else {
        await apiClient.post('/admin/categories', payload);
        setMessage('Đã thêm danh mục mới.');
      }
      setEditingCatId(null);
      setCatForm(emptyCatForm);
      load();
    } finally {
      setSaving(false);
    }
  };

  const startEditCat = (c: DressCategory) => {
    setEditingCatId(c.id);
    setCatForm({
      name: c.name,
      description: c.description || '',
      image: c.image || '',
      sort_order: String(c.sort_order ?? 1),
    });
  };

  const removeCategory = async (id: number) => {
    await apiClient.delete(`/admin/categories/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-semibold text-charcoal">Quản Lý Váy Cưới & Danh Mục</h1>
        {message && <span className="rounded-lg bg-soft-pink px-3 py-1.5 text-xs font-medium text-plum">{message}</span>}
      </div>

      <div className="flex gap-2 border-b border-blush-pink/60 pb-2">
        <button
          type="button"
          onClick={() => setTab('dresses')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'dresses' ? 'bg-plum text-white' : 'bg-white text-charcoal hover:bg-soft-pink'
          }`}
        >
          Mẫu váy cưới ({dresses.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('categories')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'categories' ? 'bg-plum text-white' : 'bg-white text-charcoal hover:bg-soft-pink'
          }`}
        >
          Danh mục váy ({categories.length})
        </button>
      </div>

      {tab === 'dresses' ? (
        <>
          <form onSubmit={submitDress} className="space-y-4 rounded-2xl border border-blush-pink/60 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold text-charcoal">
                {editingDressId ? 'Chỉnh sửa mẫu váy' : 'Thêm mẫu váy cưới mới'}
              </h2>
              {editingDressId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingDressId(null);
                    setDressForm({ ...emptyDressForm, category_id: categories[0] ? String(categories[0].id) : '' });
                  }}
                  className="inline-flex items-center gap-1 text-xs text-muted hover:text-charcoal"
                >
                  <X className="h-3.5 w-3.5" /> Hủy sửa
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Mã váy *</label>
                <input
                  required
                  value={dressForm.code}
                  onChange={(e) => setDressForm((f) => ({ ...f, code: e.target.value }))}
                  placeholder="BB-NEW-01"
                  className="luxury-input"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Tên váy *</label>
                <input
                  required
                  value={dressForm.name}
                  onChange={(e) => setDressForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Seraphina Lace Gown"
                  className="luxury-input"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Danh mục *</label>
                <select
                  required
                  value={dressForm.category_id}
                  onChange={(e) => setDressForm((f) => ({ ...f, category_id: e.target.value }))}
                  className="luxury-input"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Phom dáng</label>
                <input
                  value={dressForm.silhouette}
                  onChange={(e) => setDressForm((f) => ({ ...f, silhouette: e.target.value }))}
                  placeholder="Công chúa / Đuôi cá / Chữ A"
                  className="luxury-input"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Chất liệu</label>
                <input
                  value={dressForm.material}
                  onChange={(e) => setDressForm((f) => ({ ...f, material: e.target.value }))}
                  placeholder="Ren Pháp, Satin Ý..."
                  className="luxury-input"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Màu sắc</label>
                <input
                  value={dressForm.color}
                  onChange={(e) => setDressForm((f) => ({ ...f, color: e.target.value }))}
                  placeholder="Trắng ngà"
                  className="luxury-input"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Giá thuê (VND) *</label>
                <input
                  required
                  type="number"
                  value={dressForm.rental_price}
                  onChange={(e) => setDressForm((f) => ({ ...f, rental_price: e.target.value }))}
                  placeholder="15000000"
                  className="luxury-input"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Giá may mới / bán (VND)</label>
                <input
                  type="number"
                  value={dressForm.sale_price}
                  onChange={(e) => setDressForm((f) => ({ ...f, sale_price: e.target.value }))}
                  placeholder="35000000"
                  className="luxury-input"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-charcoal">
                  <input
                    type="checkbox"
                    checked={dressForm.is_featured}
                    onChange={(e) => setDressForm((f) => ({ ...f, is_featured: e.target.checked }))}
                    className="h-4 w-4 rounded border-blush-pink text-plum focus:ring-plum"
                  />
                  <span>Hiển thị nổi bật</span>
                </label>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Ảnh đại diện váy (Chọn từ máy hoặc nhập URL)</label>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-plum/40 bg-soft-pink px-3.5 py-2.5 text-xs font-semibold text-plum transition-colors hover:bg-blush-pink">
                  <Upload className="h-4 w-4" />
                  <span>{uploading ? 'Đang tải...' : 'Chọn ảnh từ máy'}</span>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'dress')} disabled={uploading} className="hidden" />
                </label>
                <input
                  value={dressForm.image_url}
                  onChange={(e) => setDressForm((f) => ({ ...f, image_url: e.target.value }))}
                  placeholder="https://... hoặc /uploads/..."
                  className="luxury-input flex-1"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Mô tả chi tiết</label>
              <textarea
                rows={2}
                value={dressForm.description}
                onChange={(e) => setDressForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Mô tả phom dáng, chất liệu, điểm nhấn..."
                className="luxury-input"
              />
            </div>

            <button type="submit" disabled={saving} className="btn-primary">
              <Plus className="h-4 w-4" />
              <span>{saving ? 'Đang lưu...' : editingDressId ? 'Lưu cập nhật' : 'Thêm mẫu váy'}</span>
            </button>
          </form>

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
                    <td className="px-4 py-3 font-medium text-plum">{formatCurrency(d.rental_price)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => startEditDress(d)} className="text-plum hover:text-plum-dark" title="Sửa">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => removeDress(d.id)} className="text-red-500 hover:text-red-700" title="Xóa">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <form onSubmit={submitCategory} className="space-y-4 rounded-2xl border border-blush-pink/60 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold text-charcoal">
                {editingCatId ? 'Chỉnh sửa danh mục váy' : 'Thêm danh mục váy mới'}
              </h2>
              {editingCatId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCatId(null);
                    setCatForm(emptyCatForm);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-muted hover:text-charcoal"
                >
                  <X className="h-3.5 w-3.5" /> Hủy sửa
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Tên danh mục *</label>
                <input
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Váy cưới công chúa"
                  className="luxury-input"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Thứ tự</label>
                <input
                  type="number"
                  value={catForm.sort_order}
                  onChange={(e) => setCatForm((f) => ({ ...f, sort_order: e.target.value }))}
                  className="luxury-input"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Ảnh danh mục</label>
                <div className="flex items-center gap-2">
                  <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-plum/40 bg-soft-pink px-3 py-2.5 text-xs font-semibold text-plum hover:bg-blush-pink">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Chọn ảnh</span>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'category')} disabled={uploading} className="hidden" />
                  </label>
                  <input
                    value={catForm.image}
                    onChange={(e) => setCatForm((f) => ({ ...f, image: e.target.value }))}
                    placeholder="URL ảnh..."
                    className="luxury-input"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Mô tả danh mục</label>
              <input
                value={catForm.description}
                onChange={(e) => setCatForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Mô tả phong cách dòng váy..."
                className="luxury-input"
              />
            </div>

            <button type="submit" disabled={saving} className="btn-primary">
              <Plus className="h-4 w-4" />
              <span>{saving ? 'Đang lưu...' : editingCatId ? 'Lưu cập nhật' : 'Thêm danh mục'}</span>
            </button>
          </form>

          <div className="overflow-x-auto rounded-2xl border border-blush-pink/60 bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-blush-pink/60 bg-cream text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">Thứ tự</th>
                  <th className="px-4 py-3">Tên danh mục</th>
                  <th className="px-4 py-3">Mô tả</th>
                  <th className="px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blush-pink/40">
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 text-xs text-muted">{c.sort_order}</td>
                    <td className="px-4 py-3 font-medium text-charcoal">{c.name}</td>
                    <td className="max-w-md px-4 py-3 text-xs text-muted">{c.description}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => startEditCat(c)} className="text-plum hover:text-plum-dark" title="Sửa">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => removeCategory(c.id)} className="text-red-500 hover:text-red-700" title="Xóa">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
