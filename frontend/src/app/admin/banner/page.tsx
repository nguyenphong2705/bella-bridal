'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import type { HeroBanner } from '@/types';

const PRESET_GRADIENTS = [
  {
    label: 'Hồng đất cổ điển',
    value: 'linear-gradient(180deg, #B59CA0 0%, #C8ADA8 24%, #D7B8B0 48%, #CE9F97 72%, #EADBD6 92%, #DFCCC6 100%)',
  },
  {
    label: 'Ngọc trai & Oải hương nhạt',
    value: 'linear-gradient(180deg, #B8ADB8 0%, #CCC0C8 24%, #DFD0D4 48%, #D3B8BE 72%, #EFE5E6 92%, #E5D7D9 100%)',
  },
  {
    label: 'Ngà vườn & Xô thơm ấm',
    value: 'linear-gradient(180deg, #B6BCB3 0%, #C8CDC2 24%, #DBD9CF 48%, #D4C7BC 72%, #EDE7E1 92%, #E3DBD3 100%)',
  },
  {
    label: 'Champagne & Vàng mật ong',
    value: 'linear-gradient(180deg, #BCAA98 0%, #CEBBA8 24%, #E0CEC0 48%, #D6B9A6 72%, #F1E5DC 92%, #E8D9CE 100%)',
  },
];

