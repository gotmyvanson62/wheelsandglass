import axios from 'axios';
import type { InsertNagsPart, NagsPart, VehicleLookup } from '@shared/schema';
import { storage } from '../storage.js';

export interface NagsPartOption {
  nagsNumber: string;
  description: string;
  glassType: 'windshield' | 'side_window' | 'rear_glass' | 'quarter_glass';
  position?: string;
  partType: 'OEM' | 'aftermarket' | 'OEE';
  manufacturer?: string;
  price: number; // in cents
  availability: 'in_stock' | 'order_required' | 'unavailable';
  leadTime: number; // days
  supplierInfo?: any;
}

export interface GlassSelectionOptions {
  windshield?: NagsPartOption[];
  sideWindows?: NagsPartOption[];
  rearGlass?: NagsPartOption[];
  quarterGlass?: NagsPartOption[];
}

export class NagsLookupService {
  private omegaApiKey: string;
  private omegaBaseUrl: string;

  constructor(omegaApiKey: string, omegaBaseUrl: string) {
    this.omegaApiKey = omegaApiKey;
    this.omegaBaseUrl = omegaBaseUrl.endsWith('/') ? omegaBaseUrl : `${omegaBaseUrl}/`;
  }

  async getGlassOptions(vin: string, vehicleData?: VehicleLookup): Promise<GlassSelectionOptions> {
    // First check if we have cached NAGS data for this VIN
    const cachedParts = await this.getCachedNagsParts(vin);
    if (cachedParts.length > 0) {
      return this.organizePartsByGlassType(cachedParts);
    }

    // Query Omega EDI for NAGS parts based on VIN
    try {
      const omegaParts = await this.lookupNagsPartsOmegaEDI(vin, vehicleData);
      
      // Cache the parts for future use
      for (const part of omegaParts) {
        await this.cacheNagsPart(part, vin);
      }
      
      return this.organizePartsByGlassType(omegaParts);
    } catch (error) {
      console.error('NAGS lookup failed:', error);
      
      // Return empty options if lookup fails
      return {
        windshield: [],
        sideWindows: [],
        rearGlass: [],
        quarterGlass: []
      };
    }
  }

