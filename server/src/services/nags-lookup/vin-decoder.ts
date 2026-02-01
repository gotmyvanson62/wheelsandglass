import { vinLookupService } from '../vin-lookup.js';
import type { VehicleInfo } from './types.js';

export class VINDecoderService {
  async decode(vin: string): Promise<VehicleInfo | null> {
    if (!vin) return null;
    const normalized = vin.trim().toUpperCase();

    // Use existing vinLookupService which already implements caching and NHTSA fallback
    const details = await vinLookupService.lookupVin(normalized);

    if (!details || !details.isValid) return null;

    return {
      vin: normalized,
      vinPattern: normalized.substring(0, 11),
      year: details.year || 0,
      make: details.make || 'Unknown',
      model: details.model || 'Unknown',
      trim: details.trim,
      bodyStyle: details.bodyType,
    };
  }
}

export const vinDecoderService = new VINDecoderService();
