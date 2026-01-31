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
  type InsertCustomer
} from "@shared/schema";
import { DatabaseStorage } from "./database-storage";

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
  getQuoteSubmissionsByCustomer(customerId: number): Promise<QuoteSubmission[]>;

  // Customer methods - for full quote-to-cash cycle tracking
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  getCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, updates: Partial<Customer>): Promise<Customer | undefined>;
  findOrCreateCustomer(email: string, phone: string, data: Partial<InsertCustomer>): Promise<Customer>;
  getCustomerHistory(customerId: number): Promise<{
    quotes: QuoteSubmission[];
    appointments: Appointment[];
    transactions: Transaction[];
  }>;

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

  private currentUserId: number;
  private currentTransactionId: number;
  private currentActivityLogId: number;
  private currentConfigId: number;
  private currentMappingId: number;
  private currentAppointmentId: number;
  private currentSmsInteractionId: number;
  private currentVehicleLookupId: number;
  private currentNagsPartId: number;
  private currentSubcontractorId: number;
  private currentAvailabilityId: number;
  private currentJobRequestId: number;
  private currentResponseId: number;
  private currentQuoteSubmissionId: number;
  private currentCustomerId: number;
  private currentAdminUserId: number;

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

    this.currentUserId = 1;
    this.currentTransactionId = 1;
    this.currentActivityLogId = 1;
    this.currentConfigId = 1;
    this.currentMappingId = 1;
    this.currentAppointmentId = 1;
    this.currentSmsInteractionId = 1;
    this.currentVehicleLookupId = 1;
    this.currentNagsPartId = 1;
    this.currentSubcontractorId = 1;
    this.currentAvailabilityId = 1;
    this.currentJobRequestId = 1;
    this.currentResponseId = 1;
    this.currentQuoteSubmissionId = 1;
    this.currentCustomerId = 1;
    this.currentAdminUserId = 2; // Start at 2 since we'll create a default admin with ID 1

    // Initialize default configurations and data
    this.initializeDefaultConfigurations();
    this.initializeDefaultFieldMappings();
    this.initializeDefaultSubcontractors();
    this.initializeDefaultRpjSettings();
    this.initializeDefaultAdminUser();
  }

  private initializeDefaultAdminUser() {
    // Create default super admin user
    const defaultAdmin = {
      id: 1,
      username: 'admin',
      email: 'admin@expressautoglass.com',
      password: 'hashed_password_placeholder', // In production, this would be properly hashed
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
      paymentStatus: transaction.paymentStatus || 'pending',
      errorMessage: transaction.errorMessage || null,
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updated = { ...transaction, ...updates };
    this.transactions.set(id, updated);
    return updated;
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
    const newAppointment: Appointment = {
      ...appointment,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      customerPhone: appointment.customerPhone || null,
      transactionId: appointment.transactionId || null,
      scheduledDate: appointment.scheduledDate || null,
      technicianId: appointment.technicianId || null,
      squareAppointmentId: appointment.squareAppointmentId || null,
      omegaAppointmentId: appointment.omegaAppointmentId || null,
      instructions: appointment.instructions || null,
      calendarInvitationSent: appointment.calendarInvitationSent || false,
    };
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

  private initializeDefaultSubcontractors() {
    const defaultSubcontractors = [
      {
        name: 'Metro Glass Solutions',
        email: 'dispatch@metroglass.com',
        phone: '(555) 123-4567',
        serviceAreas: ['10001', '10002', '10003', '10010', '10011'],
        specialties: ['windshield', 'side_window', 'rear_glass'],
        rating: 5,
        isActive: true,
        maxJobsPerDay: 8,
        preferredContactMethod: 'email'
      },
      {
        name: 'Quick Auto Glass',
        email: 'jobs@quickautoglass.com',
        phone: '(555) 234-5678',
        serviceAreas: ['10020', '10021', '10022', '10030'],
        specialties: ['windshield', 'quarter_glass'],
        rating: 4,
        isActive: true,
        maxJobsPerDay: 6,
        preferredContactMethod: 'phone'
      }
    ];

    defaultSubcontractors.forEach(sub => {
      const subWithId = { ...sub, id: this.currentSubcontractorId++, createdAt: new Date(), updatedAt: new Date() };
      this.subcontractors.set(subWithId.id, subWithId);

      // Add default availability for next 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const availability = {
          id: this.currentAvailabilityId++,
          subcontractorId: subWithId.id,
          date,
          timeSlots: ['09:00', '13:00', '15:00'],
          maxJobs: sub.maxJobsPerDay,
          currentJobs: 0,
          isAvailable: true,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.subcontractorAvailability.set(availability.id, availability);
      }
    });
  }

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
    const newUser = {
      id,
      username: adminUser.username,
      email: adminUser.email,
      password: adminUser.password, // In production, this should be hashed with bcrypt
      role: adminUser.role || 'admin',
      isActive: true,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.adminUsersMap.set(id, newUser);
    return newUser;
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

    // In production, this should hash the password with bcrypt
    user.password = newPassword;
    user.updatedAt = new Date();
    this.adminUsersMap.set(id, user);
    return true;
  }

  // Quote submission methods
  async createQuoteSubmission(quoteSubmission: InsertQuoteSubmission): Promise<QuoteSubmission> {
    const id = this.currentQuoteSubmissionId++;
    const newQuoteSubmission: QuoteSubmission = {
      id,
      timestamp: new Date(),
      processedAt: null,
      ...quoteSubmission,
    };

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
    };
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
    // For demo purposes, return mock data matching Omega EDI format
    // In production, this would query Omega EDI API or database
    const mockJobRecord: JobRecord = {
      id: jobId,
      jobNumber: jobId,
      customer: {
        firstName: 'Elan',
        lastName: 'Okonsky',
        email: 'elan@expressautoglassinc.com',
        phone: '760-715-3400',
        address: '371 S Rancho Santa Fe Rd',
        city: 'San Marcos',
        state: 'California',
        postalCode: '92078'
      },
      vehicle: {
        year: '2008',
        make: 'Infiniti',
        model: 'G35',
        description: '4 Door Sedan',
        vin: 'JNKBV61E68M215098',
        licensePlate: '6EQY319-CA',
        odometer: '0'
      },
      appointment: {
        date: '1/25/2022',
        time: '9:12 PM',
        type: 'Mobile',
        status: 'Completed',
        completedDate: '1/25/2022, 9:12:11 PM'
      },
      invoice: {
        items: [
          {
            sku: 'FW02717GBYN',
            description: 'Windshield (Solar)',
            listPrice: 438.60,
            extendedPrice: 438.60,
            discount: 0.00,
            cost: 0.00,
            quantity: 1.00,
            totalPrice: 438.60
          }
        ],
        subtotal: 588.60,
        tax: 0.00,
        total: 588.60,
        grossMargin: 0
      },
      billing: {
        account: 'Express Auto Glass',
        accountPhone: '619-320-5730',
        accountAddress: '371 S Rancho Santa Fe Rd San Marcos, CA 92078',
        pricingProfile: 'Discount | San Diego'
      },
      jobInfo: {
        csr: 'Josue Andrade',
        location: '#1 Andrade Auto Glass',
        campaign: 'Local Vendor',
        status: 'Archived',
        tags: ['Ready to Install', 'Test']
      },
      payments: [
        {
          amount: 588.60,
          method: 'Cash EO - Test',
          date: '2022-01-25 21:12',
          status: 'Complete'
        }
      ],
      notes: [
        {
          text: 'Test WO for Statement(s)',
          author: 'Josue Andrade',
          date: '2022-01-25 20:52:31',
          visibleToCustomer: true
        }
      ]
    };

    return mockJobRecord;
  }
}

// Use DatabaseStorage for production, MemStorage for development/testing
export const storage = process.env.NODE_ENV === 'production' 
  ? new DatabaseStorage() 
  : new MemStorage();
