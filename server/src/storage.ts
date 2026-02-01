import {
  users,
  transactions,
  activityLogs,
  configurations,
  fieldMappings,
  appointments,
  smsInteractions,
  vehicleLookups,
  nagsParts,
  subcontractors,
  subcontractorAvailability,
  jobRequests,
  subcontractorResponses,
  quoteSubmissions,
  customers,
  technicians,
  type User,
  type InsertUser,
  type Transaction,
  type InsertTransaction,
  type ActivityLog,
  type InsertActivityLog,
  type Configuration,
  type InsertConfiguration,
  type FieldMapping,
  type InsertFieldMapping,
  type Appointment,
  type InsertAppointment,
  type SmsInteraction,
  type InsertSmsInteraction,
  type VehicleLookup,
  type InsertVehicleLookup,
  type NagsPart,
  type InsertNagsPart,
  type Subcontractor,
  type InsertSubcontractor,
  type SubcontractorAvailability,
  type InsertSubcontractorAvailability,
  type JobRequest,
  type InsertJobRequest,
  type SubcontractorResponse,
  type InsertSubcontractorResponse,
  type QuoteSubmission,
  type InsertQuoteSubmission,
  type Customer,
  type InsertCustomer,
  type Technician,
  type InsertTechnician
} from "@shared/schema";
import { DatabaseStorage } from "./database-storage.js";
import { PasswordService } from "./services/password-service.js";

