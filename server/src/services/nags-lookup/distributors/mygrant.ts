import { BaseDistributorScraper } from './base-distributor.js';
import type { VehicleInfo, GlassPartResult } from '../types.js';
import { db } from '../../../db/connection.js';
import { distributorCredentials } from '../../../db/schema/nags-cache.js';
import { eq } from 'drizzle-orm';


export class MygrantScraper extends BaseDistributorScraper {
  constructor() {
    super('mygrant', 'https://www.mygrantglass.com');
  }

  async login(loginUrl: string, encryptedPassword: string, username?: string): Promise<void> {
    // Decrypt password and perform a basic login POST (portal-specific adapt required)
    const password = this.decryptPassword(encryptedPassword);
    try {
      const resp = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username || '', password })
      });
      if (resp.ok) {
        // some portals return JSON with a token
        const j: any = await resp.json().catch(() => ({}));
        this.sessionToken = (j && (j.token || j.session)) || null;
      } else {
        this.sessionToken = null;
      }
    } catch (err) {
      this.sessionToken = null;
    }
    this.sessionExpiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000);
  }

  // Simple rate-limiter: ensure at least `minDelayMs` between requests
  private lastRequestAt: number | null = null;
  private minDelayMs = 6000; // 6 seconds between requests to be polite
  private sessionCookie: string | null = null;
  private maxRetries = 3;
  private backoffBase = 800;

  private async politeDelay() {
    const now = Date.now();
    if (!this.lastRequestAt) {
      this.lastRequestAt = now;
      return;
    }
    const elapsed = now - this.lastRequestAt;
    if (elapsed < this.minDelayMs) {
      await new Promise((r) => setTimeout(r, this.minDelayMs - elapsed + Math.floor(Math.random() * 1500)));
    }
    this.lastRequestAt = Date.now();
  }

  async lookupParts(vehicle: VehicleInfo, positions: string[]): Promise<GlassPartResult[]> {
    // Respect polite scraping rules and simulate human-like behavior
    await this.politeDelay();

    // Check feature flag at runtime so tests can toggle it before import
    const enabled = (process.env.ENABLE_MYGRANT_SCRAPER || 'false').toLowerCase() === 'true';
    if (!enabled) return [];
    if (!this.isSessionValid()) {
      try {
        if (!db) throw new Error('DB not initialized');
        const rows = await db.select().from(distributorCredentials).where(eq(distributorCredentials.distributor, 'mygrant')).limit(1);
        const creds = rows[0];
        if (creds) {
          await this.login(creds.loginUrl, creds.passwordEncrypted, creds.username);
        }
      } catch (err) {
        console.warn('[MygrantScraper] failed to load credentials or login:', err);
      }
    }

    // Attempt a JSON-based VIN lookup with retries and backoff
    try {
      const vin = vehicle.vinPattern + '000000';
      let attempt = 0;
      let lastErr: any = null;
      while (attempt < this.maxRetries) {
        attempt += 1;
        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': `Mozilla/5.0 (compatible; WheelsAndGlass/1.0; +https://example.com)`
          };
          if (this.sessionCookie) headers['Cookie'] = this.sessionCookie;

          const resp = await fetch(`${this.baseUrl}/api/vin-lookup`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ vin })
          });

          if (!resp.ok) {
            lastErr = new Error(`HTTP ${resp.status}`);
            throw lastErr;
          }

          // capture Set-Cookie header if present
          const sc = resp.headers.get('set-cookie') || resp.headers.get('Set-Cookie');
          if (sc) this.sessionCookie = sc;

          const data: any = await resp.json();
          const results: GlassPartResult[] = [];

          for (const item of data.parts || []) {
            const position = this.mapMygrantPosition(item.glassType || item.position || 'windshield');
            if (positions.includes(position) || positions.includes('all')) {
              results.push({
                nagsPartNumber: item.nagsNumber || item.partNumber || '',
                nagsPartNumberAlt: item.alternateNags || undefined,
                glassPosition: position,
                features: this.parseFeatures(item.features || item.options || ''),
                price: item.price ? { cost: Math.round(item.price * 100), source: 'mygrant', asOfDate: new Date() } : undefined,
              });
            }
          }

          return results;
        } catch (err) {
          lastErr = err;
          const delay = this.backoffBase * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 300);
          await new Promise((r) => setTimeout(r, delay));
        }
      }

      console.warn('[MygrantScraper] Lookup failed after retries:', lastErr);
      return [];
    } catch (err) {
      console.warn('[MygrantScraper] Lookup failed:', err);
      return [];
    }
  }

  private mapMygrantPosition(raw: string): string {
    const m = (raw || '').toLowerCase();
    if (m.includes('wind') || m.includes('front')) return 'windshield';
    if (m.includes('rear') || m.includes('back')) return 'rear_window';
    if (m.includes('door') || m.includes('side')) return 'door';
    return 'windshield';
  }
}

export const mygrantScraper = new MygrantScraper();
