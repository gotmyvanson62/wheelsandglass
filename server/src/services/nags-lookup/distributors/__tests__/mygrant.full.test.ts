import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('MygrantScraper (full flow, mocked DB+HTTP)', () => {
  let originalFetch: any;

  beforeEach(() => {
    originalFetch = globalThis.fetch;

    // Mock fetch for login and lookup
    globalThis.fetch = vi.fn(async (url: string, opts: any) => {
      if (url.includes('/login') || url.includes('login')) {
        return { ok: true, json: async () => ({ token: 'SESS-1' }), headers: { get: () => 'sess=abc; Path=/' } } as any;
      }
      if (url.includes('/api/vin-lookup')) {
        return {
          ok: true,
          json: async () => ({ parts: [{ nagsNumber: 'NAGS-999', glassType: 'windshield', price: 55.5 }] }),
          headers: { get: () => null }
        } as any;
      }
      return { ok: false, status: 500, json: async () => ({}) } as any;
    }) as any;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.resetModules();
  });

  it('logs in and retrieves parts when enabled', async () => {
    // Mock DB module before importing scraper
    const mockDb = {
      select: () => ({ from: () => ({ where: () => ({ limit: () => Promise.resolve([{ loginUrl: 'https://example.com/login', username: 'user', passwordEncrypted: 'cGFzc3dvcmQ=' }]) }) }) })
    } as any;
    vi.doMock('../../../db/connection.js', () => ({ db: mockDb }));

    process.env.ENABLE_MYGRANT_SCRAPER = 'true';
    const { MygrantScraper } = await import('../mygrant.js');
    const scraper = new MygrantScraper();
    const vehicle = { vinPattern: '1HGCM82633A', vin: '1HGCM82633A004352' } as any;
    const parts = await scraper.lookupParts(vehicle, ['windshield']);
    expect(parts.length).toBeGreaterThan(0);
    expect(parts[0].nagsPartNumber).toBe('NAGS-999');
  });
});