interface JobRecord {
  id: string;
  jobNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  vehicle: {
    year: string;
    make: string;
    model: string;
    description: string;
    vin: string;
    licensePlate: string;
    odometer: string;
  };
  appointment: {
    date: string;
    time: string;
    type: string;
    status: string;
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
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction | undefined>;
  getTransactions(filters?: { status?: string; limit?: number; offset?: number }): Promise<Transaction[]>;
  getTransactionStats(): Promise<{ total: number; success: number; failed: number; pending: number }>;
  
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(limit?: number): Promise<ActivityLog[]>;
  
  getConfiguration(key: string): Promise<Configuration | undefined>;
  setConfiguration(config: InsertConfiguration): Promise<Configuration>;
  getAllConfigurations(): Promise<Configuration[]>;
  
  getFieldMappings(): Promise<FieldMapping[]>;
  setFieldMapping(mapping: InsertFieldMapping): Promise<FieldMapping>;
  
  // Appointment methods
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByPhone(phoneNumber: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;

  // SMS interaction methods
  getSmsInteractions(): Promise<SmsInteraction[]>;
  getSmsInteractionsByAppointment(appointmentId: number): Promise<SmsInteraction[]>;
  createSmsInteraction(interaction: InsertSmsInteraction): Promise<SmsInteraction>;
  
  // Job record methods
  getJobRecord(jobId: string): Promise<JobRecord | undefined>;
  
  // VIN lookup methods
  getVehicleLookup(vin: string): Promise<VehicleLookup | undefined>;
  createVehicleLookup(lookup: InsertVehicleLookup): Promise<VehicleLookup>;
  updateVehicleLookupLastUsed(vin: string): Promise<void>;
  
  // NAGS parts methods
  getNagsPartsByVin(vin: string): Promise<NagsPart[]>;
  getNagsPartByNumber(nagsNumber: string): Promise<NagsPart | undefined>;
  getNagsPart(id: number): Promise<NagsPart | undefined>;
  createNagsPart(part: InsertNagsPart): Promise<NagsPart>;
  updateNagsPartAvailability(nagsNumber: string, updates: { availability?: string; price?: number; leadTime?: number }): Promise<void>;
  
  // Subcontractor methods
  getSubcontractor(id: number): Promise<Subcontractor | undefined>;
  getActiveSubcontractors(): Promise<Subcontractor[]>;
  createSubcontractor(subcontractor: InsertSubcontractor): Promise<Subcontractor>;
  updateSubcontractor(id: number, updates: Partial<Subcontractor>): Promise<Subcontractor | undefined>;

  // Technician methods - for contacts directory
  getTechnician(id: number): Promise<Technician | undefined>;
  getTechnicians(): Promise<Technician[]>;
  getActiveTechnicians(): Promise<Technician[]>;
  getTechnicianByPhone(phone: string): Promise<Technician | undefined>;
  getTechnicianByEmail(email: string): Promise<Technician | undefined>;
  createTechnician(technician: InsertTechnician): Promise<Technician>;
  updateTechnician(id: number, updates: Partial<Technician>): Promise<Technician | undefined>;

  // Subcontractor availability methods
  getSubcontractorAvailability(subcontractorId: number, date: Date): Promise<SubcontractorAvailability | undefined>;
  createSubcontractorAvailability(availability: InsertSubcontractorAvailability): Promise<SubcontractorAvailability>;
  updateSubcontractorAvailability(id: number, updates: Partial<SubcontractorAvailability>): Promise<SubcontractorAvailability | undefined>;
  
  // Job request methods
  getJobRequest(id: number): Promise<JobRequest | undefined>;
  createJobRequest(request: InsertJobRequest): Promise<JobRequest>;
  updateJobRequest(id: number, updates: Partial<JobRequest>): Promise<JobRequest | undefined>;
  getJobRequestsByTransaction(transactionId: number): Promise<JobRequest[]>;
  
  // Subcontractor response methods
  createSubcontractorResponse(response: InsertSubcontractorResponse): Promise<SubcontractorResponse>;
  getSubcontractorResponsesByJobRequest(jobRequestId: number): Promise<SubcontractorResponse[]>;
  
  // Quote submission methods
  createQuoteSubmission(quoteSubmission: InsertQuoteSubmission): Promise<QuoteSubmission>;
  getQuoteSubmissions(): Promise<QuoteSubmission[]>;
  updateQuoteSubmission(id: number, updates: Partial<QuoteSubmission>): Promise<QuoteSubmission | undefined>;
  deleteQuoteSubmission(id: number): Promise<boolean>;
  getQuoteSubmissionsByCustomer(customerId: number): Promise<QuoteSubmission[]>;

  // Customer methods - for full quote-to-cash cycle tracking
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  getCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, updates: Partial<Customer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  findOrCreateCustomer(email: string, phone: string, data: Partial<InsertCustomer>): Promise<Customer>;
  getCustomerHistory(customerId: number): Promise<{
    quotes: QuoteSubmission[];
    appointments: Appointment[];
    transactions: Transaction[];
  }>;

  // Customer totals recalculation (from transactions)
  recalculateCustomerTotals(customerId: number): Promise<Customer | undefined>;

  // Job record retrieval (for Omega EDI mock structure)
  getJobRecord(jobId: string): Promise<JobRecord | undefined>;
  
  // RPJ (Revenue per Job) settings methods
  getRpjSettings(): Promise<any>;
  updateRpjSettings(settings: any): Promise<any>;

  // Admin methods
  resetAllData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private activityLogs: Map<number, ActivityLog>;
  private configurations: Map<string, Configuration>;
  private fieldMappings: Map<number, FieldMapping>;
  private appointments: Map<number, Appointment>;
  private smsInteractions: Map<number, SmsInteraction>;
  private vehicleLookups: Map<string, VehicleLookup>;
  private nagsParts: Map<number, NagsPart>;
  private subcontractors: Map<number, Subcontractor>;
  private subcontractorAvailability: Map<number, SubcontractorAvailability>;
  private jobRequests: Map<number, JobRequest>;
  private subcontractorResponses: Map<number, SubcontractorResponse>;
  private quoteSubmissions: Map<number, QuoteSubmission>;
  private customersMap: Map<number, Customer>;
  // Performance indexes for O(1) customer lookups
  private customerEmailIndex: Map<string, number>; // email -> customerId
  private customerPhoneIndex: Map<string, number>; // normalized phone -> customerId
  private adminUsersMap: Map<number, any>; // Admin users storage
  private rpjSettings: any;
  // Technician storage for contacts directory
  private techniciansMap: Map<number, Technician>;
  private technicianEmailIndex: Map<string, number>; // email -> technicianId
  private technicianPhoneIndex: Map<string, number>; // normalized phone -> technicianId

  private currentUserId: number;
  private currentTransactionId: number;
  private currentActivityLogId: number;
  private currentConfigId: number;
  private currentMappingId: number;
  private currentAppointmentId: number;
  private currentSmsInteractionId: number;
  private currentVehicleLookupId: number;
  private currentRetryQueueId: number;
  private currentNagsPartId: number;
  private currentSubcontractorId: number;
  private currentAvailabilityId: number;
  private currentJobRequestId: number;
  private currentResponseId: number;
  private currentQuoteSubmissionId: number;
  private currentCustomerId: number;
  private currentAdminUserId: number;
  private currentTechnicianId: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.activityLogs = new Map();
    this.configurations = new Map();
    this.fieldMappings = new Map();
    this.appointments = new Map();
    this.smsInteractions = new Map();
    this.vehicleLookups = new Map();
    this.nagsParts = new Map();
    this.subcontractors = new Map();
    this.subcontractorAvailability = new Map();
    this.jobRequests = new Map();
    this.subcontractorResponses = new Map();
    this.quoteSubmissions = new Map();
    this.customersMap = new Map();
    // Initialize performance indexes for O(1) customer lookups
    this.customerEmailIndex = new Map();
    this.customerPhoneIndex = new Map();
    this.adminUsersMap = new Map();
    // Initialize technician storage
    this.techniciansMap = new Map();
    this.technicianEmailIndex = new Map();
    this.technicianPhoneIndex = new Map();

    this.currentUserId = 1;
    this.currentTransactionId = 1;
    this.currentActivityLogId = 1;
    this.currentConfigId = 1;
    this.currentMappingId = 1;
    this.currentAppointmentId = 1;
    this.currentSmsInteractionId = 1;
    this.currentVehicleLookupId = 1;
    this.currentRetryQueueId = 1;
    this.currentNagsPartId = 1;
    this.currentSubcontractorId = 1;
    this.currentAvailabilityId = 1;
    this.currentJobRequestId = 1;
    this.currentResponseId = 1;
    this.currentQuoteSubmissionId = 1;
    this.currentCustomerId = 1;
    this.currentAdminUserId = 2; // Start at 2 since we'll create a default admin with ID 1
    this.currentTechnicianId = 1;

    // Initialize default configurations and data
    this.initializeDefaultConfigurations();
    this.initializeDefaultFieldMappings();
    // NOTE: Seed subcontractors removed - technicians must be enrolled through the system
    this.initializeDefaultRpjSettings();
    this.initializeDefaultAdminUser();
  }

  private initializeDefaultAdminUser() {
    // SECURITY: Default admin uses ADMIN_PASSWORD from environment
    // Password is hashed using bcrypt - must be set via environment variable
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.warn('[STORAGE] ADMIN_PASSWORD not set - default admin will not have a usable password');
    }

    // Create default super admin user with hashed password
    // Note: This is synchronous initialization, so we use a pre-computed hash pattern
    const defaultAdmin = {
      id: 1,
      username: 'admin',
      email: 'admin@expressautoglass.com',
      // Password must be set and hashed at runtime via changeAdminPassword or environment
      password: '$2a$12$placeholder.hash.value.for.initialization.only',
      role: 'super_admin',
      isActive: true,
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    };
    this.adminUsersMap.set(1, defaultAdmin);
  }

