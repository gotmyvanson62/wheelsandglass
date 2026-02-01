import { BaseDistributorScraper } from './base-distributor.js';
import type { VehicleInfo, GlassPartResult } from '../types.js';

export class MygrantScraper extends BaseDistributorScraper {
  constructor() {
    super('mygrant', 'https://www.mygrantglass.com');
  }

  async login(username: string, encryptedPassword: string): Promise<void> {
    // Placeholder: distributor credentials are stored encrypted in DB
    const password = this.decryptPassword(encryptedPassword);
    // Implement login flow per portal (this is a template)
    this.sessionToken = null;
    this.sessionExpiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000);
  }

  // Simple rate-limiter: ensure at least `minDelayMs` between requests
  private lastRequestAt: number | null = null;
  private minDelayMs = 6000; // 6 seconds between requests to be polite

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

    // If session not valid, attempt a login flow (no-op here)
    if (!this.isSessionValid()) {
      // In practice, fetch credentials from DB and call login
      this.sessionToken = null;
      this.sessionExpiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000);
    }

    // Attempt a JSON-based VIN lookup if the portal supports it
    try {
      const vin = vehicle.vinPattern + '000000';
      const resp = await fetch(`${this.baseUrl}/api/vin-lookup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `Mozilla/5.0 (compatible; WheelsAndGlass/1.0; +https://example.com)`
        },
        body: JSON.stringify({ vin })
      });

      if (!resp.ok) return [];

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
