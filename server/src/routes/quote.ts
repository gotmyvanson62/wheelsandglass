import { Router, Request, Response, RequestHandler } from 'express';
import { z } from 'zod';
import { storage } from '../storage.js';
import { vinLookupService, VinLookupService } from '../services/vin-lookup.js';
import { insertQuoteSubmissionSchema, type InsertQuoteSubmission, type Customer } from '@shared/schema';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { upload, getFileInfo, cleanupFiles, type UploadedFileInfo } from '../middleware/upload.middleware.js';
import { emailService } from '../services/email.service.js';
import { techniciansStore, type Technician } from './technicians.js';

const router = Router();

// SECURITY: Allowed file types for uploads
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf'
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

// Division type for brand differentiation
const divisionSchema = z.enum(['glass', 'wheels']).default('glass');

// Validation schema for quote submission
const quoteSubmitSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  mobilePhone: z.string().min(1, 'Mobile phone is required'),
  email: z.string().email('Invalid email address'),
  location: z.string().min(1, 'Location is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  division: divisionSchema,
  privacyTinted: z.string().optional(),
  year: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  vin: z.string().optional(),
  licensePlate: z.string().optional(),
  notes: z.string().optional(),
  // Glass division: selected windows
  selectedWindows: z.array(z.string()).optional().default([]),
  // Wheels division: selected wheel positions
  selectedWheels: z.array(z.string()).optional().default([]),
  // SECURITY: File upload validation with type and size restrictions
  uploadedFiles: z.array(z.object({
    name: z.string().max(255, 'Filename too long'),
    size: z.number().max(MAX_FILE_SIZE, `File size must be under ${MAX_FILE_SIZE / 1024 / 1024}MB`),
    type: z.string().refine(
      (type) => ALLOWED_FILE_TYPES.includes(type),
      { message: `File type must be one of: ${ALLOWED_FILE_TYPES.join(', ')}` }
    )
  })).max(MAX_FILES, `Maximum ${MAX_FILES} files allowed`).optional().default([])
}).refine(data => {
  // Require appropriate selection based on division
  if (data.division === 'wheels') {
    return data.selectedWheels && data.selectedWheels.length > 0;
  }
  return data.selectedWindows && data.selectedWindows.length > 0;
}, {
  message: "Please select at least one item (window for glass, wheel for wheels)",
  path: ['selection']
});

/**
 * POST /api/quote/submit
 * Submit a new quote request from the public form
 * - Validates form data
 * - Auto-decodes VIN if provided
 * - Creates entry in quoteSubmissions table
 * - Logs the activity
 */