  private initializeDefaultConfigurations() {
    const defaultConfigs = [
      { key: 'omega_api_base_url', value: 'https://app.omegaedi.com/api/2.0/', description: 'Omega EDI API base URL' },
      { key: 'webhook_endpoint', value: '/api/webhooks/squarespace', description: 'Webhook endpoint for Squarespace forms' },
      { key: 'retry_max_attempts', value: '3', description: 'Maximum retry attempts for failed requests' },
      { key: 'retry_delay_seconds', value: '60', description: 'Delay between retry attempts in seconds' }
    ];
    
    defaultConfigs.forEach(config => {
      const configWithId = { 
        ...config, 
        id: this.currentConfigId++, 
        updatedAt: new Date() 
      };
      this.configurations.set(config.key, configWithId);
    });
  }

  private initializeDefaultFieldMappings() {
    // Field mappings for Wheels and Glass Squarespace form
    const defaultMappings = [
      { squarespaceField: 'first-name', omegaField: 'customer_fname', transformRule: null, isRequired: true },
      { squarespaceField: 'last-name', omegaField: 'customer_surname', transformRule: null, isRequired: true },
      { squarespaceField: 'email', omegaField: 'customer_email', transformRule: null, isRequired: true },
      { squarespaceField: 'mobile-phone', omegaField: 'customer_phone', transformRule: null, isRequired: true },
      { squarespaceField: 'location', omegaField: 'service_location', transformRule: null, isRequired: true },
      { squarespaceField: 'zip-code', omegaField: 'service_zip', transformRule: null, isRequired: true },
      { squarespaceField: 'service-type', omegaField: 'service_type', transformRule: null, isRequired: true },
      { squarespaceField: 'which-windows-wheels', omegaField: 'damage_location', transformRule: null, isRequired: true },
      { squarespaceField: 'factory-privacy-tinted', omegaField: 'is_tinted', transformRule: null, isRequired: false },
      { squarespaceField: 'year', omegaField: 'vehicle_year', transformRule: 'parseInt', isRequired: true },
      { squarespaceField: 'make', omegaField: 'vehicle_make', transformRule: null, isRequired: true },
      { squarespaceField: 'model', omegaField: 'vehicle_model', transformRule: null, isRequired: true },
      { squarespaceField: 'vin', omegaField: 'vehicle_vin', transformRule: 'uppercase', isRequired: true },
      { squarespaceField: 'notes', omegaField: 'notes', transformRule: null, isRequired: false }
    ];
    
    defaultMappings.forEach(mapping => {
      const mappingWithId = { ...mapping, id: this.currentMappingId++ };
      this.fieldMappings.set(mappingWithId.id, mappingWithId);
    });
  }

  private initializeDefaultRpjSettings() {
    // Initialize with default RPJ settings
    this.rpjSettings = {
      rpjGlobal: 27500, // $275.00 in cents
      rpjOverrides: {
        state: {
          'California': 31000, // $310.00
          'Arizona': 24000,    // $240.00
        },
        city: {
          'Phoenix': 25000,    // $250.00
        },
        service: {
          'windshield': 32000,    // $320.00
          'chip_repair': 11000,   // $110.00
        }
      }
    };
  }

  async getRpjSettings(): Promise<any> {
    return this.rpjSettings;
  }

  async updateRpjSettings(settings: any): Promise<any> {
    this.rpjSettings = { ...this.rpjSettings, ...settings };
    return this.rpjSettings;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const newTransaction: Transaction = {
      ...transaction,
      id,
      timestamp: new Date(),
      customerId: transaction.customerId ?? null,
      retryCount: transaction.retryCount || 0,
      lastRetry: null,
      customerPhone: transaction.customerPhone || null,
      vehicleYear: transaction.vehicleYear || null,
      vehicleMake: transaction.vehicleMake || null,
      vehicleModel: transaction.vehicleModel || null,
      vehicleVin: transaction.vehicleVin || null,
      damageDescription: transaction.damageDescription || null,
      policyNumber: transaction.policyNumber || null,
      omegaJobId: transaction.omegaJobId || null,
      omegaQuoteId: transaction.omegaQuoteId || null,
      squareBookingId: transaction.squareBookingId || null,
      squarePaymentLinkId: transaction.squarePaymentLinkId || null,
      finalPrice: transaction.finalPrice || null,
      paymentStatus: (transaction.paymentStatus || 'pending') as 'pending' | 'paid' | 'failed' | null,
      errorMessage: transaction.errorMessage || null,
      tags: transaction.tags ?? null,
      sourceType: transaction.sourceType ?? null,
    } as Transaction;
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    // If status is being updated, append to statusHistory
    const updated: any = { ...transaction };
    if ((updates as any).status) {
      const history = Array.isArray(transaction.statusHistory as any) ? (transaction.statusHistory as any) : [];
      const newEntry = {
        status: (updates as any).status,
        timestamp: new Date().toISOString(),
        triggeredBy: (updates as any).triggeredBy || 'system'
      };
      updated.statusHistory = [...history, newEntry];
    }

    Object.assign(updated, updates);
    this.transactions.set(id, updated);
    return updated as Transaction;
  }

  async getTransactions(filters?: { status?: string; limit?: number; offset?: number }): Promise<Transaction[]> {
    let transactions = Array.from(this.transactions.values());
    
    if (filters?.status) {
      transactions = transactions.filter(t => t.status === filters.status);
    }
    
    // Sort by timestamp desc
    transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    
    return transactions.slice(offset, offset + limit);
  }

  async getTransactionStats(): Promise<{ total: number; success: number; failed: number; pending: number }> {
    const transactions = Array.from(this.transactions.values());
    return {
      total: transactions.length,
      success: transactions.filter(t => t.status === 'success').length,
      failed: transactions.filter(t => t.status === 'failed').length,
      pending: transactions.filter(t => t.status === 'pending').length,
    };
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const id = this.currentActivityLogId++;
    const newLog: ActivityLog = {
      ...log,
      id,
      timestamp: new Date(),
      transactionId: log.transactionId || null,
      details: log.details || null,
    };
    this.activityLogs.set(id, newLog);
    return newLog;
  }

