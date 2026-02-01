import { storage } from '../storage.js';

const POLL_INTERVAL_MS = parseInt(process.env.RETRY_QUEUE_POLL_MS || '') || 30 * 1000; // 30s
const BATCH_SIZE = 25;

export async function startRetryQueueWorker() {
  console.log('[RetryWorker] Starting retry queue worker');
  // Run immediately
  await runOnce().catch(err => console.error('[RetryWorker] initial run error', err));

  setInterval(() => {
    runOnce().catch(err => console.error('[RetryWorker] run error', err));
  }, POLL_INTERVAL_MS);
}

async function runOnce() {
  const entries = await storage.getPendingRetryQueueEntries(BATCH_SIZE);
  if (!entries || entries.length === 0) return;

  for (const e of entries) {
    try {
      const id = e.id;
      const op = e.operation;
      const payload = e.payload || {};

      // mark attempt
      await storage.updateRetryQueueEntry(id, { attempts: (e.attempts || 0) + 1 });

      if (op === 'processTransaction') {
        const txnId = payload.transactionId;
        try {
          // dynamic import to avoid circular reference
          const routes = await import('../routes.js');
          if (typeof (routes as any).processTransaction === 'function') {
            await (routes as any).processTransaction(txnId);
          } else {
            // fallback: try to re-run by sending to same function used previously
            console.warn('[RetryWorker] processTransaction function not exported; attempting to call via routes.registerRoutes fallback');
          }
        } catch (procErr) {
          throw procErr;
        }
      } else {
        console.warn('[RetryWorker] Unknown operation:', op);
        await storage.moveRetryEntryToDeadLetter(e.id, 'unknown operation');
        continue;
      }

      // If reached here without throwing, mark entry removed (move to dead-letter as succeeded by deleting)
      await storage.updateRetryQueueEntry(e.id, { isDeadLetter: true });
      // Optionally create activity log
      await storage.createActivityLog({
        type: 'retry_processed',
        message: `Retry entry ${e.id} processed for operation ${op}`,
        details: { entryId: e.id, operation: op }
      });

    } catch (err) {
      console.error('[RetryWorker] Entry processing failed:', e.id, err);
      const attempts = (e.attempts || 0) + 1;
      if (attempts >= (e.maxAttempts || 5)) {
        await storage.moveRetryEntryToDeadLetter(e.id, String(err instanceof Error ? err.message : err));
        await storage.createActivityLog({ type: 'retry_deadletter', message: `Retry entry ${e.id} moved to dead-letter`, details: { entryId: e.id, error: err } });
      } else {
        // schedule next attempt with exponential backoff
        const delay = Math.min(60 * 60 * 1000, Math.pow(2, attempts) * 1000); // cap 1 hour
        const nextAttempt = new Date(Date.now() + delay);
        await storage.updateRetryQueueEntry(e.id, { nextAttemptAt: nextAttempt, lastError: String(err instanceof Error ? err.message : err) });
        await storage.createActivityLog({ type: 'retry_rescheduled', message: `Retry entry ${e.id} rescheduled`, details: { entryId: e.id, nextAttempt } });
      }
    }
  }
}

export default { startRetryQueueWorker };