router.post('/submit', async (req: Request, res: Response) => {
  try {
    // [QUOTE API] Request received - strategic logging for end-to-end testing
    console.log('[QUOTE API] Request received:', {
      division: req.body.division || 'glass',
      email: req.body.email,
      phone: req.body.mobilePhone,
      vin: req.body.vin,
      serviceType: req.body.serviceType,
      windowCount: req.body.selectedWindows?.length || 0,
      wheelCount: req.body.selectedWheels?.length || 0,
      timestamp: new Date().toISOString()
    });

    // Validate request body
    const validationResult = quoteSubmitSchema.safeParse(req.body);

    if (!validationResult.success) {
      console.log('[QUOTE API] Validation failed:', validationResult.error.errors);
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const formData = validationResult.data;
    let vinDecodedData: { year?: string; make?: string; model?: string } = {};

    // Auto-decode VIN if provided and valid format
    if (formData.vin && VinLookupService.isValidVinFormat(formData.vin)) {
      try {
        const vinResult = await vinLookupService.lookupVin(formData.vin);

        if (vinResult.isValid) {
          // Enrich form data with VIN-decoded vehicle info
          vinDecodedData = {
            year: vinResult.year.toString(),
            make: vinResult.make,
            model: vinResult.model
          };
          console.log(`VIN ${formData.vin} decoded: ${vinResult.year} ${vinResult.make} ${vinResult.model}`);
        } else {
          console.log(`VIN ${formData.vin} could not be decoded, using provided values`);
        }
      } catch (vinError) {
        console.error('VIN lookup failed, continuing with form data:', vinError);
      }
    }

    // Find or create customer for this quote submission
    // This enables tracking multiple quotes per customer for warranty/insurance claims
    const customer = await storage.findOrCreateCustomer(
      formData.email,
      formData.mobilePhone,
      {
        firstName: formData.firstName,
        lastName: formData.lastName,
        postalCode: formData.zipCode,
      }
    );

    // [QUOTE API] Customer lookup/create result
    console.log('[QUOTE API] Customer:', {
      action: customer.createdAt === customer.updatedAt ? 'created' : 'found',
      customerId: customer.id,
      email: customer.primaryEmail
    });

    // Prepare quote submission data - use VIN-decoded values if available, otherwise form values
    const quoteSubmissionData: InsertQuoteSubmission = {
      customerId: customer.id, // Link to customer for history tracking
      firstName: formData.firstName,
      lastName: formData.lastName,
      mobilePhone: formData.mobilePhone,
      email: formData.email,
      location: formData.location,
      zipCode: formData.zipCode,
      serviceType: formData.serviceType,
      division: formData.division,
      privacyTinted: formData.privacyTinted || null,
      year: vinDecodedData.year || formData.year || null,
      make: vinDecodedData.make || formData.make || null,
      model: vinDecodedData.model || formData.model || null,
      vin: formData.vin || null,
      licensePlate: formData.licensePlate || null,
      notes: formData.notes || null,
      selectedWindows: formData.selectedWindows,
      selectedWheels: formData.selectedWheels,
      uploadedFiles: formData.uploadedFiles,
      status: 'submitted'
    };

    // Create the quote submission linked to customer
    const submission = await storage.createQuoteSubmission(quoteSubmissionData);

    // [QUOTE API] Quote created
    console.log('[QUOTE API] Quote created:', {
      submissionId: submission.id,
      customerId: customer.id,
      status: 'submitted',
      vinDecoded: !!vinDecodedData.year
    });

    // Log the activity
    await storage.createActivityLog({
      type: 'quote_submitted',
      message: `New ${formData.division === 'wheels' ? 'wheel repair' : 'glass'} quote request from ${formData.firstName} ${formData.lastName} (${formData.email})`,
      details: {
        submissionId: submission.id,
        customerId: customer.id,
        division: formData.division,
        serviceType: formData.serviceType,
        location: formData.location,
        vinDecoded: !!vinDecodedData.year,
        windowCount: formData.selectedWindows.length,
        wheelCount: formData.selectedWheels.length
      }
    });

    // Send confirmation email (async, don't block response)
    emailService.sendQuoteConfirmation({
      customerName: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      submissionId: submission.id,
      division: formData.division as 'glass' | 'wheels',
      serviceType: formData.serviceType,
      vehicleInfo: vinDecodedData.year ? {
        year: vinDecodedData.year,
        make: vinDecodedData.make || '',
        model: vinDecodedData.model || ''
      } : undefined
    }).catch(err => {
      console.error('Failed to send quote confirmation email:', err);
    });

    // Return success with submission ID and customer ID
    res.status(201).json({
      success: true,
      submissionId: submission.id,
      customerId: customer.id,
      message: 'Quote request submitted successfully',
      vinDecoded: !!vinDecodedData.year,
      vehicleInfo: vinDecodedData.year ? {
        year: vinDecodedData.year,
        make: vinDecodedData.make,
        model: vinDecodedData.model
      } : null
    });

  } catch (error) {
    console.error('Quote submission error:', error);
    res.status(500).json({
      error: 'Failed to submit quote request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/quote/submit-with-files
 * Submit a new quote request with actual file uploads
 * - Handles multipart/form-data with files
 * - Stores files on disk
 * - Creates entry in quoteSubmissions table with file paths
 */
router.post('/submit-with-files', upload.array('files', 5) as unknown as RequestHandler, async (req: Request, res: Response) => {
  const uploadedFiles = req.files as Express.Multer.File[] || [];

  try {
    // Parse the JSON data field
    let formDataRaw;
    try {
      formDataRaw = JSON.parse(req.body.data || '{}');
    } catch (parseError) {
      await cleanupFiles(uploadedFiles);
      return res.status(400).json({
        error: 'Invalid form data',
        message: 'Could not parse JSON data field'
      });
    }

    // Log request
    console.log('[QUOTE API] File upload request received:', {
      division: formDataRaw.division || 'glass',
      email: formDataRaw.email,
      fileCount: uploadedFiles.length,
      timestamp: new Date().toISOString()
    });

    // Validate request body
    const validationResult = quoteSubmitSchema.safeParse({
      ...formDataRaw,
      // Clear uploadedFiles since we handle actual files separately
      uploadedFiles: []
    });

    if (!validationResult.success) {
      console.log('[QUOTE API] Validation failed:', validationResult.error.errors);
      await cleanupFiles(uploadedFiles);
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const formData = validationResult.data;
    let vinDecodedData: { year?: string; make?: string; model?: string } = {};

    // Auto-decode VIN if provided and valid format
    if (formData.vin && VinLookupService.isValidVinFormat(formData.vin)) {
      try {
        const vinResult = await vinLookupService.lookupVin(formData.vin);
        if (vinResult.isValid) {
          vinDecodedData = {
            year: vinResult.year.toString(),
            make: vinResult.make,
            model: vinResult.model
          };
          console.log(`VIN ${formData.vin} decoded: ${vinResult.year} ${vinResult.make} ${vinResult.model}`);
        }
      } catch (vinError) {
        console.error('VIN lookup failed, continuing with form data:', vinError);
      }
    }

    // Find or create customer
    const customer = await storage.findOrCreateCustomer(
      formData.email,
      formData.mobilePhone,
      {
        firstName: formData.firstName,
        lastName: formData.lastName,
        postalCode: formData.zipCode,
      }
    );

    console.log('[QUOTE API] Customer:', {
      action: customer.createdAt === customer.updatedAt ? 'created' : 'found',
      customerId: customer.id,
      email: customer.primaryEmail
    });

    // Process uploaded files and get their info
    const fileInfoList: UploadedFileInfo[] = uploadedFiles.map(file => getFileInfo(file));

    // Prepare quote submission data with actual file paths
    const quoteSubmissionData: InsertQuoteSubmission = {
      customerId: customer.id,
      firstName: formData.firstName,
      lastName: formData.lastName,
      mobilePhone: formData.mobilePhone,
      email: formData.email,
      location: formData.location,
      zipCode: formData.zipCode,
      serviceType: formData.serviceType,
      division: formData.division,
      privacyTinted: formData.privacyTinted || null,
      year: vinDecodedData.year || formData.year || null,
      make: vinDecodedData.make || formData.make || null,
      model: vinDecodedData.model || formData.model || null,
      vin: formData.vin || null,
      licensePlate: formData.licensePlate || null,
      notes: formData.notes || null,
      selectedWindows: formData.selectedWindows,
      selectedWheels: formData.selectedWheels,
      // Store actual file info instead of just metadata
      uploadedFiles: fileInfoList.map(f => ({
        name: f.originalName,
        storedName: f.storedName,
        size: f.size,
        type: f.mimeType,
        path: f.path,
        uploadedAt: f.uploadedAt
      })),
      status: 'submitted'
    };

    // Create the quote submission
    const submission = await storage.createQuoteSubmission(quoteSubmissionData);

    console.log('[QUOTE API] Quote created with files:', {
      submissionId: submission.id,
      customerId: customer.id,
      fileCount: fileInfoList.length,
      files: fileInfoList.map(f => ({ name: f.originalName, size: f.size }))
    });

    // Log the activity
    await storage.createActivityLog({
      type: 'quote_submitted',
      message: `New ${formData.division === 'wheels' ? 'wheel repair' : 'glass'} quote request from ${formData.firstName} ${formData.lastName} with ${fileInfoList.length} file(s)`,
      details: {
        submissionId: submission.id,
        customerId: customer.id,
        division: formData.division,
        serviceType: formData.serviceType,
        location: formData.location,
        vinDecoded: !!vinDecodedData.year,
        windowCount: formData.selectedWindows.length,
        wheelCount: formData.selectedWheels.length,
        uploadedFileCount: fileInfoList.length
      }
    });

    res.status(201).json({
      success: true,
      submissionId: submission.id,
      customerId: customer.id,
      message: 'Quote request submitted successfully with files',
      vinDecoded: !!vinDecodedData.year,
      uploadedFiles: fileInfoList.length,
      vehicleInfo: vinDecodedData.year ? {
        year: vinDecodedData.year,
        make: vinDecodedData.make,
        model: vinDecodedData.model
      } : null
    });

  } catch (error) {
    console.error('Quote submission with files error:', error);
    // Cleanup uploaded files on error
    await cleanupFiles(uploadedFiles);
    res.status(500).json({
      error: 'Failed to submit quote request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/quote/submissions
 * List all quote submissions (admin use)
 * Supports filtering by status, date range, and search
 * SECURITY: Requires authentication
 */
router.get('/submissions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { status, search, limit = '50', offset = '0' } = req.query;

    // Get all submissions
    let submissions = await storage.getQuoteSubmissions();

    // Apply filters
    if (status && typeof status === 'string') {
      submissions = submissions.filter((s: any) => s.status === status);
    }

    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      submissions = submissions.filter((s: any) =>
        s.firstName.toLowerCase().includes(searchLower) ||
        s.lastName.toLowerCase().includes(searchLower) ||
        s.email.toLowerCase().includes(searchLower) ||
        (s.vin && s.vin.toLowerCase().includes(searchLower))
      );
    }

    // Sort by timestamp descending (newest first)
    submissions.sort((a: any, b: any) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply pagination
    const limitNum = parseInt(limit as string) || 50;
    const offsetNum = parseInt(offset as string) || 0;
    const paginatedSubmissions = submissions.slice(offsetNum, offsetNum + limitNum);

    res.json({
      submissions: paginatedSubmissions,
      total: submissions.length,
      limit: limitNum,
      offset: offsetNum
    });

  } catch (error) {
    console.error('Error fetching quote submissions:', error);
    res.status(500).json({
      error: 'Failed to fetch quote submissions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/quote/submissions/:id
 * Get a single quote submission by ID
 * SECURITY: Requires authentication
 */
router.get('/submissions/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }

    const submissions = await storage.getQuoteSubmissions();
    const submission = submissions.find((s: any) => s.id === id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(submission);

  } catch (error) {
    console.error('Error fetching quote submission:', error);
    res.status(500).json({
      error: 'Failed to fetch quote submission',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/quote/submissions/:id
 * Update a quote submission status
 * SECURITY: Requires authentication
 */
router.put('/submissions/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }

    const validStatuses = ['submitted', 'processed', 'quoted', 'converted', 'archived'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        validStatuses
      });
    }

    // Get current submission to verify it exists
    const submissions = await storage.getQuoteSubmissions();
    const submission = submissions.find((s: any) => s.id === id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Actually update the quote submission status in storage
    const updated = await storage.updateQuoteSubmission(id, { status });
    if (!updated) {
      return res.status(500).json({ error: 'Failed to update submission' });
    }

    // Log the status change
    await storage.createActivityLog({
      type: 'quote_status_updated',
      message: `Quote submission ${id} status changed to ${status}`,
      details: {
        submissionId: id,
        previousStatus: submission.status,
        newStatus: status
      }
    });

    res.json({
      success: true,
      message: `Quote submission ${id} status updated to ${status}`,
      submissionId: id,
      status,
      submission: updated
    });

  } catch (error) {
    console.error('Error updating quote submission:', error);
    res.status(500).json({
      error: 'Failed to update quote submission',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/quote/submissions/:id/convert-to-job
 * Convert a quote submission to a job
 * Creates a new job record and updates quote status to 'converted'
 * SECURITY: Requires authentication
 */
router.post('/submissions/:id/convert-to-job', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }

    // Get the quote submission
    const submissions = await storage.getQuoteSubmissions();
    const submission = submissions.find((s: any) => s.id === id);

    if (!submission) {
      return res.status(404).json({ error: 'Quote submission not found' });
    }

    // Check if already converted
    if (submission.status === 'converted') {
      return res.status(400).json({ error: 'Quote has already been converted to a job' });
    }

    // Create a new transaction (job) from the quote data
    // In this system, jobs are represented as transactions
    const transactionData = {
      customerId: submission.customerId,
      customerName: `${submission.firstName} ${submission.lastName}`,
      customerEmail: submission.email,
      customerPhone: submission.mobilePhone,
      vehicleYear: submission.year || null,
      vehicleMake: submission.make || null,
      vehicleModel: submission.model || null,
      vehicleVin: submission.vin || null,
      damageDescription: submission.serviceType,
      status: 'pending',
      paymentStatus: 'pending' as const,
      sourceType: 'customer',
      formData: {
        quoteSubmissionId: submission.id,
        division: submission.division,
        serviceType: submission.serviceType,
        location: submission.location,
        zipCode: submission.zipCode,
        selectedWindows: submission.selectedWindows,
        selectedWheels: submission.selectedWheels,
        notes: submission.notes,
        privacyTinted: submission.privacyTinted,
      },
    };

    const job = await storage.createTransaction(transactionData);

    // Auto-assign technician based on ZIP code
    let assignedTechnician: Technician | null = null;
    const zipCode = submission.zipCode;
    if (zipCode) {
      const technicians = Array.from(techniciansStore.values());
      const matching = technicians
        .filter(t => t.zipCodes?.includes(zipCode) && t.status === 'available')
        .sort((a, b) => (b.rating || 0) - (a.rating || 0));

      if (matching.length > 0) {
        assignedTechnician = matching[0];

        // Update job with technician assignment
        await storage.updateTransaction(job.id, {
          formData: {
            ...transactionData.formData,
            assignedTechnicianId: assignedTechnician.id,
            assignedTechnicianName: assignedTechnician.name,
            assignedTechnicianPhone: assignedTechnician.phone,
          }
        });

        // Log technician assignment
        await storage.createActivityLog({
          type: 'technician_auto_assigned',
          message: `Technician ${assignedTechnician.name} auto-assigned to Job #${job.id} (ZIP: ${zipCode})`,
          details: {
            jobId: job.id,
            technicianId: assignedTechnician.id,
            technicianName: assignedTechnician.name,
            zipCode,
            matchedFrom: 'zip_code_coverage'
          }
        });

        console.log(`[QUOTE API] Technician ${assignedTechnician.name} auto-assigned to Job #${job.id}`);
      } else {
        console.log(`[QUOTE API] No available technician found for ZIP ${zipCode}`);
      }
    }

    // Update quote status to 'converted'
    await storage.updateQuoteSubmission(id, {
      status: 'converted',
      processedAt: new Date()
    });

    // Log the conversion activity
    await storage.createActivityLog({
      type: 'quote_converted_to_job',
      message: `Quote #${id} converted to Job #${job.id} for ${submission.firstName} ${submission.lastName}`,
      details: {
        quoteId: id,
        jobId: job.id,
        customerId: submission.customerId,
        division: submission.division,
        serviceType: submission.serviceType,
        assignedTechnicianId: assignedTechnician?.id || null,
        assignedTechnicianName: assignedTechnician?.name || null
      }
    });

    console.log(`[QUOTE API] Quote #${id} converted to Job #${job.id}`);

    res.json({
      success: true,
      message: assignedTechnician
        ? `Quote converted to job and assigned to ${assignedTechnician.name}`
        : 'Quote successfully converted to job (no technician assigned)',
      jobId: job.id,
      quoteId: id,
      assignedTechnician: assignedTechnician ? {
        id: assignedTechnician.id,
        name: assignedTechnician.name,
        phone: assignedTechnician.phone
      } : null
    });

  } catch (error) {
    console.error('Error converting quote to job:', error);
    res.status(500).json({
      error: 'Failed to convert quote to job',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/quote/stats
 * Get quote submission statistics for dashboard
 * Optimized: Single pass through data instead of 8 separate filters
 * SECURITY: Requires authentication
 */
router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const submissions = await storage.getQuoteSubmissions();

    // Time boundaries computed once
    const now = Date.now();
    const dayAgo = now - (24 * 60 * 60 * 1000);
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);

    // Single pass through all submissions - O(n) instead of O(n) × 8
    const stats = {
      total: submissions.length,
      submitted: 0,
      processed: 0,
      quoted: 0,
      converted: 0,
      archived: 0,
      last24Hours: 0,
      last7Days: 0
    };

    for (const s of submissions) {
      // Count by status
      switch (s.status) {
        case 'submitted': stats.submitted++; break;
        case 'processed': stats.processed++; break;
        case 'quoted': stats.quoted++; break;
        case 'converted': stats.converted++; break;
        case 'archived': stats.archived++; break;
      }

      // Count by time
      const submissionTime = new Date(s.timestamp).getTime();
      if (submissionTime > dayAgo) {
        stats.last24Hours++;
        stats.last7Days++; // If within 24h, also within 7d
      } else if (submissionTime > weekAgo) {
        stats.last7Days++;
      }
    }

    res.json(stats);

  } catch (error) {
    console.error('Error fetching quote stats:', error);
    res.status(500).json({
      error: 'Failed to fetch quote statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/quote/submissions/:id
 * Delete a quote submission
 * SECURITY: Requires authentication
 */
router.delete('/submissions/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid quote ID' });
    }

    const success = await storage.deleteQuoteSubmission(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Quote not found' });
    }

    await storage.createActivityLog({
      type: 'quote_deleted',
      message: `Quote ${id} deleted`,
      details: { quoteId: id }
    });

    res.json({ success: true, message: 'Quote deleted successfully' });
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete quote',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
