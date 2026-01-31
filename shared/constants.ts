// Job Status Constants
export const JOB_STATUSES = {
  PENDING: 'pending',
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Appointment Status Constants
export const APPOINTMENT_STATUSES = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
} as const;

// Payment Status Constants
export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

// Invoice Status Constants
export const INVOICE_STATUSES = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  TECHNICIAN: 'technician',
  CSR: 'csr',
  USER: 'user',
} as const;

// Contact Categories
export const CONTACT_CATEGORIES = {
  TECHNICIAN: 'technician',
  CUSTOMER: 'customer',
  DISTRIBUTOR: 'distributor',
} as const;

// Glass Types
export const GLASS_TYPES = {
  WINDSHIELD: 'windshield',
  DOOR_GLASS: 'door_glass',
  REAR_WINDOW: 'rear_window',
  QUARTER_GLASS: 'quarter_glass',
  SUNROOF: 'sunroof',
  VENT_GLASS: 'vent_glass',
} as const;

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  CARD: 'card',
  CASH: 'cash',
  CHECK: 'check',
  SQUARE: 'square',
  INSURANCE: 'insurance',
} as const;

// SMS Direction
export const SMS_DIRECTIONS = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
} as const;

// Webhook Sources
export const WEBHOOK_SOURCES = {
  SQUARE_PAYMENT: 'square_payment',
  SQUARE_BOOKING: 'square_booking',
  QUO_SMS: 'quo_sms',
  SQUARESPACE_FORM: 'squarespace_form',
  // @deprecated Use QUO_SMS instead
  TWILIO_SMS: 'twilio_sms',
} as const;

// API Endpoints (relative)
export const API_ENDPOINTS = {
  JOBS: '/api/jobs',
  APPOINTMENTS: '/api/appointments',
  PAYMENTS: '/api/payments',
  INVOICES: '/api/invoices',
  CONTACTS: '/api/contacts',
  COMMUNICATIONS: '/api/communications',
  WEBHOOKS: '/api/webhooks',
  DASHBOARD: '/api/dashboard',
  REVENUE: '/api/revenue',
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  API: 'yyyy-MM-dd',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100,
} as const;

// Status Colors (for UI)
export const STATUS_COLORS = {
  pending: 'yellow',
  scheduled: 'blue',
  in_progress: 'purple',
  completed: 'green',
  cancelled: 'red',
  draft: 'gray',
  sent: 'blue',
  paid: 'green',
  overdue: 'red',
  failed: 'red',
  refunded: 'orange',
} as const;

// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;
