export function formatPrice(value) {
  if (!value && value !== 0) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export const STATUS_LABELS = {
  pending: { label: 'Chờ xác nhận', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Đã xác nhận', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  completed: { label: 'Hoàn thành', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  cancelled: { label: 'Đã hủy', className: 'bg-rose-50 text-rose-700 border-rose-200' },
};
