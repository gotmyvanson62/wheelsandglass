// Database storage implementation using Drizzle ORM with Neon PostgreSQL
// This provides persistent data storage for production use

import { db } from './db.js';
import { eq, desc, and, sql } from 'drizzle-orm';
import * as schema from '@shared/schema';
import type { IStorage } from './storage.js';
import type {
  User, InsertUser,
  Transaction, InsertTransaction,
  ActivityLog, InsertActivityLog,
  Configuration, InsertConfiguration,
  FieldMapping, InsertFieldMapping,
  Appointment, InsertAppointment,
  SmsInteraction, InsertSmsInteraction,
  VehicleLookup, InsertVehicleLookup,
  NagsPart, InsertNagsPart,
  Subcontractor, InsertSubcontractor,
  SubcontractorAvailability, InsertSubcontractorAvailability,
  JobRequest, InsertJobRequest,
  SubcontractorResponse, InsertSubcontractorResponse,
  QuoteSubmission, InsertQuoteSubmission,
  Customer, InsertCustomer,
  Technician, InsertTechnician
} from '@shared/schema';
import { PasswordService } from './services/password-service.js';

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

/**
 * DatabaseStorage - Production storage using Drizzle ORM with Neon PostgreSQL
 * Implements IStorage interface for persistent data storage
 */
export class DatabaseStorage implements IStorage {
  /**
   * Get the database instance, throwing if not available.
   * DatabaseStorage should only be used when DATABASE_URL is set.
   */
  private getDb() {
    if (!db) {
      throw new Error('Database not initialized. DATABASE_URL must be set to use DatabaseStorage.');
    }
    return db;
  }

  // ============================================
  // USER METHODS
  // ============================================

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await this.getDb().select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.getDb().select().from(schema.users).where(eq(schema.users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.getDb().insert(schema.users).values(insertUser).returning();
    return user;
  }

  // ============================================
  // TRANSACTION METHODS
  // ============================================

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const insertData = {
      customerName: transaction.customerName,
      customerEmail: transaction.customerEmail,
      customerPhone: transaction.customerPhone,
      customerId: transaction.customerId,
      vehicleYear: transaction.vehicleYear,
      vehicleMake: transaction.vehicleMake,
      vehicleModel: transaction.vehicleModel,
      vehicleVin: transaction.vehicleVin,
      damageDescription: transaction.damageDescription,
      policyNumber: transaction.policyNumber,
      status: transaction.status,
      omegaJobId: transaction.omegaJobId,
      omegaQuoteId: transaction.omegaQuoteId,
      squareBookingId: transaction.squareBookingId,
      squarePaymentLinkId: transaction.squarePaymentLinkId,
      finalPrice: transaction.finalPrice,
      paymentStatus: transaction.paymentStatus as 'pending' | 'paid' | 'failed' | null | undefined,
      errorMessage: transaction.errorMessage,
      formData: transaction.formData,
      retryCount: transaction.retryCount ?? 0,
      sourceType: transaction.sourceType,
      tags: transaction.tags as string[] | null | undefined,
    };
    const [result] = await this.getDb().insert(schema.transactions).values(insertData).returning();
    return result;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await this.getDb().select().from(schema.transactions).where(eq(schema.transactions.id, id));
    return transaction;
  }

  async updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    // If status is being updated, append to status_history JSONB
    let updatesToSet: any = { ...updates };
    if (updates.status) {
      // Fetch existing transaction to preserve history
      const [existing] = await this.getDb().select().from(schema.transactions).where(eq(schema.transactions.id, id));
      const existingHistory = (existing?.statusHistory as any) || [];
      const newEntry = {
        status: updates.status,
        timestamp: new Date().toISOString(),
        triggeredBy: (updates as any).triggeredBy || 'system'
      };
      updatesToSet.statusHistory = [...existingHistory, newEntry];
    }