const emptyForm = {
  badge: 'HAUTE COUTURE BRIDAL 2026',
  title: '',
  subtitle: '',
  image_url: '',
  bg_gradient: PRESET_GRADIENTS[0].value,
  cta_text: 'Đặt lịch thử váy ngay',
  cta_link: '/dat-lich',
  secondary_cta_text: 'Xem bộ sưu tập',
  secondary_cta_link: '/bo-suu-tap',
  sort_order: '1',
  is_active: true,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setForm((f) => ({ ...f, image_url: res.data.url }));
      setMessage('Đã tải ảnh lên từ máy.');
    } catch {
      setMessage('Tải ảnh thất bại, vui lòng thử lại.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const load = () => {
    apiClient.get<{ data: HeroBanner[] }>('/admin/banners').then((res) => setBanners(res.data.data || []));
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
        sort_order: Number(form.sort_order || 0),
      };
      if (editingId) {
        await apiClient.put(`/admin/banners/${editingId}`, payload);
        setMessage('Đã cập nhật banner.');
      } else {
        await apiClient.post('/admin/banners', payload);
        setMessage('Đã thêm banner mới.');
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (b: HeroBanner) => {
    setEditingId(b.id);
    setForm({
      badge: b.badge || '',
      title: b.title || '',
      subtitle: b.subtitle || '',
      image_url: b.image_url || '',
      bg_gradient: b.bg_gradient || PRESET_GRADIENTS[0].value,
      cta_text: b.cta_text || 'Đặt lịch thử váy ngay',
      cta_link: b.cta_link || '/dat-lich',
      secondary_cta_text: b.secondary_cta_text || 'Xem bộ sưu tập',
      secondary_cta_link: b.secondary_cta_link || '/bo-suu-tap',
      sort_order: String(b.sort_order ?? 1),
      is_active: Boolean(b.is_active),
    });
  };

  const toggleActive = async (b: HeroBanner) => {
    await apiClient.put(`/admin/banners/${b.id}`, { is_active: !b.is_active });
    load();
  };

  const remove = async (id: number) => {
    await apiClient.delete(`/admin/banners/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-charcoal">Quản Lý Banner Trang Chủ</h1>
          <p className="mt-1 text-xs text-muted">Thêm, chỉnh sửa, sắp xếp thứ tự các slide carousel trên Hero Banner.</p>
        </div>
        {message && <span className="rounded-lg bg-soft-pink px-3 py-1.5 text-xs font-medium text-plum">{message}</span>}
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-blush-pink/60 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-charcoal">
            {editingId ? 'Chỉnh sửa banner' : 'Thêm banner mới'}
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
            <label className="mb-1 block text-xs font-medium text-muted">Nhãn (Badge)</label>
            <input
              value={form.badge}
              onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
              className="luxury-input"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-muted">Tiêu đề chính *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Vẻ Đẹp Tinh Khôi Cho Ngày Trọng Đại"
              className="luxury-input"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-muted">Ảnh banner (Chọn từ máy hoặc nhập URL) *</label>
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-plum/40 bg-soft-pink px-3.5 py-2.5 text-xs font-semibold text-plum transition-colors hover:bg-blush-pink">
                <Upload className="h-4 w-4" />
                <span>{uploading ? 'Đang tải ảnh...' : 'Chọn ảnh từ máy'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <input
                required
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                placeholder="/images/hero-slide-1.png hoặc https://..."
                className="luxury-input flex-1"
              />
            </div>
            {form.image_url && (
              <div className="mt-2 flex items-center gap-3">
                <div
                  className="h-16 w-14 overflow-hidden rounded-lg border border-blush-pink/60"
                  style={{ background: form.bg_gradient }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.image_url} alt="Preview" className="h-full w-full object-contain object-bottom" />
                </div>
                <span className="text-xs text-muted">Xem trước ảnh trên nền đã chọn</span>
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Thứ tự hiển thị</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
              className="luxury-input"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Mô tả ngắn</label>
          <textarea
            rows={2}
            value={form.subtitle}
            onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
            className="luxury-input"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Màu nền Gradient</label>
          <div className="mb-2 flex flex-wrap gap-2">
            {PRESET_GRADIENTS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setForm((f) => ({ ...f, bg_gradient: preset.value }))}
                className="flex items-center gap-2 rounded-full border border-blush-pink px-3 py-1 text-xs text-charcoal hover:border-plum"
              >
                <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: preset.value }} />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
          <input
            value={form.bg_gradient}
            onChange={(e) => setForm((f) => ({ ...f, bg_gradient: e.target.value }))}
            className="luxury-input font-mono text-xs"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Nút chính</label>
            <input
              value={form.cta_text}
              onChange={(e) => setForm((f) => ({ ...f, cta_text: e.target.value }))}
              className="luxury-input"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Link nút chính</label>
            <input
              value={form.cta_link}
              onChange={(e) => setForm((f) => ({ ...f, cta_link: e.target.value }))}
              className="luxury-input"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Nút phụ</label>
            <input
              value={form.secondary_cta_text}
              onChange={(e) => setForm((f) => ({ ...f, secondary_cta_text: e.target.value }))}
              className="luxury-input"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Link nút phụ</label>
            <input
              value={form.secondary_cta_link}
              onChange={(e) => setForm((f) => ({ ...f, secondary_cta_link: e.target.value }))}
              className="luxury-input"
            />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          <Plus className="h-4 w-4" />
          <span>{saving ? 'Đang lưu...' : editingId ? 'Lưu cập nhật' : 'Thêm banner'}</span>
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {banners.map((b) => (
          <div key={b.id} className="flex gap-4 rounded-2xl border border-blush-pink/60 bg-white p-4 shadow-card">
            <div
              className="relative h-32 w-28 shrink-0 overflow-hidden rounded-xl border border-blush-pink/50"
              style={{ background: b.bg_gradient || PRESET_GRADIENTS[0].value }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.image_url} alt={b.title} className="h-full w-full object-contain object-bottom" />
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-plum">{b.badge}</span>
                  <span className="text-xs text-muted">Thứ tự: {b.sort_order}</span>
                </div>
                <h3 className="mt-1 font-serif text-lg font-semibold text-charcoal">{b.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{b.subtitle}</p>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleActive(b)}
                  className={`inline-flex items-center gap-1 text-xs font-medium ${
                    b.is_active ? 'text-emerald-700' : 'text-muted'
                  }`}
                >
                  {b.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  <span>{b.is_active ? 'Đang hiển thị' : 'Đang ẩn'}</span>
                </button>
                <button type="button" onClick={() => startEdit(b)} className="text-plum hover:text-plum-dark" title="Sửa">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => remove(b.id)} className="text-red-500 hover:text-red-700" title="Xóa">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
