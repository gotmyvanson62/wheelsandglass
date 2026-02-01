import { db } from '../../db.js';
import { nagsManualQueue } from '../../db/schema/nags-cache.js';
import type { VehicleInfo } from './types.js';

export class ManualEscalationService {
  async queueForResearch(request: {
    vin: string;
    vehicle: VehicleInfo;
    missingPositions: string[];
    transactionId?: number;
    customerContext?: { name?: string; phone?: string };
    priority: 'low'|'normal'|'high'|'urgent';
    attemptLog: any[];
  }): Promise<number[]> {
    const ids: number[] = [];
    if (!db) return ids;
    for (const pos of request.missingPositions) {
      const [inserted] = await db.insert(nagsManualQueue).values({
        vin: request.vin,
        glassPosition: pos,
        year: request.vehicle.year,
        make: request.vehicle.make,
        model: request.vehicle.model,
        transactionId: request.transactionId || null,
        customerName: request.customerContext?.name || null,
        customerPhone: request.customerContext?.phone || null,
        urgency: request.priority,
        attemptLog: request.attemptLog,
        status: 'pending',
      }).returning({ id: nagsManualQueue.id });

      ids.push((inserted as any).id);
    }

    // TODO: send admin notification (email/SMS)
    return ids;
  }
}

export const manualEscalationService = new ManualEscalationService();