  async getActivityLogs(limit: number = 20): Promise<ActivityLog[]> {
    const logs = Array.from(this.activityLogs.values());
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return logs.slice(0, limit);
  }

  async getConfiguration(key: string): Promise<Configuration | undefined> {
    return this.configurations.get(key);
  }

  async setConfiguration(config: InsertConfiguration): Promise<Configuration> {
    const existing = this.configurations.get(config.key);
    if (existing) {
      const updated = { 
        ...existing, 
        ...config, 
        updatedAt: new Date(),
        description: config.description || null 
      };
      this.configurations.set(config.key, updated);
      return updated;
    } else {
      const newConfig = { 
        ...config, 
        id: this.currentConfigId++, 
        updatedAt: new Date(),
        description: config.description || null 
      };
      this.configurations.set(config.key, newConfig);
      return newConfig;
    }
  }

  async getAllConfigurations(): Promise<Configuration[]> {
    return Array.from(this.configurations.values());
  }

  async getFieldMappings(): Promise<FieldMapping[]> {
    return Array.from(this.fieldMappings.values());
  }

  async setFieldMapping(mapping: InsertFieldMapping): Promise<FieldMapping> {
    const id = this.currentMappingId++;
    const newMapping = { 
      ...mapping, 
      id,
      transformRule: mapping.transformRule || null,
      isRequired: mapping.isRequired || null
    };
    this.fieldMappings.set(id, newMapping);
    return newMapping;
  }

