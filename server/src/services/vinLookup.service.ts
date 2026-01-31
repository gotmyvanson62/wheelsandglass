import axios from 'axios';
import type { VINLookupResult } from 'shared';

class VINLookupService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.VIN_API_URL || 'https://vpic.nhtsa.dot.gov/api';
  }

  async lookup(vin: string): Promise<VINLookupResult> {
    try {
      if (!vin || vin.length !== 17) {
        throw new Error('Invalid VIN format. VIN must be 17 characters.');
      }

      const response = await axios.get(
        `${this.apiUrl}/vehicles/DecodeVin/${vin}?format=json`
      );

      const results = response.data.Results;

      // Parse the results
      const getValue = (variableId: number) => {
        const item = results.find((r: any) => r.VariableId === variableId);
        return item?.Value || '';
      };

      return {
        vin,
        year: parseInt(getValue(29)) || 0,
        make: getValue(26),
        model: getValue(28),
        trim: getValue(109),
        bodyType: getValue(5),
        engineType: getValue(13),
        transmission: getValue(11),
        fuelType: getValue(24),
      };
    } catch (error) {
      console.error('VIN lookup error:', error);
      throw error;
    }
  }
}

export const vinLookupService = new VINLookupService();
