export function formatCurrency(amount?: number | null): string {
  if (!amount) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatVnPhone(phone?: string | null): string {
  if (!phone) return '+84 901 234 567';
  const trimmed = phone.trim();
  if (trimmed.includes('@')) return trimmed;
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return trimmed;

  let national = digits;
  if (digits.startsWith('84') && digits.length >= 10) {
    national = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length >= 9) {
    national = digits.slice(1);
  }

  if (national.length === 9) {
    return `+84 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
  }
  if (national.length === 10) {
    return `+84 ${national.slice(0, 2)} ${national.slice(2, 6)} ${national.slice(6)}`;
  }
  return `+84 ${national}`;
}

export function toTelHref(phone?: string | null): string {
  const formatted = formatVnPhone(phone);
  return `tel:${formatted.replace(/\s+/g, '')}`;
}
