import type { VehicleInfo, TierResult, GlassPartResult } from './types.js';
import { omegaPricingService } from '../omega-pricing.js';

export class OmegaFallbackService {
  async lookup(vehicle: VehicleInfo, positions: string[]): Promise<TierResult> {
    const start = Date.now();
    try {
      // Use the Omega pricing service to attempt to derive parts for this vehicle
      const pricingReq: any = { vin: vehicle.vin };
      const pricing = await omegaPricingService.generatePricing(pricingReq);

      const parts: GlassPartResult[] = [];
      if (pricing.success && pricing.breakdown && Array.isArray(pricing.breakdown.parts)) {
        for (const p of pricing.breakdown.parts) {
          const item: any = p;
          parts.push({
            nagsPartNumber: item.nagsNumber || String(item.partNumber || ''),
            nagsPartNumberAlt: undefined,
            glassPosition: (item.glassType || 'windshield').toString(),
            features: [],
            price: { cost: Math.round(((item.price || item.cost || 0) * 100)), source: 'omega', asOfDate: new Date() }
          });
        }
      }

      return { success: parts.length > 0, source: 'omega', parts, durationMs: Date.now() - start };
    } catch (err) {
      return { success: false, source: 'omega', parts: [], durationMs: Date.now() - start, error: err instanceof Error ? err.message : String(err) };
    }
  }
}

export const omegaFallbackService = new OmegaFallbackService();
