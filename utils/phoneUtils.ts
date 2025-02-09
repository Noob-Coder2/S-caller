export const sanitizePhoneNumber = (phoneNumber: string): string => {
    return phoneNumber.replace(/[^\d+]/g, '');
  };
  
  export const formatPhoneNumber = (phoneNumber: string): string => {
    const cleaned = sanitizePhoneNumber(phoneNumber);
    if (cleaned.startsWith('+')) {
      return `+${cleaned.slice(1).replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}`;
    }
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };
  
  export const generateCallId = (phoneNumber: string): string => {
    return `${sanitizePhoneNumber(phoneNumber)}-${Date.now()}`;
  };