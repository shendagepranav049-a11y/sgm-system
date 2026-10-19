/**
 * Currency & Monetary Precision Utility
 * All monetary amounts in Firestore are stored as integer paise to prevent IEEE 754 floating point errors.
 * 100 paise = 1 Indian Rupee (₹).
 */

export const paiseToRupees = (paise) => {
  if (!paise || isNaN(paise)) return 0;
  return Number(paise) / 100;
};

export const rupeesToPaise = (rupees) => {
  if (!rupees || isNaN(rupees)) return 0;
  return Math.round(Number(rupees) * 100);
};

export const formatCurrency = (paise, symbol = "₹") => {
  const rupees = paiseToRupees(paise);
  return `${symbol}${rupees.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export const formatRupees = (rupees, symbol = "₹") => {
  if (!rupees || isNaN(rupees)) rupees = 0;
  return `${symbol}${Number(rupees).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};
