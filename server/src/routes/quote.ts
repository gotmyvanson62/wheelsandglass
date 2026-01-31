import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage.js';
import { vinLookupService, VinLookupService } from '../services/vin-lookup.js';
import { insertQuoteSubmissionSchema, type InsertQuoteSubmission, type Customer } from '@shared/schema';

const router = Router();

// Validation schema for quote submission
const quoteSubmitSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  mobilePhone: z.string().min(1, 'Mobile phone is required'),
  email: z.string().email('Invalid email address'),
  location: z.string().min(1, 'Location is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  privacyTinted: z.string().optional(),
  year: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  vin: z.string().optional(),
  licensePlate: z.string().optional(),
  notes: z.string().optional(),
  selectedWindows: z.array(z.string()).min(1, 'Please select at least one window'),
  uploadedFiles: z.array(z.object({
    name: z.string(),
    size: z.number(),
    type: z.string()
  })).optional().default([])
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
      email: req.body.email,
      phone: req.body.mobilePhone,
      vin: req.body.vin,
      serviceType: req.body.serviceType,
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
      privacyTinted: formData.privacyTinted || null,
      year: vinDecodedData.year || formData.year || null,
      make: vinDecodedData.make || formData.make || null,
      model: vinDecodedData.model || formData.model || null,
      vin: formData.vin || null,
      notes: formData.notes || null,
      selectedWindows: formData.selectedWindows,
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
      message: `New quote request from ${formData.firstName} ${formData.lastName} (${formData.email})`,
      details: {
        submissionId: submission.id,
        customerId: customer.id,
        serviceType: formData.serviceType,
        location: formData.location,
        vinDecoded: !!vinDecodedData.year,
        windowCount: formData.selectedWindows.length
      }
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
 * GET /api/quote/submissions
 * List all quote submissions (admin use)
 * Supports filtering by status, date range, and search
 */
router.get('/submissions', async (req: Request, res: Response) => {
  try {
    const { status, search, limit = '50', offset = '0' } = req.query;

    // Get all submissions
    let submissions = await storage.getQuoteSubmissions();

    // Apply filters
    if (status && typeof status === 'string') {
      submissions = submissions.filter(s => s.status === status);
    }

    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      submissions = submissions.filter(s =>
        s.firstName.toLowerCase().includes(searchLower) ||
        s.lastName.toLowerCase().includes(searchLower) ||
        s.email.toLowerCase().includes(searchLower) ||
        (s.vin && s.vin.toLowerCase().includes(searchLower))
      );
    }

    // Sort by timestamp descending (newest first)
    submissions.sort((a, b) =>
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
 */
router.get('/submissions/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }

    const submissions = await storage.getQuoteSubmissions();
    const submission = submissions.find(s => s.id === id);

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
 */
router.put('/submissions/:id', async (req: Request, res: Response) => {
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
    const submission = submissions.find(s => s.id === id);

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
 * GET /api/quote/stats
 * Get quote submission statistics for dashboard
 * Optimized: Single pass through data instead of 8 separate filters
 */
router.get('/stats', async (req: Request, res: Response) => {
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

export default router;
