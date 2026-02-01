import type { VehicleInfo, GlassPartResult } from '../types.js';

export abstract class BaseDistributorScraper {
  protected name: string;
  protected baseUrl: string;
  protected sessionToken: string | null = null;
  protected sessionExpiresAt: Date | null = null;

  constructor(name: string, baseUrl: string) {
    this.name = name;
    this.baseUrl = baseUrl;
  }

  abstract login(username: string, encryptedPassword: string): Promise<void>;
  abstract lookupParts(vehicle: VehicleInfo, positions: string[]): Promise<GlassPartResult[]>;

  isSessionValid(): boolean {
    if (!this.sessionToken || !this.sessionExpiresAt) return false;
    return new Date() < this.sessionExpiresAt;
  }

  protected decryptPassword(encrypted: string): string {
    try {
      return Buffer.from(encrypted, 'base64').toString('utf-8');
    } catch (err) {
      return encrypted;
    }
  }

  protected parseFeatures(raw: string): string[] {
    const map: Record<string,string> = { RS: 'rain_sensor', HUD: 'hud', HTD: 'heated', ANT: 'antenna', ADAS: 'adas' };
    return (raw || '').split(/[\s,]+/).map(s => map[s.toUpperCase()] || s.toLowerCase()).filter(Boolean);
  }
}
