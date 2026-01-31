import axios from 'axios';
import type { NAGSLookupResult } from 'shared';

class NAGSLookupService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.NAGS_API_URL || '';
    this.apiKey = process.env.NAGS_API_KEY || '';
  }

  async lookup(nagsCode: string): Promise<NAGSLookupResult> {
    if (!this.apiKey || !this.apiUrl) {
      throw new Error('NAGS API is not configured');
    }

    try {
      const response = await axios.get(
        `${this.apiUrl}/parts/${nagsCode}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        nagsCode: response.data.nagsCode || nagsCode,
        partNumber: response.data.partNumber || '',
        description: response.data.description || '',
        price: response.data.price || 0,
        availability: response.data.availability || false,
        manufacturer: response.data.manufacturer || '',
      };
    } catch (error) {
      console.error('NAGS lookup error:', error);

      // Return mock data for development
      return {
        nagsCode,
        partNumber: `PART-${nagsCode}`,
        description: 'Auto Glass Part',
        price: 0,
        availability: false,
        manufacturer: 'Unknown',
      };
    }
  }

  async search(vehicleYear: number, vehicleMake: string, vehicleModel: string, glassType: string) {
    if (!this.apiKey || !this.apiUrl) {
      throw new Error('NAGS API is not configured');
    }

    try {
      const response = await axios.get(
        `${this.apiUrl}/parts/search`,
        {
          params: {
            year: vehicleYear,
            make: vehicleMake,
            model: vehicleModel,
            glassType,
          },
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.results || [];
    } catch (error) {
      console.error('NAGS search error:', error);
      return [];
    }
  }
}

export const nagsLookupService = new NAGSLookupService();