    const [updated] = await this.getDb().update(schema.transactions)
      .set(updatesToSet)
      .where(eq(schema.transactions.id, id))
      .returning();
    return updated;
  }

  async getTransactions(filters?: { status?: string; limit?: number; offset?: number }): Promise<Transaction[]> {
    let query = this.getDb().select().from(schema.transactions);

    if (filters?.status) {
      query = query.where(eq(schema.transactions.status, filters.status)) as typeof query;
    }

    const results = await query
      .orderBy(desc(schema.transactions.timestamp))
      .limit(filters?.limit || 50)
      .offset(filters?.offset || 0);

    return results;
  }

  async getTransactionStats(): Promise<{ total: number; success: number; failed: number; pending: number }> {
    const transactions = await this.getDb().select().from(schema.transactions);
    return {
      total: transactions.length,
      success: transactions.filter(t => t.status === 'success').length,
      failed: transactions.filter(t => t.status === 'failed').length,
      pending: transactions.filter(t => t.status === 'pending').length,
    };
  }

  // ============================================
  // ACTIVITY LOG METHODS
  // ============================================

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [result] = await this.getDb().insert(schema.activityLogs).values(log).returning();
    return result;
  }

  async getActivityLogs(limit: number = 20): Promise<ActivityLog[]> {
    return await this.getDb().select()
      .from(schema.activityLogs)
      .orderBy(desc(schema.activityLogs.timestamp))
      .limit(limit);
  }

  // ============================================
  // CONFIGURATION METHODS
  // ============================================

  async getConfiguration(key: string): Promise<Configuration | undefined> {
    const [config] = await this.getDb().select().from(schema.configurations).where(eq(schema.configurations.key, key));
    return config;
  }

  async setConfiguration(config: InsertConfiguration): Promise<Configuration> {
    const existing = await this.getConfiguration(config.key);
    if (existing) {
      const [updated] = await this.getDb().update(schema.configurations)
        .set({ ...config, updatedAt: new Date() })
        .where(eq(schema.configurations.key, config.key))
        .returning();
      return updated;
    } else {
      const [created] = await this.getDb().insert(schema.configurations).values(config).returning();
      return created;
    }
  }

  async getAllConfigurations(): Promise<Configuration[]> {
    return await this.getDb().select().from(schema.configurations);
  }

  // ============================================
  // FIELD MAPPING METHODS
  // ============================================

  async getFieldMappings(): Promise<FieldMapping[]> {
    return await this.getDb().select().from(schema.fieldMappings);
  }

  async setFieldMapping(mapping: InsertFieldMapping): Promise<FieldMapping> {
    const [result] = await this.getDb().insert(schema.fieldMappings).values(mapping).returning();
    return result;
  }

  // ============================================
  // APPOINTMENT METHODS
  // ============================================

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await this.getDb().select().from(schema.appointments).where(eq(schema.appointments.id, id));
    return appointment;
  }

  async getAppointments(): Promise<Appointment[]> {
    return await this.getDb().select().from(schema.appointments).orderBy(desc(schema.appointments.createdAt));
  }

  async getAppointmentsByPhone(phoneNumber: string): Promise<Appointment[]> {
    return await this.getDb().select()
      .from(schema.appointments)
      .where(eq(schema.appointments.customerPhone, phoneNumber));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [result] = await this.getDb().insert(schema.appointments).values(appointment).returning();
    return result;
  }

  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const [updated] = await this.getDb().update(schema.appointments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.appointments.id, id))
      .returning();
    return updated;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    await this.getDb().delete(schema.appointments).where(eq(schema.appointments.id, id));
    return true;
  }

  // ============================================
  // SMS INTERACTION METHODS
  // ============================================

  async getSmsInteractions(): Promise<SmsInteraction[]> {
    return await this.getDb().select()
      .from(schema.smsInteractions)
      .orderBy(desc(schema.smsInteractions.timestamp));
  }

  async getSmsInteractionsByAppointment(appointmentId: number): Promise<SmsInteraction[]> {
    return await this.getDb().select()
      .from(schema.smsInteractions)
      .where(eq(schema.smsInteractions.appointmentId, appointmentId));
  }

  async createSmsInteraction(interaction: InsertSmsInteraction): Promise<SmsInteraction> {
    const [result] = await this.getDb().insert(schema.smsInteractions).values(interaction).returning();
    return result;
  }

  // ============================================
  // VEHICLE LOOKUP METHODS
  // ============================================

  async getVehicleLookup(vin: string): Promise<VehicleLookup | undefined> {
    const [lookup] = await this.getDb().select().from(schema.vehicleLookups).where(eq(schema.vehicleLookups.vin, vin));
    return lookup;
  }

  async createVehicleLookup(lookup: InsertVehicleLookup): Promise<VehicleLookup> {
    const [result] = await this.getDb().insert(schema.vehicleLookups).values(lookup).returning();
    return result;
  }

  async updateVehicleLookupLastUsed(vin: string): Promise<void> {
    await this.getDb().update(schema.vehicleLookups)
      .set({ lastUsed: new Date() })
      .where(eq(schema.vehicleLookups.vin, vin));
  }

  // ============================================
  // RETRY QUEUE METHODS
  // ============================================

  async createRetryQueueEntry(entry: { operation: string; payload: any; nextAttemptAt?: Date | null; maxAttempts?: number; }): Promise<any> {
    const insert = {
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
    const [result] = await this.getDb().insert(schema.retryQueue).values(insert).returning();
    return result;
  }

  async getPendingRetryQueueEntries(limit: number = 50): Promise<any[]> {
    const now = new Date();
    return await this.getDb().select().from(schema.retryQueue)
      .where(sql`${schema.retryQueue.isDeadLetter} = false AND ${schema.retryQueue.nextAttemptAt} <= ${now}`)
      .orderBy(schema.retryQueue.nextAttemptAt)
      .limit(limit);
  }

  async updateRetryQueueEntry(id: number, updates: Partial<any>): Promise<void> {
    await this.getDb().update(schema.retryQueue)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.retryQueue.id, id));
  }

  async moveRetryEntryToDeadLetter(id: number, error?: string): Promise<void> {
    await this.getDb().update(schema.retryQueue)
      .set({ isDeadLetter: true, lastError: error || null, updatedAt: new Date() })
      .where(eq(schema.retryQueue.id, id));
  }

  // ============================================
  // NAGS PARTS METHODS
  // ============================================

  async getNagsPartsByVin(vin: string): Promise<NagsPart[]> {
    return await this.getDb().select().from(schema.nagsParts).where(eq(schema.nagsParts.vin, vin));
  }

  async getNagsPartByNumber(nagsNumber: string): Promise<NagsPart | undefined> {
    const [part] = await this.getDb().select().from(schema.nagsParts).where(eq(schema.nagsParts.nagsNumber, nagsNumber));
    return part;
  }

  async getNagsPart(id: number): Promise<NagsPart | undefined> {
    const [part] = await this.getDb().select().from(schema.nagsParts).where(eq(schema.nagsParts.id, id));
    return part;
  }

  async createNagsPart(part: InsertNagsPart): Promise<NagsPart> {
    const [result] = await this.getDb().insert(schema.nagsParts).values(part).returning();
    return result;
  }

  async updateNagsPartAvailability(nagsNumber: string, updates: { availability?: string; price?: number; leadTime?: number }): Promise<void> {
    await this.getDb().update(schema.nagsParts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.nagsParts.nagsNumber, nagsNumber));
  }

  // ============================================
  // SUBCONTRACTOR METHODS
  // ============================================

  async getSubcontractor(id: number): Promise<Subcontractor | undefined> {
    const [sub] = await this.getDb().select().from(schema.subcontractors).where(eq(schema.subcontractors.id, id));
    return sub;
  }

  async getActiveSubcontractors(): Promise<Subcontractor[]> {
    return await this.getDb().select()
      .from(schema.subcontractors)
      .where(eq(schema.subcontractors.isActive, true));
  }

  async createSubcontractor(subcontractor: InsertSubcontractor): Promise<Subcontractor> {
    const [result] = await this.getDb().insert(schema.subcontractors).values(subcontractor).returning();
    return result;
  }

  async updateSubcontractor(id: number, updates: Partial<Subcontractor>): Promise<Subcontractor | undefined> {
    const [updated] = await this.getDb().update(schema.subcontractors)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.subcontractors.id, id))
      .returning();
    return updated;
  }

  // ============================================
  // TECHNICIAN METHODS
  // ============================================

  async getTechnician(id: number): Promise<Technician | undefined> {
    const [tech] = await this.getDb().select().from(schema.technicians).where(eq(schema.technicians.id, id));
    return tech;
  }

  async getTechnicians(): Promise<Technician[]> {
    return await this.getDb().select()
      .from(schema.technicians)
      .orderBy(desc(schema.technicians.createdAt));
  }

  async getActiveTechnicians(): Promise<Technician[]> {
    return await this.getDb().select()
      .from(schema.technicians)
      .where(eq(schema.technicians.isActive, true))
      .orderBy(desc(schema.technicians.createdAt));
  }

  async getTechnicianByPhone(phone: string): Promise<Technician | undefined> {
    const normalized = phone.replace(/\D/g, '');
    const techs = await this.getDb().select().from(schema.technicians);
    return techs.find(t => t.phone?.replace(/\D/g, '') === normalized);
  }

  async getTechnicianByEmail(email: string): Promise<Technician | undefined> {
    const [tech] = await this.getDb().select()
      .from(schema.technicians)
      .where(eq(schema.technicians.email, email.toLowerCase().trim()));
    return tech;
  }

  async createTechnician(technician: InsertTechnician): Promise<Technician> {
    const [result] = await this.getDb().insert(schema.technicians).values(technician).returning();
    return result;
  }

  async updateTechnician(id: number, updates: Partial<Technician>): Promise<Technician | undefined> {
    const [updated] = await this.getDb().update(schema.technicians)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.technicians.id, id))
      .returning();
    return updated;
  }

  // ============================================
  // SUBCONTRACTOR AVAILABILITY METHODS
  // ============================================

  async getSubcontractorAvailability(subcontractorId: number, date: Date): Promise<SubcontractorAvailability | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [availability] = await this.getDb().select()
      .from(schema.subcontractorAvailability)
      .where(
        and(
          eq(schema.subcontractorAvailability.subcontractorId, subcontractorId),
          sql`${schema.subcontractorAvailability.date} >= ${startOfDay}`,
          sql`${schema.subcontractorAvailability.date} <= ${endOfDay}`
        )
      );
    return availability;
  }

  async createSubcontractorAvailability(availability: InsertSubcontractorAvailability): Promise<SubcontractorAvailability> {
    const [result] = await this.getDb().insert(schema.subcontractorAvailability).values(availability).returning();
    return result;
  }

  async updateSubcontractorAvailability(id: number, updates: Partial<SubcontractorAvailability>): Promise<SubcontractorAvailability | undefined> {
    const [updated] = await this.getDb().update(schema.subcontractorAvailability)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.subcontractorAvailability.id, id))
      .returning();
    return updated;
  }

  // ============================================
  // JOB REQUEST METHODS
  // ============================================

  async getJobRequest(id: number): Promise<JobRequest | undefined> {
    const [request] = await this.getDb().select().from(schema.jobRequests).where(eq(schema.jobRequests.id, id));
    return request;
  }

  async createJobRequest(request: InsertJobRequest): Promise<JobRequest> {
    const [result] = await this.getDb().insert(schema.jobRequests).values(request).returning();
    return result;
  }

  async updateJobRequest(id: number, updates: Partial<JobRequest>): Promise<JobRequest | undefined> {
    const [updated] = await this.getDb().update(schema.jobRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.jobRequests.id, id))
      .returning();
    return updated;
  }

  async getJobRequestsByTransaction(transactionId: number): Promise<JobRequest[]> {
    return await this.getDb().select()
      .from(schema.jobRequests)
      .where(eq(schema.jobRequests.transactionId, transactionId));
  }

  // ============================================
  // SUBCONTRACTOR RESPONSE METHODS
  // ============================================

  async createSubcontractorResponse(response: InsertSubcontractorResponse): Promise<SubcontractorResponse> {
    const [result] = await this.getDb().insert(schema.subcontractorResponses).values(response).returning();
    return result;
  }

  async getSubcontractorResponsesByJobRequest(jobRequestId: number): Promise<SubcontractorResponse[]> {
    return await this.getDb().select()
      .from(schema.subcontractorResponses)
      .where(eq(schema.subcontractorResponses.jobRequestId, jobRequestId));
  }

  // ============================================
  // QUOTE SUBMISSION METHODS
  // ============================================

  async createQuoteSubmission(quoteSubmission: InsertQuoteSubmission): Promise<QuoteSubmission> {
    const [result] = await this.getDb().insert(schema.quoteSubmissions).values(quoteSubmission).returning();
    return result;
  }

  async getQuoteSubmissions(): Promise<QuoteSubmission[]> {
    return await this.getDb().select()
      .from(schema.quoteSubmissions)
      .orderBy(desc(schema.quoteSubmissions.timestamp));
  }

  async updateQuoteSubmission(id: number, updates: Partial<QuoteSubmission>): Promise<QuoteSubmission | undefined> {
    const [updated] = await this.getDb().update(schema.quoteSubmissions)
      .set(updates)
      .where(eq(schema.quoteSubmissions.id, id))
      .returning();
    return updated;
  }

  async deleteQuoteSubmission(id: number): Promise<boolean> {
    await this.getDb().delete(schema.quoteSubmissions).where(eq(schema.quoteSubmissions.id, id));
    return true;
  }

  async getQuoteSubmissionsByCustomer(customerId: number): Promise<QuoteSubmission[]> {
    return await this.getDb().select()
      .from(schema.quoteSubmissions)
      .where(eq(schema.quoteSubmissions.customerId, customerId));
  }

  // ============================================
  // CUSTOMER METHODS
  // ============================================

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await this.getDb().select().from(schema.customers).where(eq(schema.customers.id, id));
    return customer;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const normalized = email.toLowerCase().trim();
    const [customer] = await this.getDb().select()
      .from(schema.customers)
      .where(eq(schema.customers.primaryEmail, normalized));
    return customer;
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const normalized = phone.replace(/\D/g, '');
    const customers = await this.getDb().select().from(schema.customers);
    return customers.find(c => c.primaryPhone.replace(/\D/g, '') === normalized);
  }

  async getCustomers(): Promise<Customer[]> {
    return await this.getDb().select()
      .from(schema.customers)
      .orderBy(desc(schema.customers.createdAt));
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [result] = await this.getDb().insert(schema.customers).values({
      ...customer,
      primaryEmail: customer.primaryEmail.toLowerCase().trim(),
    }).returning();
    return result;
  }

  async updateCustomer(id: number, updates: Partial<Customer>): Promise<Customer | undefined> {
    const [updated] = await this.getDb().update(schema.customers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.customers.id, id))
      .returning();
    return updated;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    await this.getDb().delete(schema.customers).where(eq(schema.customers.id, id));
    return true;
  }

  async findOrCreateCustomer(email: string, phone: string, data: Partial<InsertCustomer>): Promise<Customer> {
    let customer = await this.getCustomerByEmail(email);
    if (customer) {
      return await this.updateCustomer(customer.id, {
        ...data,
        primaryPhone: phone || customer.primaryPhone,
      }) as Customer;
    }

    customer = await this.getCustomerByPhone(phone);
    if (customer) {
      return await this.updateCustomer(customer.id, {
        ...data,
        primaryEmail: email || customer.primaryEmail,
      }) as Customer;
    }

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
    const [quotes, appointments, transactions] = await Promise.all([
      this.getQuoteSubmissionsByCustomer(customerId),
      this.getDb().select().from(schema.appointments).where(eq(schema.appointments.customerId, customerId)),
      this.getDb().select().from(schema.transactions).where(eq(schema.transactions.customerId, customerId)),
    ]);

    return {
      quotes: quotes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      appointments: appointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      transactions: transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    };
  }

  async recalculateCustomerTotals(customerId: number): Promise<Customer | undefined> {
    const customer = await this.getCustomer(customerId);
    if (!customer) return undefined;

    const transactions = await this.getDb().select()
      .from(schema.transactions)
      .where(
        and(
          eq(schema.transactions.customerId, customerId),
          eq(schema.transactions.status, 'success'),
          eq(schema.transactions.paymentStatus, 'paid')
        )
      );

    const totalSpent = transactions.reduce((sum, t) => sum + (t.finalPrice || 27500), 0);
    const totalJobs = transactions.length;

    let lastJobDate: Date | null = null;
    if (transactions.length > 0) {
      const timestamps = transactions.map(t => new Date(t.timestamp).getTime());
      lastJobDate = new Date(Math.max(...timestamps));
    }

    return await this.updateCustomer(customerId, {
      totalSpent,
      totalJobs,
      lastJobDate,
    });
  }

  // ============================================
  // RPJ SETTINGS METHODS
  // ============================================

  async getRpjSettings(): Promise<any> {
    const [settings] = await this.getDb().select().from(schema.rpjSettings).limit(1);
    if (settings) {
      return {
        rpjGlobal: settings.rpjGlobal,
        rpjOverrides: settings.rpjOverrides,
      };
    }
    return {
      rpjGlobal: 27500,
      rpjOverrides: { state: {}, city: {}, service: {} },
    };
  }

  async updateRpjSettings(settings: any): Promise<any> {
    const existing = await this.getDb().select().from(schema.rpjSettings).limit(1);
    if (existing.length > 0) {
      const [updated] = await this.getDb().update(schema.rpjSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(schema.rpjSettings.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await this.getDb().insert(schema.rpjSettings).values(settings).returning();
      return created;
    }
  }

  // ============================================
  // ADMIN USER METHODS
  // ============================================

  async getAdminUsers(): Promise<any[]> {
    return await this.getDb().select().from(schema.adminUsers);
  }

  async getAdminUser(id: number): Promise<any | undefined> {
    const [user] = await this.getDb().select().from(schema.adminUsers).where(eq(schema.adminUsers.id, id));
    return user;
  }

  async getAdminUserByUsername(username: string): Promise<any | undefined> {
    const [user] = await this.getDb().select().from(schema.adminUsers).where(eq(schema.adminUsers.username, username));
    return user;
  }

  async createAdminUser(adminUser: any): Promise<any> {
    const hashedPassword = await PasswordService.hashPassword(adminUser.password);
    const [result] = await this.getDb().insert(schema.adminUsers).values({
      ...adminUser,
      password: hashedPassword,
    }).returning();

    const { password: _, ...userWithoutPassword } = result;
    return { ...userWithoutPassword, password: '[HASHED]' };
  }

  async updateAdminUser(id: number, updates: any): Promise<any | undefined> {
    const [updated] = await this.getDb().update(schema.adminUsers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.adminUsers.id, id))
      .returning();
    return updated;
  }

  async deleteAdminUser(id: number): Promise<boolean> {
    await this.getDb().delete(schema.adminUsers).where(eq(schema.adminUsers.id, id));
    return true;
  }

  async changeAdminPassword(id: number, newPassword: string): Promise<boolean> {
    const hashedPassword = await PasswordService.hashPassword(newPassword);
    await this.getDb().update(schema.adminUsers)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(schema.adminUsers.id, id));
    return true;
  }

  // ============================================
  // JOB RECORD METHODS
  // ============================================

  async getJobRecord(jobId: string): Promise<JobRecord | undefined> {
    const [job] = await this.getDb().select()
      .from(schema.omegaJobs)
      .where(eq(schema.omegaJobs.jobNumber, jobId));

    if (job) {
      return {
        id: jobId,
        jobNumber: job.jobNumber,
        customer: { firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', postalCode: '' },
        vehicle: { year: '', make: '', model: '', description: '', vin: '', licensePlate: '', odometer: '0' },
        appointment: {
          date: job.appointmentDate?.toISOString() || '',
          time: '',
          type: job.appointmentType || 'Mobile',
          status: job.appointmentStatus || 'Scheduled',
          completedDate: job.completedDate?.toISOString(),
        },
        invoice: {
          items: (job.invoiceItems as any[]) || [],
          subtotal: job.subtotal || 0,
          tax: job.tax || 0,
          total: job.total || 0,
          grossMargin: job.estimatedGrossMargin || 0,
        },
        billing: {
          account: job.account || '',
          accountPhone: '',
          accountAddress: '',
          pricingProfile: job.pricingProfile || '',
          poNumber: job.poNumber || undefined,
        },
        jobInfo: {
          csr: job.csr || '',
          dispatcher: job.dispatcher || undefined,
          biller: job.biller || undefined,
          salesRep: job.salesRep || undefined,
          location: job.location || '',
          campaign: job.campaign || '',
          status: job.status,
          tags: (job.tags as string[]) || [],
        },
        payments: (job.payments as any[]) || [],
        notes: (job.publicNotes as any[]) || [],
      };
    }
    return undefined;
  }

  // ============================================
  // RESET DATA METHOD
  // ============================================

  async resetAllData(): Promise<void> {
    await this.getDb().delete(schema.subcontractorResponses);
    await this.getDb().delete(schema.jobRequests);
    await this.getDb().delete(schema.smsInteractions);
    await this.getDb().delete(schema.appointments);
    await this.getDb().delete(schema.nagsParts);
    await this.getDb().delete(schema.vehicleLookups);
    await this.getDb().delete(schema.quoteSubmissions);
    await this.getDb().delete(schema.activityLogs);
    await this.getDb().delete(schema.transactions);
    await this.getDb().delete(schema.customers);
    console.log('[DATABASE STORAGE] All transactional data has been reset');
  }
}
