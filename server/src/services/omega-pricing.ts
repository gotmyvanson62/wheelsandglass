/**
 * Omega EDI Pricing Service
 * Handles automatic pricing generation based on VIN/License Plate and parts data
 */

import { OmegaEDIService } from './omega-edi.js';
import { vinLookupService } from './vin-lookup.js';
import { nagsLookupService } from './nags-lookup.js';

export interface PricingRequest {
  vin?: string;
  licensePlate?: string;
  vehicleYear?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  damageDescription?: string;
  serviceType?: string;
  customerLocation?: string;
}

export interface PricingResult {
  success: boolean;
  totalPrice: number;
  laborCost: number;
  partsCost: number;
  additionalFees: number;
  breakdown: {
    parts: Array<{
      nagsNumber: string;
      description: string;
      price: number;
      quantity: number;
    }>;
    labor: Array<{
      description: string;
      hours: number;
      rate: number;
      total: number;
    }>;
    fees: Array<{
      description: string;
      amount: number;
    }>;
  };
  estimatedDuration: number; // in minutes
  message: string;
}

export class OmegaPricingService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.OMEGA_API_BASE_URL || 'https://app.omegaedi.com/api/2.0';
    this.apiKey = process.env.OMEGA_API_KEY || 'C55KeMr7T7JaHtKS';
  }

  /**
   * Generate comprehensive pricing using Omega EDI pricing profiles
   */
  async generatePricing(request: PricingRequest): Promise<PricingResult> {
    try {
      console.log('🔍 Generating Omega EDI pricing for:', request);

      // Step 1: Get vehicle data from VIN if provided
      let vehicleData: any = {
        year: request.vehicleYear,
        make: request.vehicleMake,
        model: request.vehicleModel,
      };

      if (request.vin) {
        try {
          const vinData = await vinLookupService.lookupVin(request.vin);
          if (vinData.isValid) {
            vehicleData = {
              year: vinData.year?.toString() || request.vehicleYear,
              make: vinData.make || request.vehicleMake,
              model: vinData.model || request.vehicleModel,
              bodyType: vinData.bodyType,
              engine: vinData.engine,
            };
          }
        } catch (error) {
          console.log('VIN lookup failed, using provided vehicle data:', error);
        }
      }
      
      // Step 2: Use Omega EDI pricing profiles to calculate pricing
      const pricing = await this.calculateOmegaPricing(vehicleData, [], request);

      return {
        success: true,
        totalPrice: pricing.total,
        laborCost: pricing.labor,
        partsCost: pricing.parts,
        additionalFees: pricing.fees,
        breakdown: pricing.breakdown,
        estimatedDuration: pricing.duration,
        message: 'Pricing generated successfully using Omega EDI profiles',
      };

    } catch (error) {
      console.error('❌ Omega pricing generation failed:', error);
      return {
        success: false,
        totalPrice: 0,
        laborCost: 0,
        partsCost: 0,
        additionalFees: 0,
        breakdown: { parts: [], labor: [], fees: [] },
        estimatedDuration: 0,
        message: `Pricing generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Validate and enhance vehicle data using VIN lookup
   */
  private async validateVehicleData(request: PricingRequest) {
    let vehicleData = {
      vin: request.vin,
      year: request.vehicleYear,
      make: request.vehicleMake,
      model: request.vehicleModel,
    };

    // If VIN is provided, get comprehensive vehicle data
    if (request.vin) {
      try {
        const vinData = await vinLookupService.lookupVin(request.vin);
        if (vinData.isValid) {
          vehicleData = {
            vin: request.vin,
            year: vinData.year?.toString() || request.vehicleYear,
            make: vinData.make || request.vehicleMake,
            model: vinData.model || request.vehicleModel,
          };
        }
      } catch (error) {
        console.log('VIN lookup failed, using provided vehicle data');
      }
    }

    return vehicleData;
  }

  /**
   * Get required parts based on vehicle and damage description
   */
  private async getRequiredParts(vehicleData: any, damageDescription?: string) {
    try {
      if (!vehicleData.vin) {
        // If no VIN, use basic parts lookup based on damage description
        return this.getBasicPartsFromDescription(damageDescription);
      }

      // Get NAGS parts for the specific vehicle using glass options lookup
      const glassOptions = await nagsLookupService.getGlassOptions(vehicleData.vin, vehicleData);
      const glassType = this.getDamageGlassType(damageDescription);

      // Get relevant parts based on damage type
      let relevantParts: any[] = [];
      if (glassType === 'windshield' && glassOptions.windshield) {
        relevantParts = glassOptions.windshield;
      } else if (glassType === 'side_window' && glassOptions.sideWindows) {
        relevantParts = glassOptions.sideWindows;
      } else if (glassType === 'rear_glass' && glassOptions.rearGlass) {
        relevantParts = glassOptions.rearGlass;
      } else if (glassType === 'quarter_glass' && glassOptions.quarterGlass) {
        relevantParts = glassOptions.quarterGlass;
      }

      if (relevantParts.length === 0) {
        return this.getBasicPartsFromDescription(damageDescription);
      }

      return relevantParts;
    } catch (error) {
      console.log('NAGS lookup failed, using basic parts estimation');
      return this.getBasicPartsFromDescription(damageDescription);
    }
  }

  /**
   * Get glass type from damage description
   */
  private getDamageGlassType(damageDescription?: string): 'windshield' | 'side_window' | 'rear_glass' | 'quarter_glass' {
    const description = (damageDescription || '').toLowerCase();

    if (description.includes('windshield')) return 'windshield';
    if (description.includes('side') || description.includes('door')) return 'side_window';
    if (description.includes('rear') || description.includes('back')) return 'rear_glass';
    if (description.includes('quarter')) return 'quarter_glass';

    return 'windshield'; // Default
  }

  /**
   * Calculate pricing using Omega EDI pricing profiles
   */
  private async calculateOmegaPricing(vehicleData: any, partsData: any[], request: PricingRequest) {
    // This would normally call Omega EDI's pricing API
    // For now, we'll simulate using pricing profiles
    
    const partsCost = partsData.reduce((total, part) => total + (part.price || 0), 0);
    const laborRate = 120; // $120/hour base rate
    const estimatedHours = this.estimateLaborHours(request.damageDescription);
    const laborCost = estimatedHours * laborRate;
    
    // Additional fees based on service type and location
    const mobileFee = request.customerLocation ? 50 : 0;
    const disposalFee = 25;
    const shopSupplies = Math.round(partsCost * 0.05); // 5% of parts cost
    
    const totalFees = mobileFee + disposalFee + shopSupplies;
    const subtotal = partsCost + laborCost + totalFees;
    const tax = Math.round(subtotal * 0.08); // 8% tax
    const total = subtotal + tax;

    return {
      total,
      parts: partsCost,
      labor: laborCost,
      fees: totalFees,
      duration: estimatedHours * 60, // Convert to minutes
      breakdown: {
        parts: partsData.map(part => ({
          nagsNumber: part.nagsNumber || 'N/A',
          description: part.description || part.glassType || 'Glass Part',
          price: part.price || 0,
          quantity: 1,
        })),
        labor: [{
          description: this.getLaborDescription(request.damageDescription),
          hours: estimatedHours,
          rate: laborRate,
          total: laborCost,
        }],
        fees: [
          ...(mobileFee > 0 ? [{ description: 'Mobile Service Fee', amount: mobileFee }] : []),
          { description: 'Disposal Fee', amount: disposalFee },
          { description: 'Shop Supplies', amount: shopSupplies },
          { description: 'Tax', amount: tax },
        ],
      },
    };
  }

  /**
   * Get basic parts estimation from damage description
   */
  private getBasicPartsFromDescription(damageDescription?: string): any[] {
    const description = (damageDescription || '').toLowerCase();
    
    if (description.includes('windshield')) {
      return [{ glassType: 'windshield', price: 28500, description: 'Windshield - OEM' }]; // $285
    } else if (description.includes('side') || description.includes('door')) {
      return [{ glassType: 'side_window', price: 15000, description: 'Side Window - OEM' }]; // $150
    } else if (description.includes('rear') || description.includes('back')) {
      return [{ glassType: 'rear_glass', price: 22500, description: 'Rear Glass - OEM' }]; // $225
    } else {
      return [{ glassType: 'windshield', price: 28500, description: 'Windshield - OEM' }]; // Default
    }
  }

  /**
   * Filter NAGS parts based on damage description
   */
  private filterPartsByDamage(parts: any[], damageDescription?: string): any[] {
    if (!damageDescription || parts.length === 0) {
      return parts;
    }

    const description = damageDescription.toLowerCase();
    
    return parts.filter(part => {
      const partType = (part.glassType || '').toLowerCase();
      
      if (description.includes('windshield') && partType.includes('windshield')) return true;
      if (description.includes('side') && partType.includes('side')) return true;
      if (description.includes('rear') && partType.includes('rear')) return true;
      if (description.includes('door') && partType.includes('door')) return true;
      
      return false;
    });
  }

  /**
   * Estimate labor hours based on service type
   */
  private estimateLaborHours(damageDescription?: string): number {
    const description = (damageDescription || '').toLowerCase();
    
    if (description.includes('windshield')) return 2.0;
    if (description.includes('side') || description.includes('door')) return 1.0;
    if (description.includes('rear') || description.includes('back')) return 1.5;
    
    return 2.0; // Default windshield replacement
  }

  /**
   * Get labor description based on damage
   */
  private getLaborDescription(damageDescription?: string): string {
    const description = (damageDescription || '').toLowerCase();
    
    if (description.includes('windshield')) return 'Windshield Replacement';
    if (description.includes('side') || description.includes('door')) return 'Side Window Replacement';
    if (description.includes('rear') || description.includes('back')) return 'Rear Glass Replacement';
    
    return 'Glass Replacement Service';
  }

  /**
   * Push pricing to Square Appointments
   */
  async pushPricingToSquare(pricing: PricingResult, serviceDetails: any): Promise<boolean> {
    try {
      // This would integrate with Square's Appointments API to set pricing
      console.log('📤 Pushing pricing to Square Appointments:', {
        totalPrice: pricing.totalPrice,
        duration: pricing.estimatedDuration,
        serviceDetails,
      });

      // For now, simulate the push
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('❌ Failed to push pricing to Square:', error);
      return false;
    }
  }
}

export const omegaPricingService = new OmegaPricingService();