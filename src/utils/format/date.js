export const formatDate = (value) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value));
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
};

export const formatTimeAgo = (value) => {
  if (!value) return '—';

  const diffSeconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const divisions = [
    { amount: 60, unit: 'second' },
    { amount: 60, unit: 'minute' },
    { amount: 24, unit: 'hour' },
    { amount: 7, unit: 'day' },
    { amount: 4.34524, unit: 'week' },
    { amount: 12, unit: 'month' },
    { amount: Number.POSITIVE_INFINITY, unit: 'year' },
  ];

  let duration = diffSeconds;
  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' }).format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return formatDate(value);
};
