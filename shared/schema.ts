import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { sql } from 'drizzle-orm';
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Admin users table for multi-user admin access
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default('admin'), // 'admin', 'super_admin'
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: 'set null' }), // Links to customers table for history tracking
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  vehicleYear: text("vehicle_year"),
  vehicleMake: text("vehicle_make"),
  vehicleModel: text("vehicle_model"),
  vehicleVin: text("vehicle_vin"),
  damageDescription: text("damage_description"),
  policyNumber: text("policy_number"),
  status: text("status").notNull(), // 'success', 'failed', 'pending'
  omegaJobId: text("omega_job_id"),
  omegaQuoteId: text("omega_quote_id"),
  squareBookingId: text("square_booking_id"),
  squarePaymentLinkId: text("square_payment_link_id"),
  finalPrice: integer("final_price"), // in cents
  paymentStatus: text("payment_status").$type<'pending' | 'paid' | 'failed'>().default('pending'),
  errorMessage: text("error_message"),
  formData: jsonb("form_data").notNull(),
  // Track status changes as an array of { status, timestamp, triggeredBy }
  statusHistory: jsonb("status_history").default(sql`'[]'::jsonb`),
  retryCount: integer("retry_count").default(0).notNull(),
  lastRetry: timestamp("last_retry"),
  sourceType: text("source_type").default('customer'), // 'customer', 'agent', 'insurance'
  tags: text("tags").array(), // For CRM tagging - ['Agent', 'Insurance', etc.]
});

// Retry queue for failed external operations
export const retryQueue = pgTable("retry_queue", {
  id: serial("id").primaryKey(),
  operation: text("operation").notNull(),
  payload: jsonb("payload").notNull(),
  attempts: integer("attempts").default(0).notNull(),
  maxAttempts: integer("max_attempts").default(5).notNull(),
  nextAttemptAt: timestamp("next_attempt_at"),
  lastError: text("last_error"),
  isDeadLetter: boolean("is_dead_letter").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  type: text("type").notNull(), // 'form_received', 'job_created', 'error', 'retry'
  message: text("message").notNull(),
  transactionId: integer("transaction_id").references(() => transactions.id, { onDelete: 'cascade' }),
  details: jsonb("details"),
});