  private async lookupNagsPartsOmegaEDI(vin: string, vehicleData?: VehicleLookup): Promise<NagsPartOption[]> {
    try {
      // Query Omega EDI NAGS database
      const response = await axios.get(
        `${this.omegaBaseUrl}nags/parts/${vin}`,
        {
          headers: {
            'api_key': this.omegaApiKey,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      const parts = response.data.parts || response.data;
      
      return parts.map((part: any) => ({
        nagsNumber: part.nags_number || part.nagsNumber,
        description: part.description || `${part.part_type} ${part.glass_type}`,
        glassType: this.normalizeGlassType(part.glass_type || part.glassType),
        position: part.position,
        partType: part.part_type || part.partType || 'aftermarket',
        manufacturer: part.manufacturer,
        price: Math.round((part.price || 0) * 100), // Convert to cents
        availability: part.availability || 'order_required',
        leadTime: part.lead_time_days || part.leadTime || 3,
        supplierInfo: part.supplier_info || part.supplierInfo
      }));
    } catch (error) {
      // If Omega EDI doesn't have NAGS endpoint, try alternative approach
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return await this.generateStandardGlassOptions(vehicleData);
      }
      throw error;
    }
  }

  private async generateStandardGlassOptions(vehicleData?: VehicleLookup): Promise<NagsPartOption[]> {
    // Generate common glass options when specific NAGS data is unavailable
    const baseOptions: NagsPartOption[] = [];
    
    if (vehicleData) {
      // Windshield options
      baseOptions.push({
        nagsNumber: `FW${vehicleData.year?.toString().slice(-2)}${vehicleData.make?.slice(0, 3).toUpperCase()}01`,
        description: `${vehicleData.year} ${vehicleData.make} ${vehicleData.model} Windshield`,
        glassType: 'windshield',
        partType: 'aftermarket',
        price: 35000, // $350 average
        availability: 'order_required',
        leadTime: 2
      });

      // Side window options
      ['left_front', 'right_front', 'left_rear', 'right_rear'].forEach((position, index) => {
        baseOptions.push({
          nagsNumber: `DW${vehicleData.year?.toString().slice(-2)}${vehicleData.make?.slice(0, 3).toUpperCase()}${(index + 1).toString().padStart(2, '0')}`,
          description: `${vehicleData.year} ${vehicleData.make} ${vehicleData.model} ${position.replace('_', ' ')} Window`,
          glassType: 'side_window',
          position,
          partType: 'aftermarket',
          price: 15000, // $150 average
          availability: 'order_required',
          leadTime: 3
        });
      });

      // Rear glass
      baseOptions.push({
        nagsNumber: `RW${vehicleData.year?.toString().slice(-2)}${vehicleData.make?.slice(0, 3).toUpperCase()}01`,
        description: `${vehicleData.year} ${vehicleData.make} ${vehicleData.model} Rear Glass`,
        glassType: 'rear_glass',
        partType: 'aftermarket',
        price: 25000, // $250 average
        availability: 'order_required',
        leadTime: 3
      });
    }

    return baseOptions;
  }

  private normalizeGlassType(glassType: string): 'windshield' | 'side_window' | 'rear_glass' | 'quarter_glass' {
    const normalized = glassType.toLowerCase();
    
    if (normalized.includes('windshield') || normalized.includes('front')) {
      return 'windshield';
    } else if (normalized.includes('rear') && !normalized.includes('quarter')) {
      return 'rear_glass';
    } else if (normalized.includes('quarter')) {
      return 'quarter_glass';
    } else {
      return 'side_window';
    }
  }

  private organizePartsByGlassType(parts: NagsPartOption[]): GlassSelectionOptions {
    const organized: GlassSelectionOptions = {
      windshield: [],
      sideWindows: [],
      rearGlass: [],
      quarterGlass: []
    };

    parts.forEach(part => {
      switch (part.glassType) {
        case 'windshield':
          organized.windshield?.push(part);
          break;
        case 'side_window':
          organized.sideWindows?.push(part);
          break;
        case 'rear_glass':
          organized.rearGlass?.push(part);
          break;
        case 'quarter_glass':
          organized.quarterGlass?.push(part);
          break;
      }
    });

    // Sort by price within each category
    Object.values(organized).forEach(categoryParts => {
      categoryParts?.sort((a, b) => a.price - b.price);
    });

    return organized;
  }

  private async getCachedNagsParts(vin: string): Promise<NagsPartOption[]> {
    try {
      const cachedParts = await storage.getNagsPartsByVin(vin);
      return cachedParts.map(part => ({
        nagsNumber: part.nagsNumber,
        description: part.description || '',
        glassType: part.glassType as any,
        position: part.position || undefined,
        partType: part.partType as any,
        manufacturer: part.manufacturer || undefined,
        price: part.price || 0,
        availability: part.availability as any || 'order_required',
        leadTime: part.leadTime || 3,
        supplierInfo: part.supplierInfo
      }));
    } catch (error) {
      return [];
    }
  }

  private async cacheNagsPart(part: NagsPartOption, vin: string): Promise<void> {
    try {
      const nagsPartData: InsertNagsPart = {
        nagsNumber: part.nagsNumber,
        vin,
        glassType: part.glassType,
        position: part.position || null,
        partType: part.partType,
        manufacturer: part.manufacturer || null,
        description: part.description,
        price: part.price,
        availability: part.availability,
        leadTime: part.leadTime,
        supplierInfo: part.supplierInfo || null,
      };
      
      await storage.createNagsPart(nagsPartData);
    } catch (error) {
      console.error('Failed to cache NAGS part:', error);
    }
  }

  // Get specific part details by NAGS number
  async getPartDetails(nagsNumber: string): Promise<NagsPartOption | null> {
    try {
      const part = await storage.getNagsPartByNumber(nagsNumber);
      if (!part) return null;

      return {
        nagsNumber: part.nagsNumber,
        description: part.description || '',
        glassType: part.glassType as any,
        position: part.position || undefined,
        partType: part.partType as any,
        manufacturer: part.manufacturer || undefined,
        price: part.price || 0,
        availability: part.availability as any || 'order_required',
        leadTime: part.leadTime || 3,
        supplierInfo: part.supplierInfo
      };
    } catch (error) {
      console.error('Failed to get part details:', error);
      return null;
    }
  }

  // Update part pricing and availability
  async updatePartAvailability(nagsNumber: string, availability: string, price?: number, leadTime?: number): Promise<void> {
    try {
      await storage.updateNagsPartAvailability(nagsNumber, {
        availability,
        price,
        leadTime
      });
    } catch (error) {
      console.error('Failed to update part availability:', error);
    }
  }
}

// Export singleton instance
export const nagsLookupService = new NagsLookupService(
  process.env.OMEGA_EDI_API_KEY || 'C55KeMr7T7JaHtKS',
  process.env.OMEGA_API_BASE_URL || 'https://app.omegaedi.com/api/2.0/'
);