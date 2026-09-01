// * Card & Expiry Formatting Utilities
export const formatCardNumber = (value) => {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
  return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

export const formatExpiryDate = (value) => {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
  if (digitsOnly.length >= 3) {
    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
  }
  return digitsOnly;
};

export const formatCVC = (value) => {
  return value.replace(/\D/g, '').slice(0, 4);
};