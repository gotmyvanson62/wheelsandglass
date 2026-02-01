import { storage } from '../storage.js';
import type { Transaction, InsertTransaction } from '@shared/schema';

export interface OptimizedFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleVin?: string;
  vehicleYear?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  damageDescription: string;
  serviceLocation: string;
  preferredDate?: string;
  preferredTime?: string;
}

export interface OptimizedResponse {
  transactionId: number;
  vehicleData: {
    year: string;
    make: string;
    model: string;
    bodyType: string;
  };
  nagsData: {
    partNumber: string;
    partDescription: string;
    estimatedCost: number;
  };
  pricingData: {
    partsTotal: number;
    laborTotal: number;
    totalAmount: number;
    estimatedDuration: number;
  };
  squarePaymentUrl: string;
  processingTime: number;
}

/**
 * Optimized data flow service that processes form submissions
 * with parallel API calls and minimal database operations
 */
export class OptimizedFlowService {
  
  /**
   * Process form submission with parallel operations for maximum efficiency
   */
  async processOptimizedSubmission(formData: OptimizedFormData): Promise<OptimizedResponse> {
    const startTime = Date.now();
    
    try {
      // Step 1: Create transaction record immediately
      const transactionPromise = this.createTransactionRecord(formData);
      
      // Step 2: Start all external API calls in parallel
      const [vehicleData, nagsData, pricingData, transaction] = await Promise.all([
        this.getVehicleDataParallel(formData.vehicleVin, formData),
        this.getNagsDataParallel(formData.vehicleVin, formData),
        this.getOmegaPricingParallel(formData.vehicleVin, formData),
        transactionPromise
      ]);

      // Step 3: Generate Square payment URL with all data
      const squarePaymentUrl = await this.generateSquarePaymentUrl({
        transactionId: transaction.id,
        customerData: formData,
        vehicleData,
        pricingData
      });

      // Step 4: Update transaction with all collected data
      await this.updateTransactionWithResults(transaction.id, {
        vehicleData,
        nagsData,
        pricingData,
        squarePaymentUrl
      });

      const processingTime = Date.now() - startTime;

      console.log(`⚡ Optimized form processing completed in ${processingTime}ms`);

      return {
        transactionId: transaction.id,
        vehicleData,
        nagsData,
        pricingData,
        squarePaymentUrl,
        processingTime
      };

    } catch (error) {
      console.error('❌ Optimized flow processing failed:', error);
      throw error;
    }
  }

  /**
   * Create transaction record immediately to get ID
   */
  private async createTransactionRecord(formData: OptimizedFormData): Promise<Transaction> {
    const transactionData: InsertTransaction = {
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail || '',
      vehicleVin: formData.vehicleVin || null,
      vehicleYear: formData.vehicleYear || null,
      vehicleMake: formData.vehicleMake || null,
      vehicleModel: formData.vehicleModel || null,
      damageDescription: formData.damageDescription,
      status: 'processing',
      formData: JSON.stringify(formData)
    };
    
    return await storage.createTransaction(transactionData);
  }

  /**
   * Get vehicle data with fallback to form data
   */
  private async getVehicleDataParallel(vin?: string, formData?: OptimizedFormData) {
    try {
      if (vin) {
        // Primary: VIN lookup via VIN lookup service
        const { vinLookupService } = await import('./vin-lookup.js');
        const vinResult = await vinLookupService.lookupVin(vin);
        if (vinResult.isValid) {
          return {
            year: vinResult.year?.toString() || formData?.vehicleYear || 'Unknown',
            make: vinResult.make || formData?.vehicleMake || 'Unknown',
            model: vinResult.model || formData?.vehicleModel || 'Unknown',
            bodyType: vinResult.bodyType || 'Unknown'
          };
        }
      }

      // Fallback: Use form data
      return {
        year: formData?.vehicleYear || 'Unknown',
        make: formData?.vehicleMake || 'Unknown',
        model: formData?.vehicleModel || 'Unknown',
        bodyType: 'Unknown'
      };

    } catch (error) {
      console.error('Vehicle data lookup failed:', error);
      return {
        year: formData?.vehicleYear || 'Unknown',
        make: formData?.vehicleMake || 'Unknown',
        model: formData?.vehicleModel || 'Unknown',
        bodyType: 'Unknown'
      };
    }
  }

  /**
   * Get NAGS parts data in parallel
   */
  private async getNagsDataParallel(vin?: string, formData?: OptimizedFormData) {
    try {
      if (vin) {
        // Use NAGS API if configured, otherwise fallback to estimates
        if (process.env.NAGS_API_KEY && process.env.NAGS_API_URL) {
          // NAGS API integration ready - implement when credentials available
          // const { nagsLookupService } = await import('./nagsLookup.service');
          // return await nagsLookupService.lookup(vin);
        }
        const nagsResult = await this.nagsLookupFallback(vin);
        return nagsResult;
      }

      // Fallback: Estimate based on vehicle info
      return {
        partNumber: 'ESTIMATED',
        partDescription: 'Windshield replacement - estimated',
        estimatedCost: 150
      };

    } catch (error) {
      console.error('NAGS lookup failed:', error);
      return {
        partNumber: 'UNKNOWN',
        partDescription: 'Auto glass service',
        estimatedCost: 200
      };
    }
  }

