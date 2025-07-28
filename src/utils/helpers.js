// Helper functions for formatting, validation, etc.

export const formatCurrency = (amount) => {
  return `₹${amount.toFixed(2)}`;
};

export const isValidPhone = (phone) => {
  return /^\d{10}$/.test(phone);
};
