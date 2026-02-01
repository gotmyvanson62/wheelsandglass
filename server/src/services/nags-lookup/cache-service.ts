import { eq, sql, and } from 'drizzle-orm';
import { db } from '../../db.js';
import { nagsCache } from '../../db/schema/nags-cache.js';
import type { VehicleInfo, GlassPartResult } from './types.js';

export class CacheService {
  async lookup(vinPattern: string, glassPosition: string): Promise<GlassPartResult | null> {
    if (!db) return null;
    const [row] = await db.select().from(nagsCache).where(and(eq(nagsCache.vinPattern, vinPattern), eq(nagsCache.glassPosition, glassPosition))).limit(1);

    // Update usage stats (best-effort)
    try {
      await db.update(nagsCache)
        .set({ lookupCount: sql`${nagsCache.lookupCount} + 1`, lastLookupAt: new Date() })
        .where(eq(nagsCache.id, row.id));
    } catch (err) {
      console.warn('Failed to update nags_cache usage stats:', err);
    }

    return {
      nagsPartNumber: row.nagsPartNumber,
      nagsPartNumberAlt: row.nagsPartNumberAlt || undefined,
      glassPosition: row.glassPosition,
      features: (row.features as any) || [],
      price: row.lastKnownCost ? { cost: row.lastKnownCost, source: row.distributorSource || 'unknown', asOfDate: row.lastPriceDate || new Date() } : undefined,
    };
  }

  async store(vehicle: VehicleInfo, part: GlassPartResult, source: string): Promise<void> {
    const existing = await db!.select().from(nagsCache).where(and(eq(nagsCache.vinPattern, vehicle.vinPattern), eq(nagsCache.glassPosition, part.glassPosition))).limit(1);
    const found = existing[0];
    if (found) {
      await db!.update(nagsCache)
        .set({
          nagsPartNumber: part.nagsPartNumber,
          nagsPartNumberAlt: part.nagsPartNumberAlt || null,
          features: part.features,
          lastKnownCost: part.price?.cost ?? null,
          lastPriceDate: part.price?.asOfDate ?? null,
          distributorSource: part.price?.source ?? null,
          source,
          updatedAt: new Date(),
        })
        .where(eq(nagsCache.id, found.id));
    } else {
      await db!.insert(nagsCache).values({
        vinPattern: vehicle.vinPattern,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        trim: vehicle.trim || null,
        bodyStyle: vehicle.bodyStyle || null,
        glassPosition: part.glassPosition,
        nagsPartNumber: part.nagsPartNumber,
        nagsPartNumberAlt: part.nagsPartNumberAlt || null,
        features: part.features,
        lastKnownCost: part.price?.cost ?? null,
        lastPriceDate: part.price?.asOfDate ?? null,
        distributorSource: part.price?.source ?? null,
        source,
        confidence: source === 'omega' ? 100 : source === 'manual' ? 95 : 85,
        verified: source === 'omega',
      });
    }
  }

  async getStats() {
    if (!db) return { totalCachedParts: 0, cacheHitRate: 0, lookupsByTier: [], avgResponseTimeMs: 0, topMissingVehicles: [] };
    const [{ count }] = await db.select({ count: sql`count(*)` }).from(nagsCache);
    return {
      totalCachedParts: Number(count || 0),
      cacheHitRate: 0,
      lookupsByTier: [],
      avgResponseTimeMs: 0,
      topMissingVehicles: [],
    };
  }
}

export const cacheService = new CacheService();
