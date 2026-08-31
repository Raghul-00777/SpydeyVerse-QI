import { supabase, isSupabaseAvailable } from './supabase';

const LOG_KEY = 'spydey_signature_log';

export type SignatureVerdict = 'authentic' | 'suspicious' | 'forged';

export interface SignatureLogEntry {
  ts: number;
  verdict: SignatureVerdict;
  confidence: number;
  source: 'tamper-demo' | 'manual';
}

/**
 * Records a signature verification attempt:
 *  - always to localStorage (so the Dashboard counter works without a backend)
 *  - best-effort to the shared Supabase `activity_logs` table (so the
 *    Threat Detection module's feed feels connected across modules)
 * Then broadcasts an event so the Dashboard tile updates live.
 */
export function recordVerification(entry: SignatureLogEntry): void {
  try {
    const arr = JSON.parse(localStorage.getItem(LOG_KEY) || '[]') as SignatureLogEntry[];
    arr.push(entry);
    localStorage.setItem(LOG_KEY, JSON.stringify(arr.slice(-500)));
  } catch {
    /* non-blocking */
  }

  if (isSupabaseAvailable()) {
    Promise.resolve(
      supabase.from('activity_logs').insert({
        module: 'digital-signature',
        action: 'verify_signature',
        details: { verdict: entry.verdict, confidence: entry.confidence, source: entry.source },
      }),
    )
      .then(() => {})
      .catch(() => {});
  }

  window.dispatchEvent(new Event('spydey-signature-updated'));
}

export function countVerifiedToday(): number {
  try {
    const arr = JSON.parse(localStorage.getItem(LOG_KEY) || '[]') as SignatureLogEntry[];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const t0 = start.getTime();
    return arr.filter((e) => e.ts >= t0).length;
  } catch {
    return 0;
  }
}
