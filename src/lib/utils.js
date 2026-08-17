import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

/** Format number into Indian Currency (₹) */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format Date strings safely */
export function formatDate(dateString, pattern = 'dd MMM yyyy') {
  if (!dateString) return '—';
  try {
    const d = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(d)) return '—';
    return format(d, pattern);
  } catch {
    return '—';
  }
}

/** Format Relative time */
export function formatRelativeTime(dateString) {
  if (!dateString) return '—';
  try {
    const d = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(d)) return '—';
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '—';
  }
}

/** Mask PAN number for privacy e.g. ABCDE1234F -> ABC** **34F */
export function maskPAN(pan) {
  if (!pan || typeof pan !== 'string') return '—';
  const clean = pan.trim().toUpperCase();
  if (clean.length < 10) return clean;
  return `${clean.slice(0, 3)}****${clean.slice(7)}`;
}

/** Mask Bank Account Number */
export function maskBankAccount(acc) {
  if (!acc || typeof acc !== 'string') return '—';
  const clean = acc.trim();
  if (clean.length <= 4) return clean;
  return `•••• •••• ${clean.slice(-4)}`;
}

/** Mask Aadhaar */
export function maskAadhaar(aadhaar) {
  if (!aadhaar || typeof aadhaar !== 'string') return '—';
  const clean = aadhaar.replace(/\D/g, '');
  if (clean.length !== 12) return aadhaar;
  return `•••• •••• ${clean.slice(-4)}`;
}

/** Generate and trigger CSV download */
export function downloadCSV(data, filename = 'export.csv') {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((item) =>
    headers
      .map((header) => {
        let val = item[header] ?? '';
        if (typeof val === 'object') val = JSON.stringify(val);
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
