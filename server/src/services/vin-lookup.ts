import axios from 'axios';
import type { InsertVehicleLookup, VehicleLookup } from '@shared/schema';
import { storage } from '../storage.js';

export interface VehicleDetails {
  vin: string;
  year: number;
  make: string;
  model: string;
  bodyType?: string;
  engine?: string;
  trim?: string;
  isValid: boolean;
  source: 'omega_edi' | 'nhtsa' | 'manual';
}

export class VinLookupService {
  private omegaApiKey: string;
  private omegaBaseUrl: string;

  constructor(omegaApiKey: string, omegaBaseUrl: string) {
    this.omegaApiKey = omegaApiKey;
    this.omegaBaseUrl = omegaBaseUrl.endsWith('/') ? omegaBaseUrl : `${omegaBaseUrl}/`;
  }

  async lookupVin(vin: string): Promise<VehicleDetails> {
    // First check if we have cached VIN data
    const cached = await this.getCachedVinData(vin);
    if (cached) {
      await this.updateLastUsed(vin);
      return {
        vin: cached.vin,
        year: cached.year || 0,
        make: cached.make || '',
        model: cached.model || '',
        bodyType: cached.bodyType || undefined,
        engine: cached.engine || undefined,
        trim: cached.trim || undefined,
        isValid: cached.isValid ?? false,
        source: cached.lookupSource as any || 'omega_edi'
      };
    }

    // Try Omega EDI VIN lookup first (most cost-effective)
    try {
      const omegaResult = await this.lookupVinOmegaEDI(vin);
      if (omegaResult.isValid) {
        await this.cacheVinData(omegaResult);
        return omegaResult;
      }
    } catch (error) {
      console.log('Omega EDI VIN lookup failed, trying NHTSA:', error);
    }

    // Fallback to NHTSA if Omega EDI fails
    try {
      const nhtsaResult = await this.lookupVinNHTSA(vin);
      await this.cacheVinData(nhtsaResult);
      return nhtsaResult;
    } catch (error) {
      console.error('Both VIN lookup services failed:', error);
      
      // Return invalid VIN result
      const invalidResult: VehicleDetails = {
        vin,
        year: 0,
        make: '',
        model: '',
        isValid: false,
        source: 'manual'
      };
      
      await this.cacheVinData(invalidResult);
      return invalidResult;
    }
  }

  private async lookupVinOmegaEDI(vin: string): Promise<VehicleDetails> {
    try {
      const response = await axios.get(
        `${this.omegaBaseUrl}vehicles/vin/${vin}`,
        {
          headers: {
            'api_key': this.omegaApiKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      const data = response.data;
      
      return {
        vin,
        year: parseInt(data.year) || 0,
        make: data.make || '',
        model: data.model || '',
        bodyType: data.body_type,
        engine: data.engine,
        trim: data.trim,
        isValid: !!(data.year && data.make && data.model),
        source: 'omega_edi'
      };
    } catch (error) {
      throw new Error(`Omega EDI VIN lookup failed: ${error}`);
    }
  }

  private async lookupVinNHTSA(vin: string): Promise<VehicleDetails> {
    try {
      const response = await axios.get(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`,
        { timeout: 15000 }
      );

      const results = response.data.Results;
      
      // Extract key vehicle information from NHTSA response
      const yearResult = results.find((r: any) => r.Variable === 'Model Year');
      const makeResult = results.find((r: any) => r.Variable === 'Make');
      const modelResult = results.find((r: any) => r.Variable === 'Model');
      const bodyTypeResult = results.find((r: any) => r.Variable === 'Body Class');
      const engineResult = results.find((r: any) => r.Variable === 'Engine Model');

      const year = parseInt(yearResult?.Value) || 0;
      const make = makeResult?.Value || '';
      const model = modelResult?.Value || '';

      return {
        vin,
        year,
        make,
        model,
        bodyType: bodyTypeResult?.Value,
        engine: engineResult?.Value,
        isValid: !!(year && make && model),
        source: 'nhtsa'
      };
    } catch (error) {
      throw new Error(`NHTSA VIN lookup failed: ${error}`);
    }
  }

  private async getCachedVinData(vin: string): Promise<VehicleLookup | null> {
    try {
      return await storage.getVehicleLookup(vin) ?? null;
    } catch (error) {
      return null;
    }
  }

  private async cacheVinData(vehicleData: VehicleDetails): Promise<void> {
    try {
      const vinData: InsertVehicleLookup = {
        vin: vehicleData.vin,
        year: vehicleData.year,
        make: vehicleData.make,
        model: vehicleData.model,
        bodyType: vehicleData.bodyType || null,
        engine: vehicleData.engine || null,
        trim: vehicleData.trim || null,
        lookupSource: vehicleData.source,
        isValid: vehicleData.isValid,
      };
      
      await storage.createVehicleLookup(vinData);
    } catch (error) {
      console.error('Failed to cache VIN data:', error);
    }
  }

  private async updateLastUsed(vin: string): Promise<void> {
    try {
      await storage.updateVehicleLookupLastUsed(vin);
    } catch (error) {
      console.error('Failed to update VIN last used:', error);
    }
  }

  // Validate VIN format
  static isValidVinFormat(vin: string): boolean {
    // VIN should be 17 characters, alphanumeric, no I, O, or Q
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    return vinRegex.test(vin.toUpperCase());
  }

  // Validate VIN checksum (9th position check digit)
  // Uses the standard NAV algorithm with weighted positions
  static isValidVinChecksum(vin: string): boolean {
    if (!this.isValidVinFormat(vin)) return false;

    const upperVin = vin.toUpperCase();

    // Transliteration values for letters
    const transliteration: { [key: string]: number } = {
      'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
      'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9,
      'S': 2, 'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9,
      '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
    };

    // Position weights (positions 1-17)
    const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 17; i++) {
      const char = upperVin.charAt(i);
      const value = transliteration[char];
      if (value === undefined) return false;
      sum += value * weights[i];
    }

    const remainder = sum % 11;
    const checkDigit = remainder === 10 ? 'X' : remainder.toString();

    return upperVin.charAt(8) === checkDigit;
  }

  // Combined validation: format + checksum
  static isValidVin(vin: string): { valid: boolean; reason?: string } {
    if (!vin || vin.length !== 17) {
      return { valid: false, reason: 'VIN must be exactly 17 characters' };
    }

    if (!this.isValidVinFormat(vin)) {
      return { valid: false, reason: 'VIN contains invalid characters (I, O, Q not allowed)' };
    }

    if (!this.isValidVinChecksum(vin)) {
      return { valid: false, reason: 'VIN checksum is invalid' };
    }

    return { valid: true };
  }

  // Extract year from VIN (10th character)
  static getYearFromVin(vin: string): number | null {
    if (!this.isValidVinFormat(vin)) return null;
    
    const yearChar = vin.charAt(9).toUpperCase();
    const yearMap: { [key: string]: number } = {
      'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014,
      'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
      'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024,
      'S': 2025, 'T': 2026, 'V': 2027, 'W': 2028, 'X': 2029,
      'Y': 2030, 'Z': 2031,
      '1': 2031, '2': 2032, '3': 2033, '4': 2034, '5': 2035,
      '6': 2036, '7': 2037, '8': 2038, '9': 2039
    };
    
    return yearMap[yearChar] || null;
  }
}

// Export singleton instance
export const vinLookupService = new VinLookupService(
  process.env.OMEGA_EDI_API_KEY || 'C55KeMr7T7JaHtKS',
  process.env.OMEGA_API_BASE_URL || 'https://app.omegaedi.com/api/2.0/'
);