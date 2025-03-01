// Updated utils/phoneUtils.ts for Original Code
export const sanitizePhoneNumber = (phoneNumber: string): string => {
  return phoneNumber.replace(/[^\d+]/g, '');
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = sanitizePhoneNumber(phoneNumber);
  if (cleaned.startsWith('+')) {
    const countryCode = cleaned.slice(0, cleaned.length - 10);
    const number = cleaned.slice(-10);
    if (number.length === 10) {
      return `${countryCode} (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    return cleaned;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return cleaned;
};

export const generateCallId = (phoneNumber: string): string => {
  return `${sanitizePhoneNumber(phoneNumber)}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const isInternationalNumber = (phoneNumber: string): boolean => {
  return phoneNumber.startsWith('+');
};

export const getCountryCode = (phoneNumber: string): string | null => {
  if (!isInternationalNumber(phoneNumber)) return null;
  const cleaned = sanitizePhoneNumber(phoneNumber);
  return cleaned.slice(0, cleaned.length - 10);
};