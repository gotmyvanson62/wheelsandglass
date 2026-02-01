export interface VehicleInfo {
  vin: string;
  vinPattern: string; // First 11 chars
  year: number;
  make: string;
  model: string;
  trim?: string;
  bodyStyle?: string;
}

export interface GlassPartResult {
  nagsPartNumber: string;
  nagsPartNumberAlt?: string;
  glassPosition: string;
  features: string[];
  price?: {
    cost: number; // In cents
    source: string;
    asOfDate: Date;
  };
}

export interface LookupResult {
  success: boolean;
  vehicle: VehicleInfo;
  parts: GlassPartResult[];
  resolvedByTier: 1 | 2 | 3 | 4;
  resolvedBySource: string;
  durationMs: number;
  cached: boolean;
  error?: string;
}

export interface LookupRequest {
  vin: string;
  glassPositions: string[]; // Which glass to lookup, or ['all']
  transactionId?: number;
  customerContext?: {
    name?: string;
    phone?: string;
  };
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface DistributorConfig {
  name: string;
  enabled: boolean;
  loginUrl: string;
  lookupUrl: string;
  timeout: number;
  priority: number; // Lower = try first
}

export interface TierResult {
  success: boolean;
  source: string;
  parts: GlassPartResult[];
  durationMs: number;
  error?: string;
}
