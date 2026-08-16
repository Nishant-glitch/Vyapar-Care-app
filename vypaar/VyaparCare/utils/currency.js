/**
 * 10000 -> "₹10,000" (Indian digit grouping: last 3, phir 2-2)
 * Intl.NumberFormat ke bharose nahi hain — Hermes builds me 'en-IN'
 * locale data hamesha available nahi hota.
 */
export const formatINR = (amount) => {
  const digits = String(Math.round(amount));
  if (digits.length <= 3) return `₹${digits}`;
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `₹${rest},${last3}`;
};
