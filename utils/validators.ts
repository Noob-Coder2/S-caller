export const validatePhoneNumber = (phoneNumber: string): boolean => {
    // Basic international phone number validation
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    return cleaned.length >= 8 && cleaned.length <= 15;
  };
  
  export const validateNumberOfCalls = (numCalls: string): boolean => {
    const num = parseInt(numCalls, 10);
    return !isNaN(num) && num > 0 && num <= 10;
  };
  
  export const validateMessage = (message: string): boolean => {
    return message.length <= 160; // Standard SMS length limit
  };