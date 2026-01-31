// Form validation utilities
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)\.]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateZipCode(zipCode: string): boolean {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode);
}

export function validateVIN(vin: string): boolean {
  if (!vin) return true; // VIN is optional
  return vin.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin);
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function getFieldError(errors: Record<string, any>, fieldName: string): string | undefined {
  const error = errors[fieldName];
  if (error) {
    return Array.isArray(error) ? error[0] : error.message || error;
  }
  return undefined;
}