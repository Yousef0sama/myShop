// * Centralized validation for Registration
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

  // 3. Phone Validation (Egyptian Mobile Format: 01xxxxxxxxx)
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

// * Centralized validation for single profile field updates (Name / Email / Phone)
export const validateProfileField = (fieldName, value, tErrors) => {
  const val = (value || '').trim();

  switch (fieldName) {
    case 'name':
      if (!val) return { isValid: false, error: tErrors.nameRequired };
      if (val.length < 3) return { isValid: false, error: tErrors.nameMin };
      if (val.length > 70) return { isValid: false, error: tErrors.nameMax };
      break;

    case 'email': {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!val) return { isValid: false, error: tErrors.emailRequired };
      if (!emailRegex.test(val)) return { isValid: false, error: tErrors.emailInvalid };
      break;
    }

    case 'phone': {
      const phoneRegex = /^01[0125][0-9]{8}$/;
      if (!val) return { isValid: false, error: tErrors.phoneRequired };
      if (!phoneRegex.test(val)) return { isValid: false, error: tErrors.phoneInvalid };
      break;
    }

    default:
      break;
  }

  return { isValid: true, error: null };
};

// * Centralized validation for Password Change
export const validateChangePassword = (formData, tErrors) => {
  const { currentPassword, newPassword, confirmPassword } = formData;

  if (!currentPassword) {
    return { isValid: false, error: tErrors.currentPasswordRequired };
  }
  if (!newPassword) {
    return { isValid: false, error: tErrors.passwordRequired };
  }
  if (newPassword.length < 8) {
    return { isValid: false, error: tErrors.passwordMin };
  }
  if (newPassword.length > 20) {
    return { isValid: false, error: tErrors.passwordMax };
  }
  if (!confirmPassword) {
    return { isValid: false, error: tErrors.confirmPasswordRequired };
  }
  if (newPassword !== confirmPassword) {
    return { isValid: false, error: tErrors.passwordMismatch };
  }

  return { isValid: true, error: null };
};

// * Centralized validation for Payment Cards
export const validateCard = (cardData, tErrors) => {
  const { cardHolderName, cardNumber, expiryDate, cvv } = cardData;

  // 1. Cardholder Name
  if (!cardHolderName || !cardHolderName.trim()) {
    return { isValid: false, error: tErrors.cardHolderNameRequired };
  }

  // 2. Card Number (16 Digits)
  const rawCardNumber = (cardNumber || '').replace(/\s/g, '');
  if (!rawCardNumber) {
    return { isValid: false, error: tErrors.cardNumberRequired };
  }
  if (!/^\d{16}$/.test(rawCardNumber)) {
    return { isValid: false, error: tErrors.cardNumberInvalid };
  }

  // 3. Expiry Date (MM/YY Format)
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!expiryDate || !expiryDate.trim()) {
    return { isValid: false, error: tErrors.expiryDateRequired };
  }
  if (!expiryRegex.test(expiryDate.trim())) {
    return { isValid: false, error: tErrors.expiryDateInvalid };
  }

  // 4. CVC / CVV (3 or 4 Digits)
  if (!cvv || !cvv.trim()) {
    return { isValid: false, error: tErrors.cvvRequired };
  }
  if (!/^\d{3,4}$/.test(cvv.trim())) {
    return { isValid: false, error: tErrors.cvvInvalid };
  }

  return { isValid: true, error: null };
};

// * Centralized validation for Address creation / editing
export const validateAddress = (addressData, tErrors) => {
  const { country, state, city, street } = addressData;

  if (!country || !country.trim()) {
    return { isValid: false, error: tErrors.countryRequired };
  }
  if (!state || !state.trim()) {
    return { isValid: false, error: tErrors.stateRequired };
  }
  if (!city || !city.trim()) {
    return { isValid: false, error: tErrors.cityRequired };
  }
  if (!street || !street.trim()) {
    return { isValid: false, error: tErrors.streetRequired };
  }

  return { isValid: true, error: null };
};

export const validateReview = ({ rating, comment }) => {
  const errors = {};

  // Rating validation: must exist and be between 1 and 5
  if (!rating || Number(rating) < 1 || Number(rating) > 5) {
    errors.rating = 'Rating is required and must be between 1 and 5';
  }

  // Comment validation: must not be empty and must meet minimum length requirement
  if (!comment || !comment.trim()) {
    errors.comment = 'Comment is required';
  } else if (comment.trim().length < 5) {
    errors.comment = 'Comment must be at least 5 characters long';
  }

  return errors;
};