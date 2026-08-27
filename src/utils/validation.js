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

// * Centralized validation helper based on translations object
export const validateRegister = (formData, tErrors) => {
  const { name, email, phone, password, confirmPassword, role } = formData;

  // 1. Name Validation
  if (!name || !name.trim()) {
    return { isValid: false, error: tErrors.nameRequired };
  }
  if (name.trim().length < 3) {
    return { isValid: false, error: tErrors.nameMin };
  }
  if (name.trim().length > 70) {
    return { isValid: false, error: tErrors.nameMax };
  }

  // 2. Email Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !email.trim()) {
    return { isValid: false, error: tErrors.emailRequired };
  }
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: tErrors.emailInvalid };
  }

  // 3. Phone Validation (Egyptian Mobile Format Example: 01xxxxxxxxx)
  const phoneRegex = /^01[0125][0-9]{8}$/;
  if (!phone || !phone.trim()) {
    return { isValid: false, error: tErrors.phoneRequired };
  }
  if (!phoneRegex.test(phone.trim())) {
    return { isValid: false, error: tErrors.phoneInvalid };
  }

  // 4. Role Validation
  if (!role) {
    return { isValid: false, error: tErrors.roleRequired };
  }

  // 5. Password Validation
  if (!password) {
    return { isValid: false, error: tErrors.passwordRequired };
  }
  if (password.length < 8) {
    return { isValid: false, error: tErrors.passwordMin };
  }
  if (password.length > 20) {
    return { isValid: false, error: tErrors.passwordMax };
  }

  // 6. Confirm Password Validation
  if (!confirmPassword) {
    return { isValid: false, error: tErrors.confirmPasswordRequired };
  }
  if (password !== confirmPassword) {
    return { isValid: false, error: tErrors.passwordMismatch };
  }

  return { isValid: true, error: null };
};