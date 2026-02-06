// Ensure feature flag is enabled before the module is imported (module-level constant)
process.env.ENABLE_MYGRANT_SCRAPER = 'true';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MygrantScraper } from '../mygrant.js';

describe('MygrantScraper', () => {
  let originalFetch: any;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    process.env.ENABLE_MYGRANT_SCRAPER = 'true';
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('parses parts from a fake API response', async () => {
    const fakeResp = {
      ok: true,
      headers: { get: (_: string) => null },
      json: async () => ({ parts: [{ nagsNumber: 'NAGS-123', glassType: 'windshield', price: 45.5 }] })
    } as any;

    globalThis.fetch = vi.fn(async () => fakeResp) as any;

    const scraper = new MygrantScraper();
    const vehicle = { vinPattern: '1HGCM82633' } as any;
    const results = await scraper.lookupParts(vehicle, ['windshield']);
    console.log('[TEST DEBUG] mygrant results:', results);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].nagsPartNumber).toBe('NAGS-123');
    expect(results[0].glassPosition).toBe('windshield');
    expect(results[0].price?.cost).toBe(4550);
  });
});
