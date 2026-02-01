import { VINDecoderService, vinDecoderService } from './vin-decoder.js';
import { cacheService } from './cache-service.js';
import { DistributorLookupService } from './distributor-lookup.js';
import { OmegaFallbackService } from './omega-fallback.js';
import { ManualEscalationService } from './manual-escalation.js';
import type { LookupRequest, LookupResult, GlassPartResult, VehicleInfo } from './types.js';
import { db } from '../../db.js';
import { nagsLookupLog } from '../../db/schema/nags-cache.js';

export class NAGSLookupOrchestrator {
  private cache = cacheService;
  private distributors = new DistributorLookupService();
  private omega = new OmegaFallbackService();
  private manual = new ManualEscalationService();
  private vinDecoder = vinDecoderService;

  async lookup(request: LookupRequest): Promise<LookupResult> {
    const startTime = Date.now();
    const vehicle = await this.vinDecoder.decode(request.vin);
    if (!vehicle) {
      return {
        success: false,
        vehicle: { vin: request.vin, vinPattern: request.vin.substring(0,11), year: 0, make: 'Unknown', model: 'Unknown' },
        parts: [],
        resolvedByTier: 4,
        resolvedBySource: 'error',
        durationMs: Date.now() - startTime,
        cached: false,
        error: 'Invalid VIN or decode failed',
      };
    }

    const positions = request.glassPositions.includes('all')
      ? ['windshield','back_glass','door_fl','door_fr','door_rl','door_rr']
      : request.glassPositions;

    const allParts: GlassPartResult[] = [];
    const missing: string[] = [];

    // Tier 1: cache
    for (const pos of positions) {
      const found = await this.cache.lookup(vehicle.vinPattern, pos);
      if (found) allParts.push(found); else missing.push(pos);
    }

    if (missing.length === 0) {
      await this.log(request, vehicle, 1, 'cache', allParts, startTime, { tier1: Date.now() - startTime, tier2: 0, tier3: 0 }, true);
      return {
        success: true, vehicle, parts: allParts, resolvedByTier: 1, resolvedBySource: 'cache', durationMs: Date.now()-startTime, cached: true
      };
    }

    // Tier 2: distributors
    const distResult = await this.distributors.lookup(vehicle, missing);
    if (distResult.success && distResult.parts.length>0) {
      for (const p of distResult.parts) await this.cache.store(vehicle, p, distResult.source);
      allParts.push(...distResult.parts);
      missing.splice(0, missing.length, ...missing.filter(m => !distResult.parts.some(p=>p.glassPosition===m)));
      if (missing.length===0) {
        await this.log(request, vehicle, 2, distResult.source, allParts, startTime, { tier1:0, tier2:0, tier3:0 }, false);
        return { success:true, vehicle, parts:allParts, resolvedByTier:2, resolvedBySource:distResult.source, durationMs: Date.now()-startTime, cached:false };
      }
    }

    // Tier 3: omega
    const omegaResult = await this.omega.lookup(vehicle, missing);
    if (omegaResult.success && omegaResult.parts.length>0) {
      for (const p of omegaResult.parts) await this.cache.store(vehicle, p, 'omega');
      allParts.push(...omegaResult.parts);
      missing.splice(0, missing.length, ...missing.filter(m => !omegaResult.parts.some(p=>p.glassPosition===m)));
      if (missing.length===0) {
        await this.log(request, vehicle, 3, 'omega', allParts, startTime, { tier1:0, tier2:0, tier3:0 }, false);
        return { success:true, vehicle, parts:allParts, resolvedByTier:3, resolvedBySource:'omega', durationMs: Date.now()-startTime, cached:false };
      }
    }

    // Tier 4: manual escalation for remaining
    if (missing.length>0) {
      await this.manual.queueForResearch({
        vin: request.vin,
        vehicle,
        missingPositions: missing,
        transactionId: request.transactionId,
        customerContext: request.customerContext,
        priority: request.priority || 'normal',
        attemptLog: [],
      });
    }

    await this.log(request, vehicle, allParts.length>0 ? 3 : 4, allParts.length>0 ? 'partial' : 'manual_queue', allParts, startTime, { tier1:0, tier2:0, tier3:0 }, false);

    return {
      success: allParts.length>0,
      vehicle,
      parts: allParts,
      resolvedByTier: allParts.length>0 ? 3 : 4,
      resolvedBySource: allParts.length>0 ? 'partial' : 'manual_queue',
      durationMs: Date.now()-startTime,
      cached: false,
      error: missing.length>0 ? `Missing positions queued: ${missing.join(',')}` : undefined,
    };
  }

  private async log(request: LookupRequest, vehicle: VehicleInfo, tier: number, source: string, parts: GlassPartResult[], startTime: number, timings: any, cached: boolean) {
    try {
      if (!db) return;
      await db.insert(nagsLookupLog).values({
        vin: request.vin,
        glassPosition: request.glassPositions.join(','),
        resolvedByTier: tier,
        resolvedBySource: source,
        totalDurationMs: Date.now() - startTime,
        tier1DurationMs: timings.tier1,
        tier2DurationMs: timings.tier2,
        tier3DurationMs: timings.tier3,
        success: parts.length>0,
        nagsPartNumber: parts[0]?.nagsPartNumber,
      });
    } catch (err) {
      console.warn('Failed to log nags lookup:', err);
    }
  }
}

export const nagsLookup = new NAGSLookupOrchestrator();
