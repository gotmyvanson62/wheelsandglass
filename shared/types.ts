// Omega EDI Types
export interface OmegaEDIJob {
  jobId: string;
  shopId: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  vehicleInfo: {
    vin: string;
    year: number;
    make: string;
    model: string;
    color?: string;
    description?: string;
    licensePlate?: string;
    odometer?: string;
  };
  glassInfo: {
    nagsCode: string;
    partNumber: string;
    description: string;
    damageType: string;
  };
  insurance?: {
    company: string;
    policyNumber: string;
    claimNumber: string;
  };
  appointment: {
    date: string;
    time: string;
    type: string;
    status: string;
    completedDate?: string;
  };
  scheduling: {
    requestedDate?: string;
    scheduledDate?: string;
    completedDate?: string;
  };
  invoice: {
    items: Array<{
      sku: string;
      description: string;
      listPrice: number;
      extendedPrice: number;
      discount: number;
      cost: number;
      quantity: number;
      totalPrice: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
    grossMargin: number;
  };
  pricing: {
    laborAmount: number;
    partsAmount: number;
    taxAmount: number;
    totalAmount: number;
  };
  billing: {
    account: string;
    accountPhone: string;
    accountAddress: string;
    pricingProfile: string;
    poNumber?: string;
  };
  jobInfo: {
    csr: string;
    dispatcher?: string;
    biller?: string;
    salesRep?: string;
    location: string;
    campaign: string;
    status: string;
    tags: string[];
  };
  payments: Array<{
    amount: number;
    method: string;
    date: string;
    status: string;
  }>;
  notes: Array<{
    text: string;
    author: string;
    date: string;
    visibleToCustomer: boolean;
  }>;
  status: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Revenue Types
export interface RevenueStats {
  contractedRevenue: number;
  collectedRevenue: number;
  outstandingRevenue: number;
  periodStart: string;
  periodEnd: string;
  jobsCompleted: number;
  averageJobValue: number;
  collectionRate: number;
}

// Dashboard Statistics
export interface DashboardStats {
  formSubmissions: number;
  jobsScheduled: number;
  jobsCompleted: number;
  invoicesPaid: number;
  totalRevenue: number;
  pendingJobs: number;
  activeJobs: number;
  completedToday: number;
  revenueToday: number;
}

// Contact Statistics
export interface ContactStats {
  totalContacts: number;
  activeConversations: number;
  pendingResponses: number;
  completedJobs: number;
  averageResponseTime: number;
  conversionRate: number;
}

// Job Status Types
export type JobStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

// Filter Types
export interface JobFilters {
  status?: JobStatus[];
  dateFrom?: string;
  dateTo?: string;
  contactId?: number;
  technicianId?: number;
  search?: string;
  insuranceCompany?: string;
  priority?: string;
}

export interface AppointmentFilters {
  status?: AppointmentStatus[];
  dateFrom?: string;
  dateTo?: string;
  contactId?: number;
}

// Square Types
export interface SquarePaymentRequest {
  amount: number;
  currency?: string;
  sourceId?: string;
  customerId?: string;
  referenceId?: string;
  note?: string;
}

export interface SquareBookingData {
  id: string;
  version?: number;
  status?: string;
  createdAt?: string;
  startAt: string;
  locationId?: string;
  customerId?: string;
  customerNote?: string;
  sellerNote?: string;
  appointmentSegments?: Array<{
    durationMinutes?: number;
    serviceVariationId?: string;
    teamMemberId?: string;
  }>;
}

// Twilio Types
export interface TwilioSMSMessage {
  To: string;
  From: string;
  Body: string;
  MessageSid?: string;
  AccountSid?: string;
  MessagingServiceSid?: string;
  NumMedia?: string;
  MediaUrl?: string[];
}

export interface TwilioFlexConversation {
  conversationSid: string;
  accountSid: string;
  friendlyName?: string;
  attributes?: Record<string, any>;
  state?: 'active' | 'inactive' | 'closed';
}

// VIN Lookup Types
export interface VINLookupResult {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  bodyType?: string;
  engineType?: string;
  transmission?: string;
  fuelType?: string;
}

// NAGS Lookup Types
export interface NAGSLookupResult {
  nagsCode: string;
  partNumber: string;
  description: string;
  price: number;
  availability: boolean;
  manufacturer?: string;
}

// Form Submission Type (from Squarespace)
export interface FormSubmission {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleYear?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleVin?: string;
  damageDescription?: string;
  policyNumber?: string;
  insuranceCompany?: string;
  preferredDate?: string;
  additionalNotes?: string;
}

// Webhook Event Types
export interface WebhookEvent {
  id: string;
  source: 'square_payment' | 'square_booking' | 'twilio_sms' | 'squarespace_form';
  eventType: string;
  timestamp: string;
  data: any;
}

// Contact Type (for CRM)
export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  status: 'active' | 'inactive' | 'pending';
  lastContact: Date;
  totalJobs: number;
  tags: string[];
  category: 'technician' | 'customer' | 'distributor';
  specialties?: string[];
  serviceAreas?: string[];
}

// Job Record with Relations
export interface JobRecordWithRelations {
  id: number;
  jobNumber: string;
  status: JobStatus;
  contact?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  vehicle: {
    year: number;
    make: string;
    model: string;
    vin: string;
  };
  appointments?: Array<{
    id: number;
    startTime: Date;
    endTime: Date;
    status: AppointmentStatus;
  }>;
  invoices?: Array<{
    id: number;
    invoiceNumber: string;
    total: number;
    status: InvoiceStatus;
  }>;
  payments?: Array<{
    id: number;
    amount: number;
    status: PaymentStatus;
    transactionDate: Date;
  }>;
  contractedAmount?: number;
  collectedAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Pagination
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
