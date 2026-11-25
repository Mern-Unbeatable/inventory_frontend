const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const wholeFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatCurrency = (value, { decimals = true } = {}) =>
  (decimals ? formatter : wholeFormatter).format(Number(value) || 0);

export const formatNumber = (value) => new Intl.NumberFormat('en-US').format(Number(value) || 0);