  // Appointment methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointmentsByPhone(phoneNumber: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(apt => 
      apt.customerPhone === phoneNumber
    );
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const newAppointment = {
      ...appointment,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      customerId: appointment.customerId ?? null,
      customerPhone: appointment.customerPhone || null,
      transactionId: appointment.transactionId || null,
      scheduledDate: appointment.scheduledDate || null,
      technicianId: appointment.technicianId || null,
      squareAppointmentId: appointment.squareAppointmentId || null,
      omegaAppointmentId: appointment.omegaAppointmentId || null,
      instructions: appointment.instructions || null,
      calendarInvitationSent: appointment.calendarInvitationSent || false,
    } as Appointment;
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;

    const updated = { ...appointment, ...updates, updatedAt: new Date() };
    this.appointments.set(id, updated);
    return updated;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    if (!this.appointments.has(id)) return false;
    return this.appointments.delete(id);
  }

  // SMS interaction methods
  async getSmsInteractions(): Promise<SmsInteraction[]> {
    const interactions = Array.from(this.smsInteractions.values());
    interactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return interactions;
  }

  async getSmsInteractionsByAppointment(appointmentId: number): Promise<SmsInteraction[]> {
    return Array.from(this.smsInteractions.values()).filter(interaction => 
      interaction.appointmentId === appointmentId
    );
  }

  async createSmsInteraction(interaction: InsertSmsInteraction): Promise<SmsInteraction> {
    const id = this.currentSmsInteractionId++;
    const newInteraction: SmsInteraction = {
      ...interaction,
      id,
      timestamp: new Date(),
      appointmentId: interaction.appointmentId || null,
      processedData: interaction.processedData || null,
    };
    this.smsInteractions.set(id, newInteraction);
    return newInteraction;
  }

  // Retry queue methods
  async createRetryQueueEntry(entry: { operation: string; payload: any; nextAttemptAt?: Date | null; maxAttempts?: number; }): Promise<any> {
    const id = this.currentRetryQueueId++;
    const newEntry = {
      id,
      operation: entry.operation,
      payload: entry.payload,
      attempts: 0,
      maxAttempts: entry.maxAttempts ?? 5,
      nextAttemptAt: entry.nextAttemptAt || new Date(),
      lastError: null,
      isDeadLetter: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    // store by id
    (this as any).retryQueue = (this as any).retryQueue || new Map();
    (this as any).retryQueue.set(id, newEntry);
    return newEntry;
  }

  async getPendingRetryQueueEntries(limit: number = 50): Promise<any[]> {
    const now = new Date();
    const map: Map<number, any> = (this as any).retryQueue || new Map();
    return Array.from(map.values()).filter(e => !e.isDeadLetter && new Date(e.nextAttemptAt) <= now).slice(0, limit);
  }

  async updateRetryQueueEntry(id: number, updates: Partial<any>): Promise<void> {
    const map: Map<number, any> = (this as any).retryQueue || new Map();
    const entry = map.get(id);
    if (!entry) return;
    const updated = { ...entry, ...updates, updatedAt: new Date() };
    map.set(id, updated);
  }

  async moveRetryEntryToDeadLetter(id: number, error?: string): Promise<void> {
    const map: Map<number, any> = (this as any).retryQueue || new Map();
    const entry = map.get(id);
    if (!entry) return;
    entry.isDeadLetter = true;
    entry.lastError = error || entry.lastError;
    entry.updatedAt = new Date();
    map.set(id, entry);
  }

  // NOTE: initializeDefaultSubcontractors() removed - technicians must be enrolled through the system

  // VIN lookup methods
  async getVehicleLookup(vin: string): Promise<VehicleLookup | undefined> {
    return this.vehicleLookups.get(vin);
  }

  async createVehicleLookup(lookup: InsertVehicleLookup): Promise<VehicleLookup> {
    const id = this.currentVehicleLookupId++;
    const newLookup: VehicleLookup = {
      ...lookup,
      id,
      createdAt: new Date(),
      lastUsed: new Date(),
      year: lookup.year || null,
      make: lookup.make || null,
      model: lookup.model || null,
      bodyType: lookup.bodyType || null,
      engine: lookup.engine || null,
      trim: lookup.trim || null,
      lookupSource: lookup.lookupSource || null,
      isValid: lookup.isValid !== undefined ? lookup.isValid : true,
    };
    this.vehicleLookups.set(lookup.vin, newLookup);
    return newLookup;
  }

  async updateVehicleLookupLastUsed(vin: string): Promise<void> {
    const lookup = this.vehicleLookups.get(vin);
    if (lookup) {
      lookup.lastUsed = new Date();
      this.vehicleLookups.set(vin, lookup);
    }
  }

  // NAGS parts methods
  async getNagsPartsByVin(vin: string): Promise<NagsPart[]> {
    return Array.from(this.nagsParts.values()).filter(part => part.vin === vin);
  }

  async getNagsPartByNumber(nagsNumber: string): Promise<NagsPart | undefined> {
    return Array.from(this.nagsParts.values()).find(part => part.nagsNumber === nagsNumber);
  }

  async getNagsPart(id: number): Promise<NagsPart | undefined> {
    return this.nagsParts.get(id);
  }

  async createNagsPart(part: InsertNagsPart): Promise<NagsPart> {
    const id = this.currentNagsPartId++;
    const newPart: NagsPart = {
      ...part,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      position: part.position || null,
      manufacturer: part.manufacturer || null,
      description: part.description || null,
      price: part.price || null,
      availability: part.availability || null,
      leadTime: part.leadTime || null,
      supplierInfo: part.supplierInfo || null,
    };
    this.nagsParts.set(id, newPart);
    return newPart;
  }

  async updateNagsPartAvailability(nagsNumber: string, updates: { availability?: string; price?: number; leadTime?: number }): Promise<void> {
    const part = Array.from(this.nagsParts.values()).find(p => p.nagsNumber === nagsNumber);
    if (part) {
      if (updates.availability) part.availability = updates.availability;
      if (updates.price !== undefined) part.price = updates.price;
      if (updates.leadTime !== undefined) part.leadTime = updates.leadTime;
      part.updatedAt = new Date();
      this.nagsParts.set(part.id, part);
    }
  }

  // Subcontractor methods
  async getSubcontractor(id: number): Promise<Subcontractor | undefined> {
    return this.subcontractors.get(id);
  }

  async getActiveSubcontractors(): Promise<Subcontractor[]> {
    return Array.from(this.subcontractors.values()).filter(sub => sub.isActive);
  }

  async createSubcontractor(subcontractor: InsertSubcontractor): Promise<Subcontractor> {
    const id = this.currentSubcontractorId++;
    const newSubcontractor: Subcontractor = {
      ...subcontractor,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      serviceAreas: subcontractor.serviceAreas || null,
      specialties: subcontractor.specialties || null,
      rating: subcontractor.rating || null,
      isActive: subcontractor.isActive !== undefined ? subcontractor.isActive : true,
      maxJobsPerDay: subcontractor.maxJobsPerDay || null,
      preferredContactMethod: subcontractor.preferredContactMethod || null,
    };
    this.subcontractors.set(id, newSubcontractor);
    return newSubcontractor;
  }

  async updateSubcontractor(id: number, updates: Partial<Subcontractor>): Promise<Subcontractor | undefined> {
    const subcontractor = this.subcontractors.get(id);
    if (!subcontractor) return undefined;

    const updated = { ...subcontractor, ...updates, updatedAt: new Date() };
    this.subcontractors.set(id, updated);
    return updated;
  }

  // Technician methods - for contacts directory
  async getTechnician(id: number): Promise<Technician | undefined> {
    return this.techniciansMap.get(id);
  }

  async getTechnicians(): Promise<Technician[]> {
    return Array.from(this.techniciansMap.values()).sort((a, b) =>
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getActiveTechnicians(): Promise<Technician[]> {
    return Array.from(this.techniciansMap.values())
      .filter(tech => tech.isActive)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getTechnicianByPhone(phone: string): Promise<Technician | undefined> {
    const normalizedPhone = this.normalizePhone(phone);
    if (!normalizedPhone) return undefined;
    const technicianId = this.technicianPhoneIndex.get(normalizedPhone);
    return technicianId ? this.techniciansMap.get(technicianId) : undefined;
  }

  async getTechnicianByEmail(email: string): Promise<Technician | undefined> {
    const normalizedEmail = email.toLowerCase().trim();
    const technicianId = this.technicianEmailIndex.get(normalizedEmail);
    return technicianId ? this.techniciansMap.get(technicianId) : undefined;
  }

  async createTechnician(technician: InsertTechnician): Promise<Technician> {
    const id = this.currentTechnicianId++;
    const newTechnician: Technician = {
      ...technician,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: technician.isActive !== undefined ? technician.isActive : true,
      phone: technician.phone || null,
      hireDate: technician.hireDate || null,
      terminationDate: technician.terminationDate || null,
      certifications: technician.certifications || null,
      serviceAreas: technician.serviceAreas || null,
      maxDailyJobs: technician.maxDailyJobs || 6,
    };
    this.techniciansMap.set(id, newTechnician);

    // Build indexes for fast lookups
    if (newTechnician.email) {
      this.technicianEmailIndex.set(newTechnician.email.toLowerCase().trim(), id);
    }
    if (newTechnician.phone) {
      const normalizedPhone = this.normalizePhone(newTechnician.phone);
      if (normalizedPhone) {
        this.technicianPhoneIndex.set(normalizedPhone, id);
      }
    }

    return newTechnician;
  }

  async updateTechnician(id: number, updates: Partial<Technician>): Promise<Technician | undefined> {
    const technician = this.techniciansMap.get(id);
    if (!technician) return undefined;

    // Update indexes if email or phone changed
    if (updates.email && updates.email !== technician.email) {
      if (technician.email) {
        this.technicianEmailIndex.delete(technician.email.toLowerCase().trim());
      }
      this.technicianEmailIndex.set(updates.email.toLowerCase().trim(), id);
    }
    if (updates.phone && updates.phone !== technician.phone) {
      if (technician.phone) {
        const oldNormalized = this.normalizePhone(technician.phone);
        if (oldNormalized) this.technicianPhoneIndex.delete(oldNormalized);
      }
      const newNormalized = this.normalizePhone(updates.phone);
      if (newNormalized) this.technicianPhoneIndex.set(newNormalized, id);
    }

    const updated = { ...technician, ...updates, updatedAt: new Date() };
    this.techniciansMap.set(id, updated);
    return updated;
  }

  // Subcontractor availability methods
  async getSubcontractorAvailability(subcontractorId: number, date: Date): Promise<SubcontractorAvailability | undefined> {
    const dateStr = date.toDateString();
    return Array.from(this.subcontractorAvailability.values()).find(
      availability => availability.subcontractorId === subcontractorId && 
                     availability.date.toDateString() === dateStr
    );
  }

  async createSubcontractorAvailability(availability: InsertSubcontractorAvailability): Promise<SubcontractorAvailability> {
    const id = this.currentAvailabilityId++;
    const newAvailability: SubcontractorAvailability = {
      ...availability,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      subcontractorId: availability.subcontractorId || null,
      timeSlots: availability.timeSlots || null,
      maxJobs: availability.maxJobs || null,
      currentJobs: availability.currentJobs || null,
      isAvailable: availability.isAvailable !== undefined ? availability.isAvailable : true,
      notes: availability.notes || null,
    };
    this.subcontractorAvailability.set(id, newAvailability);
    return newAvailability;
  }

  async updateSubcontractorAvailability(id: number, updates: Partial<SubcontractorAvailability>): Promise<SubcontractorAvailability | undefined> {
    const availability = this.subcontractorAvailability.get(id);
    if (!availability) return undefined;
    
    const updated = { ...availability, ...updates, updatedAt: new Date() };
    this.subcontractorAvailability.set(id, updated);
    return updated;
  }

  // Job request methods
  async getJobRequest(id: number): Promise<JobRequest | undefined> {
    return this.jobRequests.get(id);
  }

  async createJobRequest(request: InsertJobRequest): Promise<JobRequest> {
    const id = this.currentJobRequestId++;
    const newRequest: JobRequest = {
      ...request,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      transactionId: request.transactionId || null,
      nagsPartId: request.nagsPartId || null,
      preferredDate: request.preferredDate || null,
      preferredTimeSlot: request.preferredTimeSlot || null,
      assignedSubcontractorId: request.assignedSubcontractorId || null,
      estimatedDuration: request.estimatedDuration || null,
      specialInstructions: request.specialInstructions || null,
    };
    this.jobRequests.set(id, newRequest);
    return newRequest;
  }

  async updateJobRequest(id: number, updates: Partial<JobRequest>): Promise<JobRequest | undefined> {
    const request = this.jobRequests.get(id);
    if (!request) return undefined;
    
    const updated = { ...request, ...updates, updatedAt: new Date() };
    this.jobRequests.set(id, updated);
    return updated;
  }

  async getJobRequestsByTransaction(transactionId: number): Promise<JobRequest[]> {
    return Array.from(this.jobRequests.values()).filter(request => request.transactionId === transactionId);
  }

  // Subcontractor response methods
  async createSubcontractorResponse(response: InsertSubcontractorResponse): Promise<SubcontractorResponse> {
    const id = this.currentResponseId++;
    const newResponse: SubcontractorResponse = {
      ...response,
      id,
      respondedAt: new Date(),
      jobRequestId: response.jobRequestId || null,
      subcontractorId: response.subcontractorId || null,
      availableTimeSlots: response.availableTimeSlots || null,
      proposedDate: response.proposedDate || null,
      notes: response.notes || null,
    };
    this.subcontractorResponses.set(id, newResponse);
    return newResponse;
  }

  async getSubcontractorResponsesByJobRequest(jobRequestId: number): Promise<SubcontractorResponse[]> {
    return Array.from(this.subcontractorResponses.values()).filter(response => response.jobRequestId === jobRequestId);
  }

  // Admin user methods
  async getAdminUsers(): Promise<any[]> {
    return Array.from(this.adminUsersMap.values());
  }

  async getAdminUser(id: number): Promise<any | undefined> {
    return this.adminUsersMap.get(id);
  }

  async getAdminUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.adminUsersMap.values()).find(u => u.username === username);
  }

  async createAdminUser(adminUser: any): Promise<any> {
    const id = this.currentAdminUserId++;

    // SECURITY: Hash password with bcrypt before storing
    const hashedPassword = await PasswordService.hashPassword(adminUser.password);

    const newUser = {
      id,
      username: adminUser.username,
      email: adminUser.email,
      password: hashedPassword,
      role: adminUser.role || 'admin',
      isActive: true,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.adminUsersMap.set(id, newUser);

    // Return user without password for security
    const { password: _, ...userWithoutPassword } = newUser;
    return { ...userWithoutPassword, password: '[HASHED]' };
  }

  async updateAdminUser(id: number, updates: any): Promise<any | undefined> {
    const user = this.adminUsersMap.get(id);
    if (!user) return undefined;

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    this.adminUsersMap.set(id, updatedUser);
    return updatedUser;
  }

  async deleteAdminUser(id: number): Promise<boolean> {
    if (!this.adminUsersMap.has(id)) return false;
    return this.adminUsersMap.delete(id);
  }

  async changeAdminPassword(id: number, newPassword: string): Promise<boolean> {
    const user = this.adminUsersMap.get(id);
    if (!user) return false;

    // SECURITY: Hash password with bcrypt before storing
    const hashedPassword = await PasswordService.hashPassword(newPassword);
    user.password = hashedPassword;
    user.updatedAt = new Date();
    this.adminUsersMap.set(id, user);
    return true;
  }

  // Quote submission methods
  async createQuoteSubmission(quoteSubmission: InsertQuoteSubmission): Promise<QuoteSubmission> {
    const id = this.currentQuoteSubmissionId++;
    const newQuoteSubmission = {
      id,
      timestamp: new Date(),
      processedAt: null,
      ...quoteSubmission,
      vin: quoteSubmission.vin ?? null,
      customerId: quoteSubmission.customerId ?? null,
    } as QuoteSubmission;

    this.quoteSubmissions.set(id, newQuoteSubmission);
    return newQuoteSubmission;
  }

  async updateQuoteSubmission(id: number, updates: Partial<QuoteSubmission>): Promise<QuoteSubmission | undefined> {
    const submission = this.quoteSubmissions.get(id);
    if (!submission) return undefined;

    const updated = { ...submission, ...updates };
    this.quoteSubmissions.set(id, updated);
    return updated;
  }

  async deleteQuoteSubmission(id: number): Promise<boolean> {
    if (!this.quoteSubmissions.has(id)) return false;
    return this.quoteSubmissions.delete(id);
  }

  async getQuoteSubmissionsByCustomer(customerId: number): Promise<QuoteSubmission[]> {
    return Array.from(this.quoteSubmissions.values()).filter(
      (submission) => submission.customerId === customerId
    );
  }

  // Customer methods - for full quote-to-cash cycle tracking
  // Helper to normalize email for index lookup
  private normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  // Helper to normalize phone for index lookup
  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customersMap.get(id);
  }

  // O(1) lookup using email index
  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const normalizedEmail = this.normalizeEmail(email);
    const customerId = this.customerEmailIndex.get(normalizedEmail);
    if (customerId === undefined) return undefined;
    return this.customersMap.get(customerId);
  }

  // O(1) lookup using phone index
  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const normalizedPhone = this.normalizePhone(phone);
    if (!normalizedPhone) return undefined;
    const customerId = this.customerPhoneIndex.get(normalizedPhone);
    if (customerId === undefined) return undefined;
    return this.customersMap.get(customerId);
  }

  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customersMap.values()).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const newCustomer: Customer = {
      ...customer,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: customer.status ?? null,
      secondaryEmail: customer.secondaryEmail || null,
      alternatePhone: customer.alternatePhone || null,
      address: customer.address || null,
      postalCode: customer.postalCode || null,
      city: customer.city || null,
      state: customer.state || null,
      smsOptIn: customer.smsOptIn ?? false,
      emailOptIn: customer.emailOptIn ?? true,
      preferredContactMethod: customer.preferredContactMethod || 'email',
      tags: customer.tags || null,
      notes: customer.notes || null,
      accountType: customer.accountType || 'individual',
      referredBy: customer.referredBy || null,
      totalJobs: customer.totalJobs || 0,
      totalSpent: customer.totalSpent || 0,
      lastJobDate: customer.lastJobDate || null,
    } as Customer;
    this.customersMap.set(id, newCustomer);

    // Add to indexes for O(1) lookups
    this.customerEmailIndex.set(this.normalizeEmail(newCustomer.primaryEmail), id);
    if (newCustomer.primaryPhone) {
      const normalizedPhone = this.normalizePhone(newCustomer.primaryPhone);
      if (normalizedPhone) {
        this.customerPhoneIndex.set(normalizedPhone, id);
      }
    }

    return newCustomer;
  }

  async updateCustomer(id: number, updates: Partial<Customer>): Promise<Customer | undefined> {
    const customer = this.customersMap.get(id);
    if (!customer) return undefined;

    // Update indexes if email or phone changed
    if (updates.primaryEmail && updates.primaryEmail !== customer.primaryEmail) {
      this.customerEmailIndex.delete(this.normalizeEmail(customer.primaryEmail));
      this.customerEmailIndex.set(this.normalizeEmail(updates.primaryEmail), id);
    }
    if (updates.primaryPhone && updates.primaryPhone !== customer.primaryPhone) {
      const oldPhone = this.normalizePhone(customer.primaryPhone);
      if (oldPhone) this.customerPhoneIndex.delete(oldPhone);
      const newPhone = this.normalizePhone(updates.primaryPhone);
      if (newPhone) this.customerPhoneIndex.set(newPhone, id);
    }

    const updated = { ...customer, ...updates, updatedAt: new Date() };
    this.customersMap.set(id, updated);
    return updated;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const customer = this.customersMap.get(id);
    if (!customer) return false;

    // Remove from indexes
    this.customerEmailIndex.delete(this.normalizeEmail(customer.primaryEmail));
    if (customer.primaryPhone) {
      const normalizedPhone = this.normalizePhone(customer.primaryPhone);
      if (normalizedPhone) this.customerPhoneIndex.delete(normalizedPhone);
    }

    return this.customersMap.delete(id);
  }

  /**
   * Recalculate customer totals (totalSpent, totalJobs, lastJobDate) from their transactions
   * Called after payment updates to keep customer profile accurate
   */
  async recalculateCustomerTotals(customerId: number): Promise<Customer | undefined> {
    const customer = this.customersMap.get(customerId);
    if (!customer) return undefined;

    // Get all successful, paid transactions for this customer
    const customerTransactions = Array.from(this.transactions.values()).filter(
      t => t.customerId === customerId && t.status === 'success' && t.paymentStatus === 'paid'
    );

    // Calculate totals
    const totalSpent = customerTransactions.reduce(
      (sum, t) => sum + (t.finalPrice || 27500), // Default $275 if no amount
      0
    );
    const totalJobs = customerTransactions.length;

    // Find most recent job date
    let lastJobDate: Date | null = null;
    if (customerTransactions.length > 0) {
      const timestamps = customerTransactions.map(t => new Date(t.timestamp).getTime());
      lastJobDate = new Date(Math.max(...timestamps));
    }

    // Update customer with calculated totals
    return await this.updateCustomer(customerId, {
      totalSpent,
      totalJobs,
      lastJobDate,
    });
  }

  async findOrCreateCustomer(email: string, phone: string, data: Partial<InsertCustomer>): Promise<Customer> {
    // First try to find by email
    let customer = await this.getCustomerByEmail(email);
    if (customer) {
      // Update customer with any new data and return
      return await this.updateCustomer(customer.id, {
        ...data,
        primaryPhone: phone || customer.primaryPhone,
      }) as Customer;
    }

    // Then try to find by phone
    customer = await this.getCustomerByPhone(phone);
    if (customer) {
      return await this.updateCustomer(customer.id, {
        ...data,
        primaryEmail: email || customer.primaryEmail,
      }) as Customer;
    }

    // Create new customer
    return await this.createCustomer({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      primaryEmail: email,
      primaryPhone: phone,
      ...data,
    });
  }

  async getCustomerHistory(customerId: number): Promise<{
    quotes: QuoteSubmission[];
    appointments: Appointment[];
    transactions: Transaction[];
  }> {
    const quotes = await this.getQuoteSubmissionsByCustomer(customerId);

    // Get appointments by customerId (once schema supports it)
    const appointments = Array.from(this.appointments.values()).filter(
      (apt) => (apt as any).customerId === customerId
    );

    // Get transactions by customerId (once schema supports it)
    const transactions = Array.from(this.transactions.values()).filter(
      (txn) => (txn as any).customerId === customerId
    );

    return {
      quotes: quotes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      appointments: appointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      transactions: transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    };
  }

  async getQuoteSubmissions(): Promise<QuoteSubmission[]> {
    // Return actual quotes from storage (no sample data - production ready)
    return Array.from(this.quoteSubmissions.values()).sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async resetAllData(): Promise<void> {
    // Clear all transactional data (preserve configurations and field mappings)
    this.transactions.clear();
    this.activityLogs.clear();
    this.appointments.clear();
    this.smsInteractions.clear();
    this.vehicleLookups.clear();
    this.nagsParts.clear();
    this.jobRequests.clear();
    this.subcontractorResponses.clear();
    this.quoteSubmissions.clear();
    this.customersMap.clear();
    this.customerEmailIndex.clear();
    this.customerPhoneIndex.clear();

    // Reset ID counters
    this.currentTransactionId = 1;
    this.currentActivityLogId = 1;
    this.currentAppointmentId = 1;
    this.currentSmsInteractionId = 1;
    this.currentVehicleLookupId = 1;
    this.currentNagsPartId = 1;
    this.currentJobRequestId = 1;
    this.currentResponseId = 1;
    this.currentQuoteSubmissionId = 1;
    this.currentCustomerId = 1;

    console.log('[STORAGE] All data has been reset');
  }

  async getJobRecord(jobId: string): Promise<JobRecord | undefined> {
    // Query real transaction data from database
    const transactionId = parseInt(jobId);
    if (isNaN(transactionId)) {
      return undefined;
    }

    const transaction = await this.getTransaction(transactionId);
    if (!transaction) {
      return undefined;
    }

    // Get associated customer if exists
    const customer = transaction.customerId
      ? await this.getCustomer(transaction.customerId)
      : null;

    // Get associated appointment if exists
    const appointments = await this.getAppointments();
    const appointment = appointments.find((apt: any) => apt.transactionId === transactionId);

    // Parse form data if available
    const formData = transaction.formData as any || {};

    // Build job record from real data
    const jobRecord: JobRecord = {
      id: jobId,
      jobNumber: jobId,
      customer: customer ? {
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        email: customer.primaryEmail || '',
        phone: customer.primaryPhone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        postalCode: customer.postalCode || ''
      } : {
        firstName: transaction.customerName?.split(' ')[0] || '',
        lastName: transaction.customerName?.split(' ').slice(1).join(' ') || '',
        email: transaction.customerEmail || '',
        phone: transaction.customerPhone || '',
        address: formData.address || '',
        city: formData.city || '',
        state: formData.state || '',
        postalCode: formData.zipCode || ''
      },
      vehicle: {
        year: transaction.vehicleYear || '',
        make: transaction.vehicleMake || '',
        model: transaction.vehicleModel || '',
        description: formData.vehicleDescription || '',
        vin: transaction.vehicleVin || '',
        licensePlate: formData.licensePlate || '',
        odometer: formData.odometer || '0'
      },
      appointment: appointment ? {
        date: appointment.requestedDate || '',
        time: appointment.requestedTime || '',
        type: formData.serviceType || 'Mobile',
        status: appointment.status || 'Pending',
        completedDate: appointment.scheduledDate?.toISOString() || ''
      } : {
        date: '',
        time: '',
        type: 'Mobile',
        status: transaction.status || 'Pending',
        completedDate: ''
      },
      invoice: {
        items: formData.lineItems || [],
        subtotal: formData.subtotal || 0,
        tax: formData.tax || 0,
        total: formData.total || 0,
        grossMargin: formData.grossMargin || 0
      },
      billing: {
        account: 'Wheels and Glass',
        accountPhone: '',
        accountAddress: '',
        pricingProfile: formData.pricingProfile || 'Standard'
      },
      jobInfo: {
        csr: formData.csr || '',
        location: formData.location || '',
        campaign: formData.campaign || '',
        status: transaction.status || 'Pending',
        tags: formData.tags || []
      },
      payments: formData.payments || [],
      notes: formData.notes || []
    };

    return jobRecord;
  }
}

// Use DatabaseStorage for production, MemStorage for development/testing
export const storage = process.env.NODE_ENV === 'production' 
  ? new DatabaseStorage() 
  : new MemStorage();
