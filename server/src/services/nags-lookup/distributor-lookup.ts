import type { VehicleInfo, TierResult, GlassPartResult } from './types.js';
import { db } from '../../db.js';
import { distributorCredentials } from '../../db/schema/nags-cache.js';
import { eq } from 'drizzle-orm';
import { MygrantScraper } from './distributors/mygrant.js';

export class DistributorLookupService {
  private scrapers = new Map<string, any>();
  private priority = ['mygrant', 'pgw', 'pilkington', 'igc'];

  constructor() {
    this.scrapers.set('mygrant', new MygrantScraper());
    // PGW, Pilkington, IGC scrapers can be added later
  }

  async lookup(vehicle: VehicleInfo, positions: string[]): Promise<TierResult> {
    const start = Date.now();
    const parts: GlassPartResult[] = [];
    if (!db) return { success: false, source: 'none', parts: [], durationMs: Date.now()-start };
    const creds = await db.select().from(distributorCredentials).where(eq(distributorCredentials.isActive, true));
    const active = (creds || []).map((c: any) => c.distributor).sort((a: any,b: any)=> this.priority.indexOf(a)-this.priority.indexOf(b));

    for (const name of active) {
      const scraper = this.scrapers.get(name);
      if (!scraper) continue;

      try {
        const remaining = positions.filter(p => !parts.some(pt => pt.glassPosition === p));
        if (remaining.length===0) break;

        const result = await scraper.lookupParts(vehicle, remaining);
        if (result && result.length>0) parts.push(...result);
      } catch (err) {
        console.warn('Distributor lookup failed for', name, err);
      }
    }

    return { success: parts.length>0, source: parts.length>0 ? 'distributor' : 'none', parts, durationMs: Date.now()-start };
  }
}

export const distributorLookupService = new DistributorLookupService();
