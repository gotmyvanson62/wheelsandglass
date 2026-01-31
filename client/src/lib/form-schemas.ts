import { z } from 'zod';

// Quote form validation schema
export const quoteFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  mobilePhone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\+?[\d\s\-\(\)\.]+$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email address'),
  location: z.string().min(1, 'Service location is required'),
  zipCode: z.string().optional().refine((val) => {
    if (!val) return true;
    return /^\d{5}(-\d{4})?$/.test(val);
  }, 'Invalid zip code format'),
  serviceType: z.string().min(1, 'Service type is required'),
  privacyTinted: z.string().optional(),
  year: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  vin: z.string().optional().refine((val) => {
    if (!val) return true;
    return val.length === 17;
  }, 'VIN must be exactly 17 characters'),
  notes: z.string().max(1000, 'Notes too long').optional(),
  selectedWindows: z.array(z.string()).min(1, 'Please select at least one window/glass type'),
});

// Agent portal form validation schema
export const agentPortalSchema = z.object({
  // Agent Information
  agentName: z.string().min(1, 'Agent name is required').max(100),
  agencyName: z.string().min(1, 'Agency name is required').max(100),
  agentPhone: z.string().min(10, 'Phone number required').regex(/^\+?[\d\s\-\(\)\.]+$/, 'Invalid phone number'),
  agentEmail: z.string().email('Invalid email address'),
  licenseNumber: z.string().min(1, 'License number is required'),

  // Client Information  
  clientName: z.string().min(1, 'Client name is required').max(100),
  clientPhone: z.string().min(10, 'Client phone required').regex(/^\+?[\d\s\-\(\)\.]+$/, 'Invalid phone number'),
  clientEmail: z.string().email('Invalid client email address'),

  // Insurance Information
  policyNumber: z.string().min(1, 'Policy number is required'),
  claimNumber: z.string().optional(),
  deductible: z.string().min(1, 'Deductible amount is required'),

  // Vehicle Information
  year: z.string().min(4, 'Vehicle year is required'),
  make: z.string().min(1, 'Vehicle make is required'),
  model: z.string().min(1, 'Vehicle model is required'),
  vin: z.string().optional().refine((val) => {
    if (!val) return true;
    return val.length === 17;
  }, 'VIN must be exactly 17 characters'),
  color: z.string().optional(),

  // Service Details
  serviceType: z.string().min(1, 'Service type is required'),
  damageDescription: z.string().min(10, 'Please provide a detailed damage description'),
  location: z.string().min(1, 'Service location is required'),
  preferredDate: z.string().min(1, 'Preferred date is required'),
  preferredTime: z.string().min(1, 'Preferred time is required'),
  urgency: z.string().min(1, 'Urgency level is required'),
  
  // Additional Information
  additionalNotes: z.string().max(2000, 'Notes too long').optional(),

  // Consent
  clientConsent: z.boolean().refine(val => val === true, 'Client consent is required'),
  agentAuthorization: z.boolean().refine(val => val === true, 'Agent authorization is required'),
});

// Admin login validation schema
export const adminLoginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Service area zip code validation
export const zipCodeSchema = z.object({
  zipCode: z.string()
    .min(5, 'Zip code must be at least 5 digits')
    .max(10, 'Zip code too long')
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid zip code format'),
});

export type QuoteFormData = z.infer<typeof quoteFormSchema>;
export type AgentPortalData = z.infer<typeof agentPortalSchema>;
export type AdminLoginData = z.infer<typeof adminLoginSchema>;
export type ZipCodeData = z.infer<typeof zipCodeSchema>;