export function localISO(date = new Date()) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function asLocalDate(value) {
  if (!value) return null;
  const d = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function prettyDate(value, opts = { month: 'short', day: 'numeric' }) {
  const d = asLocalDate(value);
  return d ? new Intl.DateTimeFormat('en-US', opts).format(d) : 'Not set';
}

export function daysUntil(value) {
  const target = asLocalDate(value);
  const today = asLocalDate(localISO());
  return target ? Math.round((target.getTime() - today.getTime()) / 86400000) : null;
}

export function dueLabel(value) {
  const n = daysUntil(value);
  if (n === null) return '';
  if (n < 0) return `${Math.abs(n)}d overdue`;
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  return `In ${n} days`;
}

export function safeUrl(raw) {
  if (!raw || typeof raw !== 'string') return '';
  try {
    const url = new URL(raw);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}

export function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((x) => x[0]?.toUpperCase()).join('') || 'AF';
}

export function logoHue(company = '') {
  const colors = ['#7b70f4', '#ff9b82', '#219a91', '#e7ac46', '#4d93db', '#ce78b1'];
  const hash = Array.from(company).reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `job-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function csvEscape(value) {
  const text = String(value ?? '');
  // Guard against spreadsheet formula injection in exported CSV files.
  const safe = /^[\s]*[=+@\-\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function saveCSV(jobs) {
  const keys = ['company', 'role', 'location', 'workMode', 'jobType', 'status', 'appliedDate', 'interviewDate', 'followUpDate', 'salary', 'url', 'contact', 'notes'];
  const csv = [keys.join(','), ...jobs.map((job) => keys.map((key) => csvEscape(job[key])).join(','))].join('\r\n');
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `applyflow-${localISO()}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