export const configurations = pgTable("configurations", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fieldMappings = pgTable("field_mappings", {
  id: serial("id").primaryKey(),
  squarespaceField: text("squarespace_field").notNull(),
  omegaField: text("omega_field").notNull(),
  transformRule: text("transform_rule"),
  isRequired: boolean("is_required").default(false),
});

// Enhanced table for tracking scheduled appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").references(() => transactions.id, { onDelete: 'set null' }),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: 'set null' }), // Links to customers table for appointment history
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  requestedDate: text("requested_date").notNull(),
  requestedTime: text("requested_time").notNull(),
  scheduledDate: timestamp("scheduled_date"),
  serviceAddress: text("service_address").notNull(),
  status: text("status").notNull(), // 'requested', 'square_scheduled', 'omega_confirmed', 'confirmed', 'cancelled'
  technicianId: text("technician_id"),
  squareAppointmentId: text("square_appointment_id"),
  omegaAppointmentId: text("omega_appointment_id"),
  instructions: text("instructions"),
  calendarInvitationSent: boolean("calendar_invitation_sent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table for VIN lookup and vehicle details
export const vehicleLookups = pgTable("vehicle_lookups", {
  id: serial("id").primaryKey(),
  vin: text("vin").notNull().unique(),
  year: integer("year"),
  make: text("make"),
  model: text("model"),
  bodyType: text("body_type"),
  engine: text("engine"),
  trim: text("trim"),
  lookupSource: text("lookup_source"), // 'omega_edi', 'nhtsa', 'manual'
  isValid: boolean("is_valid").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsed: timestamp("last_used").defaultNow().notNull(),
});

// Table for NAGS parts and pricing
export const nagsParts = pgTable("nags_parts", {
  id: serial("id").primaryKey(),
  nagsNumber: text("nags_number").notNull(),
  vin: text("vin").notNull(),
  glassType: text("glass_type").notNull(), // 'windshield', 'side_window', 'rear_glass'
  position: text("position"), // 'front', 'rear', 'left_front', 'right_front', etc.
  partType: text("part_type").notNull(), // 'OEM', 'aftermarket', 'OEE'
  manufacturer: text("manufacturer"),
  description: text("description"),
  price: integer("price"), // Price in cents
  availability: text("availability"), // 'in_stock', 'order_required', 'unavailable'
  leadTime: integer("lead_time_days"),
  supplierInfo: jsonb("supplier_info"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table for subcontractor management
export const subcontractors = pgTable("subcontractors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  serviceAreas: jsonb("service_areas"), // Array of zip codes or regions
  specialties: jsonb("specialties"), // Array of glass types they handle
  rating: integer("rating").default(5), // 1-5 star rating
  isActive: boolean("is_active").default(true),
  maxJobsPerDay: integer("max_jobs_per_day").default(5),
  preferredContactMethod: text("preferred_contact_method").default('email'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table for subcontractor availability and scheduling
export const subcontractorAvailability = pgTable("subcontractor_availability", {
  id: serial("id").primaryKey(),
  subcontractorId: integer("subcontractor_id").references(() => subcontractors.id, { onDelete: 'cascade' }),
  date: timestamp("date").notNull(),
  timeSlots: jsonb("time_slots"), // Available time slots for the day
  maxJobs: integer("max_jobs").default(5),
  currentJobs: integer("current_jobs").default(0),
  isAvailable: boolean("is_available").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table for job requests and subcontractor responses
export const jobRequests = pgTable("job_requests", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").references(() => transactions.id, { onDelete: 'set null' }),
  vin: text("vin").notNull(),
  nagsPartId: integer("nags_part_id").references(() => nagsParts.id, { onDelete: 'set null' }),
  customerLocation: text("customer_location").notNull(),
  preferredDate: timestamp("preferred_date"),
  preferredTimeSlot: text("preferred_time_slot"),
  status: text("status").notNull(), // 'pending', 'assigned', 'completed', 'cancelled'
  assignedSubcontractorId: integer("assigned_subcontractor_id").references(() => subcontractors.id, { onDelete: 'set null' }),
  estimatedDuration: integer("estimated_duration_minutes").default(120),
  specialInstructions: text("special_instructions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table for subcontractor responses to job requests
export const subcontractorResponses = pgTable("subcontractor_responses", {
  id: serial("id").primaryKey(),
  jobRequestId: integer("job_request_id").references(() => jobRequests.id, { onDelete: 'cascade' }),
  subcontractorId: integer("subcontractor_id").references(() => subcontractors.id, { onDelete: 'cascade' }),
  response: text("response").notNull(), // 'available', 'declined', 'counter_offer'
  availableTimeSlots: jsonb("available_time_slots"),
  proposedDate: timestamp("proposed_date"),
  notes: text("notes"),
  respondedAt: timestamp("responded_at").defaultNow().notNull(),
});

// Table for quote submissions from landing page
export const quoteSubmissions = pgTable("quote_submissions", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: 'set null' }), // Links to customers table for multiple quotes per customer
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  mobilePhone: text("mobile_phone").notNull(),
  email: text("email").notNull(),
  location: text("location").notNull(),
  zipCode: text("zip_code").notNull(),
  serviceType: text("service_type").notNull(),
  division: text("division").notNull().default('glass'), // 'glass' or 'wheels' - brand division
  privacyTinted: text("privacy_tinted"),
  year: text("year"),
  make: text("make"),
  model: text("model"),
  vin: text("vin"),
  licensePlate: text("license_plate"),
  notes: text("notes"),
  selectedWindows: jsonb("selected_windows"), // For glass division
  selectedWheels: jsonb("selected_wheels"),   // For wheels division
  uploadedFiles: jsonb("uploaded_files"),
  status: text("status").notNull().default('submitted'), // 'submitted', 'processed', 'quoted'
  processedAt: timestamp("processed_at"),
});

// New table for SMS interactions and rescheduling requests
export const smsInteractions = pgTable("sms_interactions", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id").references(() => appointments.id, { onDelete: 'set null' }),
  phoneNumber: text("phone_number").notNull(),
  message: text("message").notNull(),
  direction: text("direction").notNull(), // 'inbound', 'outbound'
  messageType: text("message_type").notNull(), // 'reschedule_request', 'availability_check', 'confirmation'
  processedData: jsonb("processed_data"), // Extracted date/time or other structured data
  status: text("status").notNull(), // 'pending', 'processed', 'responded'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  timestamp: true,
  lastRetry: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});

export const insertConfigurationSchema = createInsertSchema(configurations).omit({
  id: true,
  updatedAt: true,
});

export const insertFieldMappingSchema = createInsertSchema(fieldMappings).omit({
  id: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSmsInteractionSchema = createInsertSchema(smsInteractions).omit({
  id: true,
  timestamp: true,
});

export const insertQuoteSubmissionSchema = createInsertSchema(quoteSubmissions).omit({
  id: true,
  timestamp: true,
  processedAt: true,
});

// Analytics and Form Tracking Tables
export const formSubmissions = pgTable("form_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id"),
  location: varchar("location"),
  serviceType: varchar("service_type"),
  vehicleYear: varchar("vehicle_year"),
  vehicleMake: varchar("vehicle_make"),
  vehicleModel: varchar("vehicle_model"),
  vin: varchar("vin"),
  customerEmail: varchar("customer_email"),
  customerPhone: varchar("customer_phone"),
  status: varchar("status").default("pending"), // pending, quoted, completed, cancelled
  source: varchar("source"), // direct, organic, referral, social
  deviceType: varchar("device_type"), // desktop, mobile, tablet
  userAgent: varchar("user_agent"),
  ipAddress: varchar("ip_address"),
  completionTime: integer("completion_time"), // seconds to complete form
  submittedAt: timestamp("submitted_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const formAnalytics = pgTable("form_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id"),
  eventType: varchar("event_type"), // page_view, form_start, field_complete, form_submit, form_abandon
  eventData: jsonb("event_data"), // Additional event-specific data
  timestamp: timestamp("timestamp").defaultNow(),
  page: varchar("page"),
  userAgent: varchar("user_agent"),
  deviceType: varchar("device_type"),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").unique(),
  source: varchar("source"), // direct, organic, referral, social, email
  referrer: varchar("referrer"),
  landingPage: varchar("landing_page"),
  deviceType: varchar("device_type"),
  userAgent: varchar("user_agent"),
  ipAddress: varchar("ip_address"),
  country: varchar("country"),
  state: varchar("state"),
  city: varchar("city"),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // session duration in seconds
  pageViews: integer("page_views").default(1),
  formStarted: boolean("form_started").default(false),
  formCompleted: boolean("form_completed").default(false),
  bounced: boolean("bounced").default(false), // single page session < 10 seconds
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pageViews = pgTable("page_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id"),
  page: varchar("page"),
  title: varchar("title"),
  referrer: varchar("referrer"),
  timeOnPage: integer("time_on_page"), // seconds
  exitPage: boolean("exit_page").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced customer table for relationship management
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  primaryEmail: text("primary_email").notNull(),
  secondaryEmail: text("secondary_email"),
  primaryPhone: text("primary_phone").notNull(),
  alternatePhone: text("alternate_phone"),
  address: text("address"),
  postalCode: text("postal_code"),
  city: text("city"),
  state: text("state"),
  smsOptIn: boolean("sms_opt_in").default(false),
  emailOptIn: boolean("email_opt_in").default(true),
  preferredContactMethod: text("preferred_contact_method").default('email'),
  tags: jsonb("tags"), // Array of customer tags
  notes: text("notes"),
  accountType: text("account_type").default('individual'), // 'individual', 'business', 'fleet'
  referredBy: text("referred_by"),
  company: text("company"), // Company/business name for contacts
  status: text("status").default('active'), // 'active', 'pending', 'inactive'
  totalJobs: integer("total_jobs").default(0),
  totalSpent: integer("total_spent").default(0), // in cents
  lastJobDate: timestamp("last_job_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Enhanced vehicle table for customer vehicle history
export const customerVehicles = pgTable("customer_vehicles", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: 'cascade' }),
  licensePlate: text("license_plate"),
  licenseState: text("license_state"),
  vin: text("vin"),
  year: integer("year"),
  make: text("make"),
  model: text("model"),
  bodyStyle: text("body_style"),
  color: text("color"),
  odometer: integer("odometer"),
  unit: text("unit"), // Fleet unit number
  isActive: boolean("is_active").default(true),
  jobHistory: jsonb("job_history"), // Array of job IDs
  lastServiceDate: timestamp("last_service_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Enhanced jobs table to match Omega EDI structure
export const omegaJobs = pgTable("omega_jobs", {
  id: serial("id").primaryKey(),
  jobNumber: text("job_number").notNull().unique(), // Job #10617 format
  customerId: integer("customer_id").references(() => customers.id, { onDelete: 'set null' }),
  vehicleId: integer("vehicle_id").references(() => customerVehicles.id, { onDelete: 'set null' }),
  
  // Sale Information
  csr: text("csr"),
  dispatcher: text("dispatcher"),
  biller: text("biller"),
  salesRep: text("sales_rep"),
  location: text("location"),
  campaign: text("campaign"),
  
  // Billing & Pricing
  account: text("account"),
  pricingProfile: text("pricing_profile"),
  agentReferredBy: text("agent_referred_by"),
  poNumber: text("po_number"),
  customFields: jsonb("custom_fields"),
  
  // Job Status and Workflow
  status: text("status").notNull().default('Open Lead'), // 'Open Lead', 'Open Quote', 'Work Order', 'Ready to Invoice', 'Invoiced', 'Archived'
  priority: text("priority").default('Standard'),
  tags: jsonb("tags"), // Array of job tags like "Ready to Install", "Test"
  
  // Invoice Items
  invoiceItems: jsonb("invoice_items"), // Array of line items with SKU, description, price, etc.
  subtotal: integer("subtotal").default(0), // in cents
  tax: integer("tax").default(0), // in cents
  total: integer("total").default(0), // in cents
  estimatedGrossMargin: integer("estimated_gross_margin"),
  
  // Notes and Communication
  notes: text("notes"),
  publicNotes: jsonb("public_notes"), // Notes visible to customer with timestamps
  privateNotes: jsonb("private_notes"), // Internal notes
  
  // Appointments
  appointmentDate: timestamp("appointment_date"),
  appointmentType: text("appointment_type"), // 'Mobile', 'Shop'
  appointmentStatus: text("appointment_status"), // 'Scheduled', 'Completed', 'Cancelled'
  completedDate: timestamp("completed_date"),
  
  // Payments
  payments: jsonb("payments"), // Array of payment records
  
  // Job Autobiography (activity log)
  activityLog: jsonb("activity_log"), // Array of activity entries with timestamps
  
  // Attachments and Media
  attachments: jsonb("attachments"), // Array of file references
  signatures: jsonb("signatures"), // Customer signatures
  
  // Reminders and Notifications
  reminders: jsonb("reminders"), // Set reminder data
  notifications: jsonb("notifications"), // Notification history
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// New schema definitions for VIN and NAGS workflow
export const insertVehicleLookupSchema = createInsertSchema(vehicleLookups).omit({
  id: true,
  createdAt: true,
  lastUsed: true,
});

export const insertNagsPartSchema = createInsertSchema(nagsParts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubcontractorSchema = createInsertSchema(subcontractors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubcontractorAvailabilitySchema = createInsertSchema(subcontractorAvailability).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobRequestSchema = createInsertSchema(jobRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubcontractorResponseSchema = createInsertSchema(subcontractorResponses).omit({
  id: true,
  respondedAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomerVehicleSchema = createInsertSchema(customerVehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOmegaJobSchema = createInsertSchema(omegaJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Notifications table for real-time integration failure alerts
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // omega_edi_failure, square_api_failure, etc.
  severity: varchar("severity").notNull(), // info, warning, error, critical
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  details: jsonb("details"), // Additional context data
  source: varchar("source"), // API endpoint, service name, etc.
  transactionId: varchar("transaction_id"), // Link to related transaction
  resolved: boolean("resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type InsertNotification = typeof notifications.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type Configuration = typeof configurations.$inferSelect;
export type InsertConfiguration = z.infer<typeof insertConfigurationSchema>;
export type FieldMapping = typeof fieldMappings.$inferSelect;
export type InsertFieldMapping = z.infer<typeof insertFieldMappingSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type SmsInteraction = typeof smsInteractions.$inferSelect;
export type InsertSmsInteraction = z.infer<typeof insertSmsInteractionSchema>;

// New types for VIN and NAGS workflow
export type VehicleLookup = typeof vehicleLookups.$inferSelect;
export type InsertVehicleLookup = z.infer<typeof insertVehicleLookupSchema>;
export type NagsPart = typeof nagsParts.$inferSelect;
export type InsertNagsPart = z.infer<typeof insertNagsPartSchema>;
export type Subcontractor = typeof subcontractors.$inferSelect;
export type InsertSubcontractor = z.infer<typeof insertSubcontractorSchema>;
export type SubcontractorAvailability = typeof subcontractorAvailability.$inferSelect;
export type InsertSubcontractorAvailability = z.infer<typeof insertSubcontractorAvailabilitySchema>;
export type JobRequest = typeof jobRequests.$inferSelect;
export type InsertJobRequest = z.infer<typeof insertJobRequestSchema>;
export type SubcontractorResponse = typeof subcontractorResponses.$inferSelect;
export type InsertSubcontractorResponse = z.infer<typeof insertSubcontractorResponseSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type CustomerVehicle = typeof customerVehicles.$inferSelect;
export type InsertCustomerVehicle = z.infer<typeof insertCustomerVehicleSchema>;
export type OmegaJob = typeof omegaJobs.$inferSelect;
export type InsertOmegaJob = z.infer<typeof insertOmegaJobSchema>;

export type QuoteSubmission = typeof quoteSubmissions.$inferSelect;
export type InsertQuoteSubmission = z.infer<typeof insertQuoteSubmissionSchema>;

// RPJ (Revenue per Job) configuration schema
export const rpjSettings = pgTable("rpj_settings", {
  id: serial("id").primaryKey(),
  rpjGlobal: integer("rpj_global").default(27500), // Default $275.00 in cents
  rpjOverrides: jsonb("rpj_overrides").$type<{
    state?: Record<string, number>;
    city?: Record<string, number>;
    service?: Record<string, number>;
  }>(), // JSON structure for overrides
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: text("updated_by"),
});

export const insertRpjSettingsSchema = createInsertSchema(rpjSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertRpjSettings = z.infer<typeof insertRpjSettingsSchema>;
export type RpjSettings = typeof rpjSettings.$inferSelect;

// Admin user schema and types
export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
});
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;

// ============================================
// ADVANCED EDI TABLES
// ============================================

// EDI Vendor Configurations
export const ediConfigs = pgTable("edi_configs", {
  id: serial("id").primaryKey(),
  vendorId: text("vendor_id").notNull(), // SGC, HSG, GNCS, GLAXIS, LYNX, SAFELITE, OMEGA
  isEnabled: boolean("is_enabled").default(true),

  // SGC specific
  sgcPID: text("sgc_pid"),
  safeliteUsername: text("safelite_username"),
  safelitePasswordEncrypted: text("safelite_password_encrypted"),
  enableDispatches: boolean("enable_dispatches").default(false),
  glaxisPID: text("glaxis_pid"),
  glaxisNetworkAddress: text("glaxis_network_address"),

  // HSG specific
  hsgProviderId: text("hsg_provider_id"),
  hsgAccountNumber: text("hsg_account_number"),
  hsgApiKeyEncrypted: text("hsg_api_key_encrypted"),
  hsgApiSecretEncrypted: text("hsg_api_secret_encrypted"),

  // GNCS specific
  gncsProviderId: text("gncs_provider_id"),
  gncsShopCode: text("gncs_shop_code"),
  gncsUsernameEncrypted: text("gncs_username_encrypted"),
  gncsPasswordEncrypted: text("gncs_password_encrypted"),

  // Omega specific
  omegaApiUrl: text("omega_api_url"),
  omegaApiKeyEncrypted: text("omega_api_key_encrypted"),
  omegaShopId: text("omega_shop_id"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// EDI Work Orders from insurance companies
export const ediWorkOrders = pgTable("edi_work_orders", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  transactionType: text("transaction_type").notNull(), // CLAIM, DISPATCH, WORK_ORDER, etc.
  vendorSource: text("vendor_source").notNull(), // SGC, HSG, GNCS, etc.
  receivedAt: timestamp("received_at").defaultNow().notNull(),

  // Claim Information
  claimNumber: text("claim_number").notNull(),
  policyNumber: text("policy_number"),
  deductible: integer("deductible"), // in cents

  // Insurance Company
  insuranceCompanyName: text("insurance_company_name"),
  insuranceCompanyNaic: text("insurance_company_naic"),
  insuranceCompanyPhone: text("insurance_company_phone"),

  // Vehicle Information (denormalized for quick access)
  vehicleVin: text("vehicle_vin").notNull(),
  vehicleYear: integer("vehicle_year"),
  vehicleMake: text("vehicle_make"),
  vehicleModel: text("vehicle_model"),
  vehicleBodyStyle: text("vehicle_body_style"),
  vehiclePlateNumber: text("vehicle_plate_number"),
  vehiclePlateState: text("vehicle_plate_state"),
  vehicleColor: text("vehicle_color"),
  vehicleTrimLevel: text("vehicle_trim_level"),

  // Customer Information
  customerFirstName: text("customer_first_name").notNull(),
  customerLastName: text("customer_last_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  customerAddressStreet: text("customer_address_street"),
  customerAddressCity: text("customer_address_city"),
  customerAddressState: text("customer_address_state"),
  customerAddressZip: text("customer_address_zip"),
  customerPreferredContact: text("customer_preferred_contact"),

  // Scheduling
  requestedDate: timestamp("requested_date"),
  scheduledDate: timestamp("scheduled_date"),
  requestedTimeWindow: text("requested_time_window"),
  scheduledTimeWindow: text("scheduled_time_window"),
  isMobile: boolean("is_mobile").default(false),
  serviceLocationStreet: text("service_location_street"),
  serviceLocationCity: text("service_location_city"),
  serviceLocationState: text("service_location_state"),
  serviceLocationZip: text("service_location_zip"),
  serviceLocationNotes: text("service_location_notes"),
  estimatedDuration: integer("estimated_duration"), // in minutes

  // Pricing (from insurance)
  approvedLabor: integer("approved_labor"), // in cents
  approvedParts: integer("approved_parts"), // in cents
  approvedMaterials: integer("approved_materials"), // in cents
  approvedTotal: integer("approved_total"), // in cents
  laborRate: integer("labor_rate"), // in cents
  laborHours: integer("labor_hours"), // in hundredths (e.g., 150 = 1.5 hours)
  partsMarkup: integer("parts_markup"), // in basis points

  // Status
  status: text("status").notNull().default('RECEIVED'), // RECEIVED, ACKNOWLEDGED, QUOTED, SCHEDULED, IN_PROGRESS, COMPLETED, INVOICED, PAID, CANCELLED, REJECTED

  // Internal references
  assignedTechnicianId: integer("assigned_technician_id"),
  assignedLocationId: integer("assigned_location_id"),
  internalJobId: integer("internal_job_id").references(() => omegaJobs.id, { onDelete: 'set null' }),

  // Raw data
  rawMessage: jsonb("raw_message"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// EDI Parts associated with work orders
export const ediParts = pgTable("edi_parts", {
  id: serial("id").primaryKey(),
  workOrderId: integer("work_order_id").references(() => ediWorkOrders.id, { onDelete: 'cascade' }).notNull(),

  partNumber: text("part_number").notNull(),
  nagsNumber: text("nags_number"),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  position: text("position"), // front, rear, left_front, etc.

  listPrice: integer("list_price"), // in cents
  approvedPrice: integer("approved_price"), // in cents
  ourCost: integer("our_cost"), // in cents

  features: jsonb("features"), // Array of feature strings
  isOEM: boolean("is_oem").default(false),
  hasRainSensor: boolean("has_rain_sensor").default(false),
  hasHUD: boolean("has_hud").default(false),
  hasADAS: boolean("has_adas").default(false),
  adasCalibrationRequired: boolean("adas_calibration_required").default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// EDI Status History for audit trail
export const ediStatusHistory = pgTable("edi_status_history", {
  id: serial("id").primaryKey(),
  workOrderId: integer("work_order_id").references(() => ediWorkOrders.id, { onDelete: 'cascade' }).notNull(),

  status: text("status").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  notes: text("notes"),
  updatedBy: text("updated_by"),

  sentToVendor: boolean("sent_to_vendor").default(false),
  sentAt: timestamp("sent_at"),
  vendorAcknowledged: boolean("vendor_acknowledged").default(false),
  vendorResponse: jsonb("vendor_response"),
});

// EDI Message Logs for audit trail
export const ediMessageLogs = pgTable("edi_message_logs", {
  id: serial("id").primaryKey(),
  direction: text("direction").notNull(), // INBOUND, OUTBOUND
  vendor: text("vendor").notNull(),
  messageType: text("message_type").notNull(), // CLAIM, DISPATCH, INVOICE, ACK, STATUS, QUOTE, WORK_ORDER

  rawContent: jsonb("raw_content"),
  parsedSuccessfully: boolean("parsed_successfully").default(false),
  parseError: text("parse_error"),

  workOrderId: integer("work_order_id").references(() => ediWorkOrders.id, { onDelete: 'set null' }),
  invoiceId: integer("invoice_id"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

// EDI Invoices
export const ediInvoices = pgTable("edi_invoices", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull(),
  workOrderId: integer("work_order_id").references(() => ediWorkOrders.id, { onDelete: 'cascade' }).notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  invoiceDate: timestamp("invoice_date").defaultNow().notNull(),

  // Charges (in cents)
  laborCharges: integer("labor_charges").default(0),
  partsCharges: integer("parts_charges").default(0),
  materialsCharges: integer("materials_charges").default(0),
  taxAmount: integer("tax_amount").default(0),
  totalAmount: integer("total_amount").default(0),

  // Line items stored as JSON
  lineItems: jsonb("line_items"), // Array of EDIInvoiceLineItem

  // Payment info
  customerPaid: integer("customer_paid"), // in cents
  insuranceDue: integer("insurance_due"), // in cents
  deductibleCollected: integer("deductible_collected"), // in cents

  // Submission tracking
  submittedAt: timestamp("submitted_at"),
  submissionStatus: text("submission_status").default('PENDING'), // PENDING, SUBMITTED, ACCEPTED, REJECTED, FAILED
  vendorResponse: jsonb("vendor_response"),

  // Attachments stored as JSON
  attachments: jsonb("attachments"), // Array of EDIAttachment

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// TECHNICIAN PAYOUT TABLES
// ============================================

// Technicians table
export const technicians = pgTable("technicians", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  isActive: boolean("is_active").default(true),
  hireDate: timestamp("hire_date"),
  terminationDate: timestamp("termination_date"),
  certifications: jsonb("certifications"), // Array of certification names
  serviceAreas: jsonb("service_areas"), // Array of zip codes
  maxDailyJobs: integer("max_daily_jobs").default(6),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Technician Payout Configurations
export const technicianPayoutConfigs = pgTable("technician_payout_configs", {
  id: serial("id").primaryKey(),
  technicianId: integer("technician_id").references(() => technicians.id, { onDelete: 'cascade' }).notNull(),
  payModel: text("pay_model").notNull(), // HOURLY, FLAT_RATE, COMMISSION, HYBRID

  // Hourly rate config (in cents)
  hourlyRate: integer("hourly_rate"),

  // Flat rate config (in cents)
  flatRatePerJob: integer("flat_rate_per_job"),

  // Commission config (in basis points, e.g., 5000 = 50%)
  laborCommissionRate: integer("labor_commission_rate"),
  partsMarginRate: integer("parts_margin_rate"),
  feesCommissionRate: integer("fees_commission_rate"),

  // Hybrid config
  basePayPerJob: integer("base_pay_per_job"), // in cents
  commissionThreshold: integer("commission_threshold"), // in cents
  commissionRateAboveThreshold: integer("commission_rate_above_threshold"), // in basis points

  effectiveDate: timestamp("effective_date").defaultNow().notNull(),
  expirationDate: timestamp("expiration_date"),
  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payout Deductions
export const payoutDeductions = pgTable("payout_deductions", {
  id: serial("id").primaryKey(),
  payoutConfigId: integer("payout_config_id").references(() => technicianPayoutConfigs.id, { onDelete: 'cascade' }).notNull(),

  name: text("name").notNull(),
  deductionType: text("deduction_type").notNull(), // FIXED, PERCENTAGE
  amount: integer("amount").notNull(), // in cents for FIXED, basis points for PERCENTAGE
  isRecurring: boolean("is_recurring").default(false),
  appliesTo: text("applies_to").default('GROSS'), // GROSS, NET

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payment Batches for technicians
export const paymentBatches = pgTable("payment_batches", {
  id: serial("id").primaryKey(),
  batchId: text("batch_id").notNull().unique(),
  technicianId: integer("technician_id").references(() => technicians.id, { onDelete: 'cascade' }).notNull(),

  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  status: text("status").notNull().default('PENDING'), // PENDING, APPROVED, PAID, DISPUTED

  // Amounts (in cents)
  grossEarnings: integer("gross_earnings").default(0),
  totalDeductions: integer("total_deductions").default(0),
  netPayout: integer("net_payout").default(0),

  // Jobs included
  jobIds: jsonb("job_ids"), // Array of job IDs
  jobCount: integer("job_count").default(0),

  // Payment details
  paidAt: timestamp("paid_at"),
  paymentMethod: text("payment_method"),
  paymentReference: text("payment_reference"),

  // Summary stored as JSON
  summary: jsonb("summary"), // PayoutSummary object

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// COMPANY PROFILE
// ============================================

export const companyProfiles = pgTable("company_profiles", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  federalTaxId: text("federal_tax_id"),

  // Remittance Address
  remittanceStreet: text("remittance_street"),
  remittanceCity: text("remittance_city"),
  remittanceState: text("remittance_state"),
  remittanceZip: text("remittance_zip"),

  // Contact
  contactPerson: text("contact_person"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),

  logoUrl: text("logo_url"),

  // Tax integrations (encrypted)
  taxJarApiTokenEncrypted: text("taxjar_api_token_encrypted"),
  avalaraCompanyCode: text("avalara_company_code"),

  // ADAS settings
  includeADASDisclaimer: boolean("include_adas_disclaimer").default(true),
  adasDisclaimerText: text("adas_disclaimer_text"),

  // Invoice settings
  invoiceFooterWarranty: text("invoice_footer_warranty"),
  defaultPaymentTerms: text("default_payment_terms"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Pricing Profiles
export const pricingProfiles = pgTable("pricing_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isDefault: boolean("is_default").default(false),

  // Labor rates (in cents)
  baseLabor: integer("base_labor").default(0),
  mobileLabor: integer("mobile_labor").default(0),
  afterHoursLabor: integer("after_hours_labor").default(0),
  emergencyLabor: integer("emergency_labor").default(0),

  // Parts markup (basis points, e.g., 3500 = 35%)
  partsMarkupMin: integer("parts_markup_min").default(2500),
  partsMarkupMax: integer("parts_markup_max").default(5000),
  partsMarkupDefault: integer("parts_markup_default").default(3500),

  // Fees (in cents)
  mobileServiceFee: integer("mobile_service_fee"),
  adasCalibrationFee: integer("adas_calibration_fee"),
  disposalFee: integer("disposal_fee"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// ADVANCED EDI INSERT SCHEMAS
// ============================================

export const insertEdiConfigSchema = createInsertSchema(ediConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEdiWorkOrderSchema = createInsertSchema(ediWorkOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEdiPartSchema = createInsertSchema(ediParts).omit({
  id: true,
  createdAt: true,
});

export const insertEdiStatusHistorySchema = createInsertSchema(ediStatusHistory).omit({
  id: true,
});

export const insertEdiMessageLogSchema = createInsertSchema(ediMessageLogs).omit({
  id: true,
  createdAt: true,
});

export const insertEdiInvoiceSchema = createInsertSchema(ediInvoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTechnicianSchema = createInsertSchema(technicians).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTechnicianPayoutConfigSchema = createInsertSchema(technicianPayoutConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPayoutDeductionSchema = createInsertSchema(payoutDeductions).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentBatchSchema = createInsertSchema(paymentBatches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanyProfileSchema = createInsertSchema(companyProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPricingProfileSchema = createInsertSchema(pricingProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// ADVANCED EDI TYPES
// ============================================

export type EdiConfig = typeof ediConfigs.$inferSelect;
export type InsertEdiConfig = z.infer<typeof insertEdiConfigSchema>;

export type EdiWorkOrder = typeof ediWorkOrders.$inferSelect;
export type InsertEdiWorkOrder = z.infer<typeof insertEdiWorkOrderSchema>;

export type EdiPart = typeof ediParts.$inferSelect;
export type InsertEdiPart = z.infer<typeof insertEdiPartSchema>;

export type EdiStatusHistory = typeof ediStatusHistory.$inferSelect;
export type InsertEdiStatusHistory = z.infer<typeof insertEdiStatusHistorySchema>;

export type EdiMessageLog = typeof ediMessageLogs.$inferSelect;
export type InsertEdiMessageLog = z.infer<typeof insertEdiMessageLogSchema>;

export type EdiInvoice = typeof ediInvoices.$inferSelect;
export type InsertEdiInvoice = z.infer<typeof insertEdiInvoiceSchema>;

export type Technician = typeof technicians.$inferSelect;
export type InsertTechnician = z.infer<typeof insertTechnicianSchema>;

export type TechnicianPayoutConfig = typeof technicianPayoutConfigs.$inferSelect;
export type InsertTechnicianPayoutConfig = z.infer<typeof insertTechnicianPayoutConfigSchema>;

export type PayoutDeduction = typeof payoutDeductions.$inferSelect;
export type InsertPayoutDeduction = z.infer<typeof insertPayoutDeductionSchema>;

export type PaymentBatch = typeof paymentBatches.$inferSelect;
export type InsertPaymentBatch = z.infer<typeof insertPaymentBatchSchema>;

export type CompanyProfile = typeof companyProfiles.$inferSelect;
export type InsertCompanyProfile = z.infer<typeof insertCompanyProfileSchema>;

export type PricingProfile = typeof pricingProfiles.$inferSelect;
export type InsertPricingProfile = z.infer<typeof insertPricingProfileSchema>;