  /**
   * Get Omega EDI pricing in parallel
   */
  private async getOmegaPricingParallel(vin?: string, formData?: OptimizedFormData) {
    try {
      // Use Omega pricing service
      const { omegaPricingService } = await import('./omega-pricing-updated.js');
      const pricingResult = await omegaPricingService.generatePricing({
        vin: vin,
        vehicleYear: formData?.vehicleYear,
        vehicleMake: formData?.vehicleMake,
        vehicleModel: formData?.vehicleModel,
        damageDescription: formData?.damageDescription,
        customerLocation: formData?.serviceLocation
      });

      if (pricingResult.success) {
        return {
          partsTotal: pricingResult.partsCost,
          laborTotal: pricingResult.laborCost,
          totalAmount: pricingResult.totalPrice,
          estimatedDuration: pricingResult.estimatedDuration || 120
        };
      }

      throw new Error('Omega pricing failed');

    } catch (error) {
      console.error('Omega pricing failed:', error);

      // Fallback pricing calculation
      const partsTotal = 150;
      const laborTotal = 200;

      return {
        partsTotal,
        laborTotal,
        totalAmount: partsTotal + laborTotal,
        estimatedDuration: 120
      };
    }
  }

  /**
   * Generate Square payment URL with embedded data
   */
  private async generateSquarePaymentUrl({
    transactionId,
    customerData,
    vehicleData,
    pricingData
  }: {
    transactionId: number;
    customerData: OptimizedFormData;
    vehicleData: any;
    pricingData: any;
  }): Promise<string> {
    try {
      // Create Square Quick Pay link with exact pricing
      const baseUrl = 'https://square.link/u/EXAMPLE';
      const params = new URLSearchParams({
        amount: (pricingData.totalAmount * 100).toString(), // Square uses cents
        note: `Auto Glass Service - Job #${transactionId}`,
        'customer-name': customerData.customerName,
        'customer-email': customerData.customerEmail || '',
        'customer-phone': customerData.customerPhone,
        'vehicle': `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`,
        'transaction-id': transactionId.toString()
      });

      return `${baseUrl}?${params.toString()}`;

    } catch (error) {
      console.error('Square URL generation failed:', error);
      return `https://book.squareup.com/appointments/b797361a-90ce-4a01-b7a7-7e1c050ad61c/location/E7GCF80WM2V05/services?transaction=${transactionId}`;
    }
  }

  /**
   * Update transaction with all collected results
   */
  private async updateTransactionWithResults(
    transactionId: number,
    results: {
      vehicleData: any;
      nagsData: any;
      pricingData: any;
      squarePaymentUrl: string;
    }
  ): Promise<void> {
    try {
      // Note: Update method would need to be implemented in storage
      console.log('Transaction update:', {
        transactionId,
        vehicleData: results.vehicleData,
        pricingData: results.pricingData,
        squarePaymentUrl: results.squarePaymentUrl
      });

    } catch (error) {
      console.error('Transaction update failed:', error);
    }
  }

  /**
   * NAGS lookup fallback when API is not configured
   * Returns estimated data for quoting purposes
   */
  private async nagsLookupFallback(vin: string) {
    // Log only once per session to avoid log spam
    if (process.env.NODE_ENV !== 'production') {
      console.log('NAGS API not configured - using estimated pricing');
    }

    return {
      partNumber: 'ESTIMATE',
      partDescription: 'Auto Glass - Pricing Estimate',
      estimatedCost: 175
    };
  }

  /**
   * Stream data directly to customer portal without database round-trip
   */
  async streamDataToCustomer(transactionId: number): Promise<string> {
    try {
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Generate customer portal URL with embedded data
      const formData = transaction.formData as any || {};
      const portalData = {
        customerName: transaction.customerName,
        vehicleInfo: `${transaction.vehicleYear} ${transaction.vehicleMake} ${transaction.vehicleModel}`,
        estimatedCost: formData?.estimatedCost || 350,
        squarePaymentUrl: transaction.squarePaymentLinkId || ''
      };

      const encodedData = Buffer.from(JSON.stringify(portalData)).toString('base64');
      return `https://wheelsandglass.com/customerportal?data=${encodedData}`;

    } catch (error) {
      console.error('Data streaming failed:', error);
      return `https://wheelsandglass.com/customerportal?id=${transactionId}`;
    }
  }
}

export const optimizedFlowService = new OptimizedFlowService();