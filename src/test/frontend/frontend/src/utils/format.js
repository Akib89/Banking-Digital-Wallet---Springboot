export function formatMoney(value, currency = 'BDT') {
  const number = Number(value || 0);
  try {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  } catch {
    return `${currency} ${number.toFixed(2)}`;
  }
}

export function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function shortId(value) {
  if (!value) return '—';
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}
