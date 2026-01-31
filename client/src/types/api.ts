/**
 * Client-side API types
 * These types are used for API requests and responses in the client
 */

// Re-export common types from shared
export type {
  ApiResponse,
  PaginatedResponse,
  DashboardStats,
  JobStatus,
  AppointmentStatus,
  PaymentStatus,
  InvoiceStatus,
  JobFilters,
  AppointmentFilters,
  PaginationParams,
  ApiError,
} from 'shared';

// Transaction types
export interface Transaction {
  id: number;
  customerId: number;
  customerName?: string;
  customerEmail?: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  timestamp?: string;
}

export interface TransactionStats {
  total: number;
  success: number;
  pending: number;
  failed: number;
}

// Quote submission types
export interface QuoteSubmission {
  id: number;
  timestamp: string;
  firstName: string;
  lastName: string;
  mobilePhone: string;
  email: string;
  location: string;
  zipCode: string;
  serviceType: string;
  privacyTinted: string | null;
  year: string | null;
  make: string | null;
  model: string | null;
  vin: string | null;
  notes: string | null;
  selectedWindows: string[];
  selectedWheels?: string[];
  division?: 'glass' | 'wheels';
  uploadedFiles: Array<{ name: string; size: number; type: string }>;
  status: 'submitted' | 'processed' | 'quoted' | 'converted' | 'archived';
  processedAt: string | null;
}

export interface QuoteStats {
  total: number;
  submitted: number;
  processed: number;
  quoted: number;
  converted: number;
  last24Hours: number;
}

// Technician types
export interface Technician {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  specialty: string;
  status: 'available' | 'busy' | 'offline';
  rating?: number;
  completedJobs?: number;
  certifications?: string[];
  hireDate?: string;
}

export interface TechnicianStats {
  totalTechnicians: number;
  totalStates: number;
  totalAvailable: number;
  byState: Array<{
    state: string;
    total: number;
    available: number;
    busy: number;
    offline: number;
    cities: number;
  }>;
}

// Activity log types
export interface ActivityLog {
  id: number;
  type: string;
  message: string;
  details: Record<string, unknown>;
  timestamp: string;
}

// Customer types
export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  primaryEmail: string;
  primaryPhone: string;
  company?: string | null;
  status: 'active' | 'pending' | 'inactive';
  accountType?: string;
  totalSpent?: number;
  totalJobs?: number;
  vehicleYear?: string | null;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vin?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt?: string;
}

// Appointment types
export interface Appointment {
  id: number;
  customerId: number;
  jobId?: number;
  technicianId?: number;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: 'requested' | 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  location?: string;
  notes?: string;
  createdAt: string;
}

// Payment types
export interface Payment {
  id: number;
  transactionId: number;
  customerId?: number;
  customerName?: string;
  customerEmail?: string;
  amount: number;
  method: 'cash' | 'card' | 'check' | 'square' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference?: string;
  notes?: string;
  createdAt: string;
}

// Job types
export interface Job {
  id: number;
  jobNumber?: string;
  customerId: number;
  customerName?: string;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'invoiced';
  amount?: number;
  vehicleYear?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vin?: string;
  serviceType?: string;
  technicianId?: number;
  technicianName?: string;
  location?: string;
  scheduledDate?: string;
  completedDate?: string;
  createdAt: string;
}

export interface JobStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
}

// Unified contact type (for contacts directory)
export interface UnifiedContact {
  id: number;
  type: 'customer' | 'technician' | 'distributor';
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: 'active' | 'pending' | 'inactive';
  city?: string;
  state?: string;
  specialty?: string;
  accountType?: string;
  totalSpent?: number;
  totalJobs?: number;
  rating?: number;
}

// Message types
export interface Message {
  id: string;
  conversationId: string;
  sender: 'admin' | 'technician' | 'customer';
  senderName: string;
  senderId?: number;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  participantType: 'technician' | 'customer';
  participantId: number;
  participantName: string;
  participantPhone?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  messageCount?: number;
}

// API Request types
export interface CreatePaymentRequest {
  amount: number;
  transactionId?: number;
  customerId?: number;
  method?: 'cash' | 'card' | 'check' | 'square' | 'other';
  reference?: string;
  notes?: string;
}

export interface CreateAppointmentRequest {
  customerId: number;
  jobId?: number;
  technicianId?: number;
  scheduledDate: string;
  scheduledTime: string;
  duration?: number;
  location?: string;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  scheduledDate?: string;
  scheduledTime?: string;
  duration?: number;
  status?: Appointment['status'];
  technicianId?: number;
  location?: string;
  notes?: string;
}

export interface SendMessageRequest {
  content: string;
  technicianName?: string;
  technicianPhone?: string;
}

export interface CreateContactRequest {
  type: 'customer' | 'technician' | 'distributor';
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  city?: string;
  state?: string;
  specialty?: string;
}
