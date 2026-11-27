'use client';

import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import type { BlogPost } from '@/types';

const emptyForm = {
  title: '',
  category: 'Kinh nghiệm cưới',
  excerpt: '',
  content: '',
  thumbnail: '',
  status: 'published',
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = () => {
    apiClient.get<{ data: BlogPost[] }>('/admin/posts').then((res) => setPosts(res.data.data || []));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      if (editingId) {
        await apiClient.put(`/admin/posts/${editingId}`, form);
        setMessage('Đã cập nhật bài viết.');
      } else {
        await apiClient.post('/admin/posts', form);
        setMessage('Đã đăng bài viết mới.');
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      category: post.category || 'Kinh nghiệm cưới',
      excerpt: post.excerpt || '',
      content: post.content || '',
      thumbnail: post.thumbnail || '',
      status: post.status || 'published',
    });
  };

  const remove = async (id: number) => {
    await apiClient.delete(`/admin/posts/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-semibold text-charcoal">Quản Lý Tạp Chí Cưới</h1>
        {message && <span className="rounded-lg bg-soft-pink px-3 py-1.5 text-xs font-medium text-plum">{message}</span>}
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-blush-pink/60 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-charcoal">
            {editingId ? 'Chỉnh sửa bài viết' : 'Viết bài tạp chí mới'}
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
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-muted">Tiêu đề bài viết *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ví dụ: Bí quyết chọn váy cưới tôn dáng..."
              className="luxury-input"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Chuyên mục</label>
            <input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="Kinh nghiệm cưới"
              className="luxury-input"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-muted">Link ảnh bìa (Thumbnail)</label>
            <input
              value={form.thumbnail}
              onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))}
              placeholder="https://images.unsplash.com/..."
              className="luxury-input"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Trạng thái</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="luxury-input"
            >
              <option value="published">Công khai</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Tóm tắt ngắn</label>
          <input
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            placeholder="Đoạn mở đầu ngắn hiển thị trên thẻ bài viết..."
            className="luxury-input"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Nội dung bài viết</label>
          <textarea
            rows={5}
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            placeholder="Nhập nội dung bài viết..."
            className="luxury-input"
          />
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          <Plus className="h-4 w-4" />
          <span>{saving ? 'Đang lưu...' : editingId ? 'Lưu cập nhật' : 'Đăng bài viết'}</span>
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-blush-pink/60 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-blush-pink/60 bg-cream text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Tiêu đề</th>
              <th className="px-4 py-3">Chuyên mục</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blush-pink/40">
            {posts.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium text-charcoal">{p.title}</td>
                <td className="px-4 py-3 text-xs text-muted">{p.category}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      p.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {p.status === 'published' ? 'Công khai' : 'Nháp'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => startEdit(p)} className="text-plum hover:text-plum-dark" title="Sửa">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => remove(p.id)} className="text-red-500 hover:text-red-700" title="Xóa">
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
